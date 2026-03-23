#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_BASE_URL = 'https://www.yuque.com';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SKILL_ROOT = path.resolve(__dirname, '..');
const DEFAULT_ENV_PATH = path.join(SKILL_ROOT, '.env');

loadEnvFile(DEFAULT_ENV_PATH);

function loadEnvFile(envPath) {
  if (!fs.existsSync(envPath)) {
    return;
  }

  const content = fs.readFileSync(envPath, 'utf8');

  for (const rawLine of content.split('\n')) {
    const line = rawLine.trim();

    if (!line || line.startsWith('#')) {
      continue;
    }

    const separatorIndex = line.indexOf('=');

    if (separatorIndex <= 0) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if (!key || process.env[key] !== undefined) {
      continue;
    }

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
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

export function printUsage(lines) {
  console.log(lines.join('\n'));
}

export function requireAny(args, groups) {
  for (const group of groups) {
    if (group.every((key) => args[key] !== undefined)) {
      return;
    }
  }

  const summary = groups.map((group) => group.join(', ')).join(' OR ');
  throw new Error(`Missing required argument set: ${summary}`);
}

export function requireKeys(args, keys) {
  const missing = keys.filter((key) => args[key] === undefined);

  if (missing.length > 0) {
    throw new Error(`Missing required arguments: ${missing.join(', ')}`);
  }
}

export async function readBodyInputNode(args) {
  if (typeof args.body === 'string') {
    return args.body;
  }

  if (typeof args['body-file'] === 'string') {
    const fs = await import('node:fs/promises');
    return fs.readFile(args['body-file'], 'utf8');
  }

  throw new Error('Provide --body or --body-file');
}

export function getBaseUrl(args) {
  return args['base-url'] || process.env.YUQUE_BASE_URL || DEFAULT_BASE_URL;
}

export function getToken(args) {
  return args.token || process.env.YUQUE_TOKEN || process.env.YUQUE_AUTH_TOKEN;
}

export function toNumber(value, key) {
  const parsed = Number(value);

  if (Number.isNaN(parsed)) {
    throw new Error(`Expected ${key} to be a number`);
  }

  return parsed;
}

export function toBooleanFlag(value) {
  if (typeof value === 'boolean') {
    return value;
  }

  if (value === 'true' || value === '1') {
    return true;
  }

  if (value === 'false' || value === '0') {
    return false;
  }

  throw new Error(`Expected boolean-like value, got ${value}`);
}

export function buildHeaders(token, hasJsonBody = false) {
  const headers = {
    Accept: 'application/json',
  };

  if (token) {
    headers['X-Auth-Token'] = token;
  }

  if (hasJsonBody) {
    headers['Content-Type'] = 'application/json';
  }

  return headers;
}

export function repoPath(args) {
  if (args['book-id']) {
    return `/api/v2/repos/${args['book-id']}`;
  }

  if (args['group-login'] && args['book-slug']) {
    return `/api/v2/repos/${args['group-login']}/${args['book-slug']}`;
  }

  throw new Error('Provide --book-id or both --group-login and --book-slug');
}

export function docPath(args) {
  if (args.id) {
    return `/api/v2/repos/docs/${args.id}`;
  }

  if (args['book-id'] && args['doc-id']) {
    return `/api/v2/repos/${args['book-id']}/docs/${args['doc-id']}`;
  }

  if (args['group-login'] && args['book-slug'] && args['doc-id']) {
    return `/api/v2/repos/${args['group-login']}/${args['book-slug']}/docs/${args['doc-id']}`;
  }

  throw new Error(
    'Provide --id, or --book-id with --doc-id, or --group-login with --book-slug and --doc-id',
  );
}

export function docsCollectionPath(args) {
  return `${repoPath(args)}/docs`;
}

export function tocPath(args) {
  return `${repoPath(args)}/toc`;
}

export function buildUrl(baseUrl, path, query = {}) {
  const url = new URL(path, baseUrl);

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

export function docVersionsPath(args) {
  if (args['doc-id']) {
    return '/api/v2/doc_versions';
  }

  if (args.id) {
    return `/api/v2/doc_versions/${args.id}`;
  }

  throw new Error('Provide --doc-id for version list, or --id for version detail');
}

export function statsPath(args) {
  requireKeys(args, ['group-login', 'kind']);

  const suffixMap = {
    summary: '',
    members: '/members',
    books: '/books',
    docs: '/docs',
  };

  if (!(args.kind in suffixMap)) {
    throw new Error('Expected --kind to be one of summary, members, books, docs');
  }

  return `/api/v2/groups/${args['group-login']}/statistics${suffixMap[args.kind]}`;
}

export function logPreflight({ action, target, endpoint, method, impact, reversible, saferAlternative }) {
  console.log(
    JSON.stringify(
      {
        mode: 'preflight',
        action,
        target,
        endpoint,
        method,
        impact,
        reversible,
        saferAlternative,
      },
      null,
      2,
    ),
  );
}

export async function request({ method, url, token, body, execute = false }) {
  const hasJsonBody = body !== undefined;
  const headers = buildHeaders(token, hasJsonBody);

  if (!execute) {
    console.log(
      JSON.stringify(
        {
          mode: 'preview',
          method,
          url,
          headers,
          body: body ?? null,
        },
        null,
        2,
      ),
    );
    return;
  }

  if (!token) {
    throw new Error('Missing token. Set --token or YUQUE_TOKEN');
  }

  const response = await fetch(url, {
    method,
    headers,
    body: hasJsonBody ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = text;
  }

  console.log(
    JSON.stringify(
      {
        status: response.status,
        ok: response.ok,
        data: parsed,
      },
      null,
      2,
    ),
  );

  if (!response.ok) {
    process.exitCode = 1;
  }
}

export function executeFlag(args) {
  return args.execute === true;
}
