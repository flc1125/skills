#!/usr/bin/env node

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const DEFAULT_BASE_URL = 'https://ark.cn-beijing.volces.com/api/v3';
const DEFAULT_T2I_MODEL = 'doubao-seedream-5-0-lite-260128';
const DEFAULT_I2I_MODEL = 'doubao-seededit-3-0-i2i-250628';
const DEFAULT_CONFIG_ROOT = path.join('~', '.config', 'flc1125', 'skills', 'volcengine-ark-image-generator');
const DEFAULT_AUTH_PATH = path.join(DEFAULT_CONFIG_ROOT, 'auth.json');
const WORKSPACE_ROOT = fs.realpathSync.native(process.cwd());
const VALUE_REQUIRED_KEYS = new Set([
  'prompt',
  'image',
  'model',
  'size',
  'response-format',
  'output-format',
  'output',
  'base-url',
  'auth-file',
  'api-key',
]);
const MODEL_CAPABILITIES = {
  'doubao-seedream-3.0-t2i': {
    image: false,
    outputFormat: false,
  },
  'doubao-seedream-5-0-lite-260128': {
    image: false,
    outputFormat: true,
  },
  'doubao-seededit-3-0-i2i-250628': {
    image: true,
    outputFormat: false,
  },
};
const MODEL_ALIASES = {
  'doubao-seedream-5.0-lite': 'doubao-seedream-5-0-lite-260128',
  'doubao-seededit-3.0-i2i': 'doubao-seededit-3-0-i2i-250628',
};

function printUsage() {
  console.log(
    [
      'Generate images with Volcengine Ark using a local auth.json config.',
      '',
      'Usage:',
      '  node skills/volcengine-ark-image-generator/scripts/generate-image.mjs --prompt "..." [options]',
      '',
      'Options:',
      '  --prompt <text>           Prompt text for image generation',
      '  --image <value>           Optional single reference image: URL, data URI, or local path',
      '  --model <id>              Model override: exact version ID or a supported family alias',
      '  --size <value>            Optional size override',
      '  --response-format <fmt>   url | b64_json (default: url)',
      '  --output-format <fmt>     jpeg | png',
      '  --output <path>           Save the first returned image inside the current workspace without overwriting',
      `  --base-url <url>          Override base URL (default: ${DEFAULT_BASE_URL})`,
      `  --auth-file <path>        Override auth file (default: ${DEFAULT_AUTH_PATH})`,
      '  --api-key <key>           Override auth.json api_key for this invocation only',
      '  --execute                 Actually send the request',
      '  --help                    Show this help',
      '',
      'Supported family aliases:',
      `  doubao-seedream-5.0-lite -> ${MODEL_ALIASES['doubao-seedream-5.0-lite']}`,
      `  doubao-seededit-3.0-i2i  -> ${MODEL_ALIASES['doubao-seededit-3.0-i2i']}`,
      '',
      'The script defaults to preview mode.',
    ].join('\n'),
  );
}

function parseArgs(argv) {
  const args = {};

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];

    if (token === '--help') {
      args.help = true;
      continue;
    }

    if (!token.startsWith('--')) {
      continue;
    }

    const key = token.slice(2);
    const next = argv[i + 1];

    if (key === 'execute' && next && !next.startsWith('--')) {
      throw new Error('--execute does not take a value');
    }

    if (!next || next.startsWith('--')) {
      if (VALUE_REQUIRED_KEYS.has(key)) {
        throw new Error(`Expected a value after --${key}`);
      }
      args[key] = true;
      continue;
    }

    args[key] = next;
    i += 1;
  }

  return args;
}

function requirePrompt(args) {
  if (typeof args.prompt !== 'string' || !args.prompt.trim()) {
    throw new Error('Missing required argument: --prompt');
  }
}

function normalizeModelId(model) {
  return MODEL_ALIASES[model] || model;
}

function chooseModel(args) {
  if (typeof args.model === 'string' && args.model.trim()) {
    return normalizeModelId(args.model.trim());
  }
  if (args.image) {
    return DEFAULT_I2I_MODEL;
  }
  return DEFAULT_T2I_MODEL;
}

function resolvePathMaybeRelative(inputPath) {
  const homeDir = os.homedir();
  const expanded = inputPath.startsWith('~/')
    ? homeDir
      ? path.join(homeDir, inputPath.slice(2))
      : (() => {
          throw new Error('Could not determine the user home directory for ~/ path expansion');
        })()
    : inputPath;

  if (path.isAbsolute(expanded)) {
    return expanded;
  }

  return path.join(process.cwd(), expanded);
}

