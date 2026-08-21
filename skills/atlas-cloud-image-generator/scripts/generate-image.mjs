#!/usr/bin/env node

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const DEFAULT_BASE_URL = 'https://api.atlascloud.ai';
const DEFAULT_MODEL = 'google/nano-banana-pro/text-to-image';
const DEFAULT_AUTH_PATH = '~/.config/flc1125/skills/atlas-cloud-image-generator/auth.json';
const DEFAULT_POLL_ATTEMPTS = 24;
const SUPPORTED_MODELS = new Set([DEFAULT_MODEL]);
const ASPECT_RATIOS = new Set(['1:1', '3:2', '2:3', '3:4', '4:3', '4:5', '5:4', '9:16', '16:9', '21:9']);
const RESOLUTIONS = new Set(['1k', '2k', '4k']);
const OUTPUT_FORMATS = new Set(['default', 'png', 'jpeg']);
const VALUE_FLAGS = new Set([
  'prompt',
  'model',
  'aspect',
  'resolution',
  'output-format',
  'output',
  'base-url',
  'auth-file',
  'poll-attempts',
]);
const BOOLEAN_FLAGS = new Set(['execute', 'web-search', 'help']);
const WORKSPACE_ROOT = fs.realpathSync.native(process.cwd());

function printUsage() {
  console.log([
    'Generate an image through Atlas Cloud.',
    '',
    'Usage:',
    '  node skills/atlas-cloud-image-generator/scripts/generate-image.mjs --prompt "..." [options]',
    '',
    'Options:',
    '  --prompt <text>          Required generation prompt',
    `  --model <id>             Model (default: ${DEFAULT_MODEL})`,
    '  --aspect <ratio>         Aspect ratio (default: 1:1)',
    '  --resolution <value>     1k | 2k | 4k (default: 1k)',
    '  --output-format <value>  default | png | jpeg (default: default)',
    '  --web-search             Enable web search grounding',
    '  --output <path>          Save first output inside the current workspace',
    `  --base-url <url>         API origin (default: ${DEFAULT_BASE_URL})`,
    `  --auth-file <path>       Auth file (default: ${DEFAULT_AUTH_PATH})`,
    `  --poll-attempts <n>      Prediction GET limit, 1-60 (default: ${DEFAULT_POLL_ATTEMPTS})`,
    '  --execute                Submit exactly one generation request',
    '  --help                   Show this help',
    '',
    'Preview mode is the default.',
  ].join('\n'));
}

function parseArgs(argv) {
  const args = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith('--')) {
      throw new Error(`Unexpected positional argument: ${token}`);
    }

    const key = token.slice(2);
    if (BOOLEAN_FLAGS.has(key)) {
      args[key] = true;
      continue;
    }
    if (!VALUE_FLAGS.has(key)) {
      throw new Error(`Unknown option: --${key}`);
    }

    const value = argv[index + 1];
    if (!value || value.startsWith('--')) {
      throw new Error(`Expected a value after --${key}`);
    }
    args[key] = value;
    index += 1;
  }

  return args;
}

function requireNonEmpty(value, label) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`Missing required argument: --${label}`);
  }
  return value.trim();
}

function parsePollAttempts(value) {
  if (value === undefined) {
    return DEFAULT_POLL_ATTEMPTS;
  }
  if (!/^\d+$/.test(value)) {
    throw new Error('--poll-attempts must be an integer from 1 to 60');
  }
  const parsed = Number(value);
  if (parsed < 1 || parsed > 60) {
    throw new Error('--poll-attempts must be an integer from 1 to 60');
  }
  return parsed;
}

function validateChoice(value, choices, label) {
  if (!choices.has(value)) {
    throw new Error(`Invalid --${label} value: ${value}. Use: ${[...choices].join(', ')}`);
  }
}

function expandPath(inputPath) {
  if (inputPath.startsWith('~/')) {
    return path.join(os.homedir(), inputPath.slice(2));
  }
  return path.resolve(inputPath);
}

