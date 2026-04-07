#!/usr/bin/env node

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export const DEFAULT_BASE_URL = 'https://openapi.biji.com';
export const DEFAULT_CLIENT_ID = 'cli_a1b2c3d4e5f6789012345678abcdef90';
export const DEFAULT_CONFIG_ROOT = path.join('~', '.config', 'flc1125', 'skills', 'getnote');
export const DEFAULT_AUTH_PATH = path.join(DEFAULT_CONFIG_ROOT, 'auth.json');

const BIG_INT_FIELDS_PATTERN =
  /"(id|note_id|tag_id|post_id|next_cursor|parent_id|follow_id|live_id)"\s*:\s*(-?\d+)/g;

export function printJson(value) {
  console.log(JSON.stringify(value, null, 2));
}

export function printUsage(lines) {
  console.log(lines.join('\n'));
}

export function parseArgs(argv) {
  const args = {};

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];

    if (!token.startsWith('--')) {
      continue;
    }

    const key = token.slice(2);
    const next = argv[i + 1];

    if (!next || next.startsWith('--')) {
      args[key] = true;
      continue;
    }

    args[key] = next;
    i += 1;
  }

  return args;
}

export function requireKeys(args, keys) {
  const missing = keys.filter((key) => args[key] === undefined);

  if (missing.length > 0) {
    throw new Error(`Missing required arguments: ${missing.join(', ')}`);
  }
}

export function expandHomePath(inputPath) {
  if (typeof inputPath !== 'string' || !inputPath.startsWith('~/')) {
    return inputPath;
  }

  return path.join(os.homedir(), inputPath.slice(2));
}

export function resolvePathMaybeRelative(inputPath) {
  const expanded = expandHomePath(inputPath);

  if (path.isAbsolute(expanded)) {
    return expanded;
  }

  return path.join(process.cwd(), expanded);
}

function sanitizeJsonText(text) {
  let output = '';
  let inString = false;
  let escaped = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];

    if (inString) {
      if (escaped) {
        output += char;
        escaped = false;
        continue;
      }

      if (char === '\\') {
        output += char;
        escaped = true;
        continue;
      }

      if (char === '"') {
        output += char;
        inString = false;
        continue;
      }

      const code = char.charCodeAt(0);
      if (code <= 0x1f) {
        if (char === '\n') {
          output += '\\n';
        } else if (char === '\r') {
          output += '\\r';
        } else if (char === '\t') {
          output += '\\t';
        } else {
          output += `\\u${code.toString(16).padStart(4, '0')}`;
        }
        continue;
      }

      output += char;
      continue;
    }

    if (char === '"') {
      inString = true;
    }

    output += char;
  }

  return output;
}

export function parseGetnoteJson(text) {
  if (typeof text !== 'string' || !text.trim()) {
    return null;
  }

  const normalized = sanitizeJsonText(text).replace(
    BIG_INT_FIELDS_PATTERN,
    '"$1":"$2"',
  );

  return JSON.parse(normalized);
}

function tryParseResponseText(text) {
  if (typeof text !== 'string' || !text.trim()) {
    return null;
  }

  const trimmed = text.trim();

  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      return parseGetnoteJson(text);
    } catch {
      return text;
    }
  }

  return text;
}

function readAuthFile(authFile, { tolerateInvalid = false } = {}) {
  if (!fs.existsSync(authFile)) {
    return {};
  }

  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(authFile, 'utf8'));
  } catch {
    if (tolerateInvalid) {
      return {};
    }

    throw new Error(
      `Get笔记 auth file is invalid JSON: ${authFile}\n` +
        'Create or fix it with:\n' +
        '{\n' +
        '  "version": 1,\n' +
        '  "api_key": "gk_live_replace_me",\n' +
        `  "client_id": "${DEFAULT_CLIENT_ID}"\n` +
        '}',
    );
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    if (tolerateInvalid) {
      return {};
    }

    throw new Error(`Get笔记 auth file must be a JSON object: ${authFile}`);
  }

  return parsed;
}