function imageToPayloadValue(imageValue) {
  if (typeof imageValue !== 'string') {
    throw new Error('Expected --image to have a string value');
  }

  if (
    imageValue.startsWith('http://') ||
    imageValue.startsWith('https://') ||
    imageValue.startsWith('data:')
  ) {
    return imageValue;
  }

  const imagePath = resolvePathMaybeRelative(imageValue);

  if (!fs.existsSync(imagePath)) {
    throw new Error(
      `Reference image not found: ${imagePath}. Provide a URL, data URI, or existing file path.`,
    );
  }

  const ext = path.extname(imagePath).toLowerCase();
  const mimeType = (
    {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.webp': 'image/webp',
      '.gif': 'image/gif',
    }[ext] || 'image/png'
  );

  const encoded = fs.readFileSync(imagePath).toString('base64');
  return `data:${mimeType};base64,${encoded}`;
}

function validateArgs(args, model) {
  const capabilities = MODEL_CAPABILITIES[model];

  if (!capabilities) {
    throw new Error(
      `Unsupported or unverified model override: ${model}. Supported executable models: ${Object.keys(
        MODEL_CAPABILITIES,
      ).join(', ')}`,
    );
  }

  if (args.image && !capabilities.image) {
    throw new Error(`Model ${model} does not support --image on this skill's default Ark path`);
  }

  if (args['output-format'] && !capabilities.outputFormat) {
    throw new Error(`Model ${model} does not support --output-format on this skill's default Ark path`);
  }
}

function buildPayload(args, model) {
  const payload = {
    model,
    prompt: args.prompt,
    response_format: args['response-format'] || 'url',
    watermark: false,
  };

  if (args.image) {
    payload.image = imageToPayloadValue(args.image);
  }

  if (args.size) {
    payload.size = args.size;
  } else if (args.image && model === DEFAULT_I2I_MODEL) {
    payload.size = 'adaptive';
  }

  if (args['output-format']) {
    payload.output_format = args['output-format'];
  }

  return payload;
}

function redactImageValue(value) {
  if (typeof value !== 'string') {
    return value;
  }

  if (value.startsWith('http://') || value.startsWith('https://')) {
    return redactUrl(value);
  }

  if (value.startsWith('data:')) {
    const commaIndex = value.indexOf(',');
    const prefix = commaIndex >= 0 ? value.slice(0, commaIndex) : 'data:<unknown>';
    return `${prefix},<redacted>`;
  }

  return value;
}

function redactUrl(url) {
  if (!url) {
    return null;
  }

  try {
    const parsed = new URL(url);
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return '<redacted>';
  }
}

function redactedPayload(payload) {
  const cloned = { ...payload };

  if (cloned.image !== undefined) {
    cloned.image = redactImageValue(cloned.image);
  }

  return cloned;
}

function preview(baseUrl, payload, outputPath) {
  console.log(
    JSON.stringify(
      {
        mode: 'preview',
        base_url: baseUrl,
        payload: redactedPayload(payload),
        output_path: outputPath || null,
      },
      null,
      2,
    ),
  );
}

function loadAuthFile(authPath) {
  if (!fs.existsSync(authPath)) {
    const example = {
      version: 1,
      api_key: 'replace_with_your_ark_api_key',
      base_url: DEFAULT_BASE_URL,
    };

    throw new Error(
      `Missing auth config.\nExpected: ${authPath}\nCreate it with:\n${JSON.stringify(example, null, 2)}`,
    );
  }

  let raw;
  try {
    raw = JSON.parse(fs.readFileSync(authPath, 'utf8'));
  } catch (error) {
    throw new Error(`Invalid JSON in auth config: ${authPath}: ${error.message}`);
  }

  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new Error(`Auth config must be a JSON object: ${authPath}`);
  }

  return raw;
}

function firstDataItem(response) {
  if (!response || typeof response !== 'object') {
    return null;
  }

  const { data } = response;
  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }

  return data[0];
}

function ensureOk(response, bodyText) {
  if (response.ok) {
    return;
  }
  throw new Error(`Ark request failed with ${response.status}: ${bodyText}`);
}

function resolveOutputTarget(outputPath) {
  const resolved = resolvePathMaybeRelative(outputPath);
  let existingParent = path.dirname(resolved);

  while (!fs.existsSync(existingParent)) {
    const nextParent = path.dirname(existingParent);
    if (nextParent === existingParent) {
      throw new Error(`Could not resolve an existing parent directory for output path: ${resolved}`);
    }
    existingParent = nextParent;
  }

  const realParent = fs.realpathSync.native(existingParent);
  const relativeFromParent = path.relative(existingParent, resolved);
  const realTarget = path.resolve(realParent, relativeFromParent);
  const relativeToWorkspace = path.relative(WORKSPACE_ROOT, realTarget);

  if (relativeToWorkspace.startsWith('..') || path.isAbsolute(relativeToWorkspace)) {
    throw new Error(`Output path must stay inside the current workspace: ${WORKSPACE_ROOT}`);
  }

  return {
    requestedPath: resolved,
    realTarget,
  };
}

function resolveOutputPath(outputPath) {
  const { realTarget } = resolveOutputTarget(outputPath);
  fs.mkdirSync(path.dirname(realTarget), { recursive: true });
  return realTarget;
}

function validateOutputPath(outputPath) {
  return resolveOutputTarget(outputPath).realTarget;
}

