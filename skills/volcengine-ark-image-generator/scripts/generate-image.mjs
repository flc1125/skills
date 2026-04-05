#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const DEFAULT_BASE_URL = 'https://ark.cn-beijing.volces.com/api/v3';
const DEFAULT_T2I_MODEL = 'doubao-seedream-5-0-lite-260128';
const DEFAULT_I2I_MODEL = 'doubao-seededit-3-0-i2i-250628';
const DEFAULT_CONFIG_ROOT = path.join(
  process.env.HOME || '',
  '.config',
  'flc1125',
  'skills',
  'volcengine-ark-image-generator',
);
const DEFAULT_AUTH_PATH = path.join(DEFAULT_CONFIG_ROOT, 'auth.json');

function printUsage() {
  console.log(
    [
      'Generate images with Volcengine Ark using a local auth.json config.',
      '',
      'Usage:',
      '  node generate-image.mjs --prompt "..." [options]',
      '',
      'Options:',
      '  --prompt <text>           Prompt text for image generation',
      '  --image <value>           Optional single reference image: URL, data URI, or local path',
      '  --model <id>              Model override',
      '  --size <value>            Optional size override',
      '  --response-format <fmt>   url | b64_json (default: url)',
      '  --output-format <fmt>     jpeg | png',
      '  --watermark <bool>        true | false',
      '  --output <path>           Save the first returned image to a local path',
      `  --base-url <url>          Override base URL (default: ${DEFAULT_BASE_URL})`,
      `  --auth-file <path>        Override auth file (default: ${DEFAULT_AUTH_PATH})`,
      '  --api-key <key>           Override auth.json api_key for this invocation only',
      '  --execute                 Actually send the request',
      '  --help                    Show this help',
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

    if (!next || next.startsWith('--')) {
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

function parseBool(value) {
  if (typeof value === 'boolean') {
    return value;
  }

  const normalized = String(value).trim().toLowerCase();
  if (['1', 'true', 'yes', 'y'].includes(normalized)) {
    return true;
  }
  if (['0', 'false', 'no', 'n'].includes(normalized)) {
    return false;
  }
  throw new Error(`Expected a boolean-like value, got: ${value}`);
}

function chooseModel(args) {
  if (typeof args.model === 'string' && args.model.trim()) {
    return args.model.trim();
  }
  if (args.image) {
    return DEFAULT_I2I_MODEL;
  }
  return DEFAULT_T2I_MODEL;
}

function resolvePathMaybeRelative(inputPath) {
  const expanded = inputPath.startsWith('~/')
    ? path.join(process.env.HOME || '', inputPath.slice(2))
    : inputPath;

  if (path.isAbsolute(expanded)) {
    return expanded;
  }

  return path.join(process.cwd(), expanded);
}

function imageToPayloadValue(imageValue) {
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

function buildPayload(args, model) {
  const payload = {
    model,
    prompt: args.prompt,
    response_format: args['response-format'] || 'url',
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

  if (args.watermark !== undefined) {
    payload.watermark = parseBool(args.watermark);
  }

  return payload;
}

function preview(baseUrl, payload, outputPath) {
  console.log(
    JSON.stringify(
      {
        mode: 'preview',
        base_url: baseUrl,
        payload,
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

function resolveOutputPath(outputPath) {
  const resolved = resolvePathMaybeRelative(outputPath);
  fs.mkdirSync(path.dirname(resolved), { recursive: true });
  return resolved;
}

async function writeOutput(resultUrl, resultB64, outputPath, apiKey) {
  const destination = resolveOutputPath(outputPath);

  if (resultB64) {
    fs.writeFileSync(destination, Buffer.from(resultB64, 'base64'));
    return destination;
  }

  if (resultUrl) {
    const response = await fetch(resultUrl, {
      headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : undefined,
    });
    const arrayBuffer = await response.arrayBuffer();
    ensureOk(response, `download failed from ${resultUrl}`);
    fs.writeFileSync(destination, Buffer.from(arrayBuffer));
    return destination;
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

  if (outputPath) {
    writtenPath = await writeOutput(resultUrl, resultB64, outputPath, apiKey);
  }

  console.log(
    JSON.stringify(
      {
        mode: 'execute',
        model: payload.model,
        response_format: payload.response_format || null,
        url: resultUrl,
        output_path: writtenPath,
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
  const payload = buildPayload(args, model);
  const baseUrl = args['base-url'] || DEFAULT_BASE_URL;

  if (!args.execute) {
    preview(baseUrl, payload, args.output);
    return;
  }

  const authPath = args['auth-file']
    ? resolvePathMaybeRelative(args['auth-file'])
    : DEFAULT_AUTH_PATH;
  const auth = loadAuthFile(authPath);
  const apiKey = args['api-key'] || auth.api_key || '';
  const executeBaseUrl = args['base-url'] || auth.base_url || DEFAULT_BASE_URL;

  await execute(executeBaseUrl, apiKey, payload, args.output);
}

main().catch((error) => {
  console.error(`[ERROR] ${error.message}`);
  process.exit(1);
});