export function resolveAuth(
  args = {},
  { execute = false, requireApiKey = true, bestEffortAuthFile = false } = {},
) {
  const authFile = resolvePathMaybeRelative(args['auth-file'] || DEFAULT_AUTH_PATH);
  const shouldReadAuthFile = bestEffortAuthFile || execute;
  const authConfig = shouldReadAuthFile
    ? readAuthFile(authFile, { tolerateInvalid: bestEffortAuthFile })
    : {};

  return {
    authFile,
    apiKey: args['api-key'] || authConfig.api_key || process.env.GETNOTE_API_KEY || null,
    clientId:
      args['client-id'] ||
      authConfig.client_id ||
      process.env.GETNOTE_CLIENT_ID ||
      DEFAULT_CLIENT_ID,
    ownerId: args['owner-id'] || authConfig.owner_id || process.env.GETNOTE_OWNER_ID || null,
    baseUrl:
      args['base-url'] ||
      authConfig.base_url ||
      process.env.GETNOTE_BASE_URL ||
      DEFAULT_BASE_URL,
  };
}

export function missingAuthMessage(authFile) {
  return (
    `Missing Get笔记 auth. Expected a local auth file at ${authFile}\n` +
    'Minimal auth.json example:\n' +
    '{\n' +
    '  "version": 1,\n' +
    '  "api_key": "gk_live_replace_me",\n' +
    `  "client_id": "${DEFAULT_CLIENT_ID}"\n` +
    '}\n' +
    'Only set this up after a real execution path proves auth is missing.'
  );
}

function buildHeaders(
  auth,
  { hasJsonBody = false, includeAuthHeader = true, includeClientId = true, extraHeaders = {} } = {},
) {
  const headers = {
    Accept: 'application/json',
    ...extraHeaders,
  };

  if (includeAuthHeader && auth.apiKey) {
    headers.Authorization = auth.apiKey;
  }

  if (includeClientId && auth.clientId) {
    headers['X-Client-ID'] = auth.clientId;
  }

  if (hasJsonBody) {
    headers['Content-Type'] = 'application/json';
  }

  return headers;
}

function redactHeaders(headers) {
  const redacted = { ...headers };

  if (redacted.Authorization) {
    redacted.Authorization = '<redacted>';
  }

  return redacted;
}

export function buildUrl(baseUrl, routePath, query = {}) {
  const url = new URL(routePath, baseUrl);

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === false) {
      continue;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        url.searchParams.append(key, String(item));
      }
      continue;
    }

    url.searchParams.set(key, String(value));
  }

  return url.toString();
}

export function isSuccessfulResult(result) {
  if (!result) {
    return true;
  }

  if (result.mode === 'preview') {
    return true;
  }

  if (typeof result.ok !== 'boolean') {
    return true;
  }

  if (!result.ok) {
    return false;
  }

  if (result.data && typeof result.data === 'object' && 'success' in result.data) {
    return result.data.success !== false;
  }

  return true;
}

function summarizeApiFailure(result) {
  const error = result?.data?.error;

  if (error && typeof error === 'object') {
    const parts = [];

    if (error.message) {
      parts.push(String(error.message));
    }

    if (error.code !== undefined) {
      parts.push(`code=${error.code}`);
    }

    if (error.reason) {
      parts.push(`reason=${error.reason}`);
    }

    if (parts.length > 0) {
      return parts.join(' ');
    }
  }

  if (result && result.status) {
    return `HTTP ${result.status}`;
  }

  return 'unknown Get笔记 failure';
}

export function ensureSuccessfulResult(result, context = 'Get笔记 request') {
  if (!isSuccessfulResult(result)) {
    throw new Error(`${context} failed: ${summarizeApiFailure(result)}`);
  }

  return result;
}

export async function requestJson({
  method,
  url,
  auth,
  body,
  execute = false,
  requiresAuth = true,
  includeClientId = true,
  extraHeaders = {},
}) {
  const headers = buildHeaders(auth, {
    hasJsonBody: body !== undefined,
    includeAuthHeader: requiresAuth,
    includeClientId,
    extraHeaders,
  });

  if (!execute) {
    return {
      mode: 'preview',
      method,
      url,
      headers: redactHeaders(headers),
      body: body ?? null,
    };
  }

  if (requiresAuth && !auth.apiKey) {
    throw new Error(missingAuthMessage(auth.authFile));
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();

  return {
    status: response.status,
    ok: response.ok,
    data: tryParseResponseText(text),
  };
}

export function csvToArray(value) {
  if (typeof value !== 'string' || !value.trim()) {
    return [];
  }

  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function readOptionalText(args, key, fileKey) {
  if (typeof args[key] === 'string') {
    return args[key];
  }

  if (typeof args[fileKey] === 'string') {
    return fs.promises.readFile(resolvePathMaybeRelative(args[fileKey]), 'utf8');
  }

  return undefined;
}

export function toPositiveInt(value, key, fallback) {
  if (value === undefined) {
    return fallback;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`Expected ${key} to be a positive integer`);
  }

  return parsed;
}

export function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