function ensureOutputDoesNotExist(outputPath) {
  if (fs.existsSync(outputPath)) {
    throw new Error(`Refusing to overwrite existing file: ${outputPath}`);
  }
}

function extensionFromMimeType(mimeType) {
  if (!mimeType) {
    return null;
  }

  const normalized = mimeType.split(';', 1)[0].trim().toLowerCase();
  const mapping = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
  };

  return mapping[normalized] || null;
}

function extensionFromUrl(url) {
  try {
    const pathname = new URL(url).pathname;
    const ext = path.extname(pathname).toLowerCase();
    return ext || null;
  } catch {
    return null;
  }
}

function alignOutputPath(outputPath, preferredExtension) {
  const resolved = resolveOutputPath(outputPath);

  if (!preferredExtension) {
    return resolved;
  }

  const currentExtension = path.extname(resolved).toLowerCase();
  if (!currentExtension) {
    return `${resolved}${preferredExtension}`;
  }

  if (currentExtension === preferredExtension) {
    return resolved;
  }

  return `${resolved.slice(0, -currentExtension.length)}${preferredExtension}`;
}

async function writeOutput(resultUrl, resultB64, outputPath, payload) {
  const requestedPath = resolveOutputPath(outputPath);

  if (resultB64) {
    const preferredExtension =
      extensionFromMimeType(
        payload.output_format === 'png' ? 'image/png' : payload.output_format === 'jpeg' ? 'image/jpeg' : '',
      ) || '.jpg';
    const destination = alignOutputPath(outputPath, preferredExtension);
    ensureOutputDoesNotExist(destination);
    fs.writeFileSync(destination, Buffer.from(resultB64, 'base64'));
    return {
      requestedPath,
      writtenPath: destination,
    };
  }

  if (resultUrl) {
    const response = await fetch(resultUrl);
    if (!response.ok) {
      throw new Error(`Image download failed with ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const preferredExtension =
      extensionFromMimeType(response.headers.get('content-type')) || extensionFromUrl(resultUrl) || '.jpg';
    const destination = alignOutputPath(outputPath, preferredExtension);
    ensureOutputDoesNotExist(destination);
    fs.writeFileSync(destination, Buffer.from(arrayBuffer));
    return {
      requestedPath,
      writtenPath: destination,
    };
  }

  throw new Error('No image data available to write.');
}

function buildUrl(baseUrl) {
  return `${baseUrl.replace(/\/+$/, '')}/images/generations`;
}

async function postJson(url, apiKey, payload) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const bodyText = await response.text();
  ensureOk(response, bodyText);

  try {
    return JSON.parse(bodyText);
  } catch {
    throw new Error(`Expected JSON response from Ark, got: ${bodyText}`);
  }
}

async function execute(baseUrl, apiKey, payload, outputPath) {
  if (!apiKey) {
    throw new Error('Missing api_key. Set it in auth.json or pass --api-key.');
  }

  const response = await postJson(buildUrl(baseUrl), apiKey, payload);
  const item = firstDataItem(response);
  const resultUrl = item && typeof item === 'object' ? item.url || null : null;
  const resultB64 = item && typeof item === 'object' ? item.b64_json || null : null;
  let writtenPath = null;
  let requestedPath = null;

  if (outputPath) {
    const outputInfo = await writeOutput(resultUrl, resultB64, outputPath, payload);
    requestedPath = outputInfo.requestedPath;
    writtenPath = outputInfo.writtenPath;
  }

  console.log(
    JSON.stringify(
      {
        mode: 'execute',
        model: payload.model,
        response_format: payload.response_format || null,
        url: redactUrl(resultUrl),
        requested_output_path: requestedPath,
        output_path: writtenPath,
        output_path_adjusted: Boolean(requestedPath && writtenPath && requestedPath !== writtenPath),
        has_b64_json: Boolean(resultB64),
      },
      null,
      2,
    ),
  );
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printUsage();
    return;
  }

  requirePrompt(args);
  const model = chooseModel(args);
  validateArgs(args, model);
  const payload = buildPayload(args, model);
  const authPath = args['auth-file']
    ? resolvePathMaybeRelative(args['auth-file'])
    : DEFAULT_AUTH_PATH;
  const auth = fs.existsSync(authPath) ? loadAuthFile(authPath) : null;
  const baseUrl = args['base-url'] || auth?.base_url || DEFAULT_BASE_URL;

  if (args.output) {
    validateOutputPath(args.output);
  }

  if (args.execute !== true) {
    preview(baseUrl, payload, args.output);
    return;
  }

  if (!auth) {
    loadAuthFile(authPath);
  }

  const requiredAuth = auth || loadAuthFile(authPath);
  const apiKey = args['api-key'] || requiredAuth.api_key || '';
  const executeBaseUrl = args['base-url'] || requiredAuth.base_url || DEFAULT_BASE_URL;

  await execute(executeBaseUrl, apiKey, payload, args.output);
}

main().catch((error) => {
  console.error(`[ERROR] ${error.message}`);
  process.exit(1);
});