function resolveOutputPath(outputPath) {
  const resolved = path.resolve(outputPath);
  let existingParent = path.dirname(resolved);

  while (!fs.existsSync(existingParent)) {
    const nextParent = path.dirname(existingParent);
    if (nextParent === existingParent) {
      throw new Error(`Could not resolve output parent: ${resolved}`);
    }
    existingParent = nextParent;
  }

  const realParent = fs.realpathSync.native(existingParent);
  const realTarget = path.resolve(realParent, path.relative(existingParent, resolved));
  const relative = path.relative(WORKSPACE_ROOT, realTarget);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Output path must stay inside the current workspace: ${WORKSPACE_ROOT}`);
  }
  if (fs.existsSync(realTarget)) {
    throw new Error(`Refusing to overwrite existing file: ${realTarget}`);
  }
  return realTarget;
}

function loadAuth(authPath) {
  if (!fs.existsSync(authPath)) {
    return null;
  }

  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(authPath, 'utf8'));
  } catch (error) {
    throw new Error(`Invalid JSON in auth file ${authPath}: ${error.message}`);
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error(`Auth file must contain a JSON object: ${authPath}`);
  }
  return parsed;
}

function normalizeBaseUrl(baseUrl) {
  let parsed;
  try {
    parsed = new URL(baseUrl);
  } catch {
    throw new Error(`Invalid --base-url: ${baseUrl}`);
  }
  if (parsed.protocol !== 'https:' && parsed.hostname !== '127.0.0.1' && parsed.hostname !== 'localhost') {
    throw new Error('API base URL must use HTTPS');
  }
  return parsed.toString().replace(/\/+$/, '');
}

function buildRequest(args) {
  const model = args.model || DEFAULT_MODEL;
  const aspectRatio = args.aspect || '1:1';
  const resolution = (args.resolution || '1k').toLowerCase();
  const outputFormat = args['output-format'] || 'default';

  validateChoice(model, SUPPORTED_MODELS, 'model');
  validateChoice(aspectRatio, ASPECT_RATIOS, 'aspect');
  validateChoice(resolution, RESOLUTIONS, 'resolution');
  validateChoice(outputFormat, OUTPUT_FORMATS, 'output-format');

  const payload = {
    model,
    prompt: requireNonEmpty(args.prompt, 'prompt'),
    aspect_ratio: aspectRatio,
    resolution,
    output_format: outputFormat,
  };
  if (args['web-search']) {
    payload.enable_web_search = true;
  }
  return payload;
}

function unwrap(body) {
  if (body && typeof body === 'object' && body.data && typeof body.data === 'object' && !Array.isArray(body.data)) {
    return body.data;
  }
  return body;
}

function safeError(body, fallback) {
  const candidate = unwrap(body);
  for (const value of [candidate?.message, candidate?.error?.message, candidate?.error, body?.message]) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim().slice(0, 400);
    }
  }
  return fallback;
}

async function readJson(response, operation) {
  const text = await response.text();
  let body = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      throw new Error(`${operation} returned non-JSON data with HTTP ${response.status}`);
    }
  }
  if (!response.ok) {
    throw new Error(`${operation} failed with HTTP ${response.status}: ${safeError(body, response.statusText)}`);
  }
  return unwrap(body);
}

async function submitOnce(baseUrl, apiKey, payload) {
  let response;
  try {
    response = await fetch(`${baseUrl}/api/v1/model/generateImage`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(60_000),
    });
  } catch (error) {
    throw new Error(`Generation submission did not return a response; it was not retried: ${error.message}`);
  }
  return readJson(response, 'Generation submission');
}

function predictionId(body) {
  const id = body?.id ?? body?.prediction_id ?? body?.request_id;
  return id === undefined || id === null ? null : String(id);
}

function predictionStatus(body) {
  return String(body?.status || '').toLowerCase();
}

function outputUrls(body) {
  const candidates = [body?.outputs, body?.output, body?.images];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate
        .map((item) => (typeof item === 'string' ? item : item?.url))
        .filter((item) => typeof item === 'string' && item.length > 0);
    }
    if (typeof candidate === 'string') {
      return [candidate];
    }
  }
  return [];
}

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function pollPrediction(baseUrl, apiKey, id, maxAttempts) {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    if (attempt > 1) {
      await sleep(Math.min(5_000, 1_000 * 2 ** (attempt - 2)));
    }

    const response = await fetch(
      `${baseUrl}/api/v1/model/prediction/${encodeURIComponent(id)}`,
      {
        headers: { Authorization: `Bearer ${apiKey}` },
        signal: AbortSignal.timeout(30_000),
      },
    );
    const prediction = await readJson(response, 'Prediction read');
    const status = predictionStatus(prediction);
    if (['completed', 'succeeded', 'success'].includes(status)) {
      return prediction;
    }
    if (['failed', 'canceled', 'cancelled'].includes(status)) {
      throw new Error(`Prediction ${id} ended with status ${status}: ${safeError(prediction, 'no failure message')}`);
    }
  }
  throw new Error(`Prediction ${id} did not finish within ${maxAttempts} GET attempts`);
}

function redactUrl(value) {
  try {
    const parsed = new URL(value);
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return '<redacted>';
  }
}

async function downloadResult(resultUrl, destination) {
  const response = await fetch(resultUrl, {
    signal: AbortSignal.timeout(60_000),
  });
  if (!response.ok) {
    throw new Error(`Result download failed with HTTP ${response.status}`);
  }
  const bytes = Buffer.from(await response.arrayBuffer());
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, bytes, { flag: 'wx' });
}

async function execute(args, baseUrl, auth, payload, outputPath, maxAttempts) {
  const apiKey = process.env.ATLASCLOUD_API_KEY || auth?.api_key;
  if (!apiKey || typeof apiKey !== 'string') {
    throw new Error('Missing ATLASCLOUD_API_KEY and auth file api_key');
  }

  const submitted = await submitOnce(baseUrl, apiKey, payload);
  const id = predictionId(submitted);
  let completed = submitted;
  const initialStatus = predictionStatus(submitted);
  if (!['completed', 'succeeded', 'success'].includes(initialStatus)) {
    if (!id) {
      throw new Error('Generation submission did not return a prediction ID');
    }
    console.error(`Submitted prediction ${id}; polling with bounded GET requests.`);
    completed = await pollPrediction(baseUrl, apiKey, id, maxAttempts);
  }

  const urls = outputUrls(completed);
  if (urls.length === 0) {
    throw new Error(`Prediction ${id || '<synchronous>'} completed without an output URL`);
  }
  if (outputPath) {
    await downloadResult(urls[0], outputPath);
  }

  console.log(JSON.stringify({
    mode: 'execute',
    prediction_id: id,
    status: predictionStatus(completed),
    outputs: urls.map(redactUrl),
    output_path: outputPath,
  }, null, 2));
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printUsage();
    return;
  }

  const payload = buildRequest(args);
  const maxAttempts = parsePollAttempts(args['poll-attempts']);
  const authPath = expandPath(args['auth-file'] || DEFAULT_AUTH_PATH);
  const auth = loadAuth(authPath);
  const baseUrl = normalizeBaseUrl(args['base-url'] || auth?.base_url || DEFAULT_BASE_URL);
  const outputPath = args.output ? resolveOutputPath(args.output) : null;

  if (!args.execute) {
    console.log(JSON.stringify({
      mode: 'preview',
      endpoint: `${baseUrl}/api/v1/model/generateImage`,
      payload,
      output_path: outputPath,
      poll_attempts: maxAttempts,
    }, null, 2));
    return;
  }

  await execute(args, baseUrl, auth, payload, outputPath, maxAttempts);
}

main().catch((error) => {
  console.error(`[ERROR] ${error.message}`);
  process.exit(1);
});
