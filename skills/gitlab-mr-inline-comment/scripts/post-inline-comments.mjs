#!/usr/bin/env node

import fs from 'node:fs/promises';
import process from 'node:process';

function fail(message) {
  console.error(message);
  process.exit(1);
}

function parseArgs(argv) {
  const args = {
    apiBase: '',
    token: '',
    tokenFile: '',
    tokenStdin: false,
    input: '',
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    switch (arg) {
      case '--api-base':
        args.apiBase = argv[++i] || '';
        break;
      case '--token':
        args.token = argv[++i] || '';
        break;
      case '--token-file':
        args.tokenFile = argv[++i] || '';
        break;
      case '--token-stdin':
        args.tokenStdin = true;
        break;
      case '--input':
        args.input = argv[++i] || '';
        break;
      default:
        fail(`Unknown argument: ${arg}`);
    }
  }

  if (!args.apiBase) fail('Missing --api-base.');
  if (!args.input) fail('Missing --input.');

  const tokenSources = [Boolean(args.token), Boolean(args.tokenFile), args.tokenStdin].filter(Boolean).length;
  if (tokenSources === 0) {
    fail('Missing token input. Use exactly one of --token, --token-file, or --token-stdin.');
  }
  if (tokenSources > 1) {
    fail('Token input is ambiguous. Use exactly one of --token, --token-file, or --token-stdin.');
  }

  args.apiBase = args.apiBase.replace(/\/+$/, '');
  return args;
}

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

async function resolveToken(args) {
  if (args.token) {
    return args.token;
  }
  if (args.tokenFile) {
    const token = await fs.readFile(args.tokenFile, 'utf8');
    const trimmed = token.trim();
    if (!trimmed) fail('Token file is empty.');
    return trimmed;
  }
  if (args.tokenStdin) {
    const token = (await readStdin()).trim();
    if (!token) fail('No token was provided on stdin.');
    return token;
  }
  fail('Token input is unresolved.');
}

function assertPayloadShape(payload, index) {
  if (!payload || typeof payload !== 'object') {
    fail(`Payload ${index} is not an object.`);
  }
  if (!payload.project || typeof payload.project !== 'string') {
    fail(`Payload ${index} is missing a string project.`);
  }
  if (!Number.isInteger(payload.mr_iid) || payload.mr_iid < 1) {
    fail(`Payload ${index} has an invalid mr_iid.`);
  }
  if (!payload.body || typeof payload.body !== 'string') {
    fail(`Payload ${index} is missing a string body.`);
  }
  if (!payload.position || typeof payload.position !== 'object') {
    fail(`Payload ${index} is missing a position object.`);
  }

  const position = payload.position;
  if (position.position_type !== 'text') {
    fail(`Payload ${index} must use position.position_type="text".`);
  }
  for (const field of ['base_sha', 'start_sha', 'head_sha', 'new_path', 'new_line']) {
    if (!(field in position)) {
      fail(`Payload ${index} is missing position.${field}.`);
    }
  }
  if (!Number.isInteger(position.new_line) || position.new_line < 1) {
    fail(`Payload ${index} has an invalid position.new_line.`);
  }
  if ('old_line' in position && (!Number.isInteger(position.old_line) || position.old_line < 1)) {
    fail(`Payload ${index} has an invalid position.old_line.`);
  }
}

async function readPayloads(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    fail('Input must be a JSON array of payloads.');
  }
  parsed.forEach((payload, index) => assertPayloadShape(payload, index));
  return parsed;
}

async function postPayload(apiBase, token, payload) {
  const project = encodeURIComponent(payload.project);
  const url = `${apiBase}/projects/${project}/merge_requests/${payload.mr_iid}/discussions`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'PRIVATE-TOKEN': token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      body: payload.body,
      position: payload.position,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    return { ok: false, error: `${res.status} ${res.statusText}: ${text}` };
  }

  return { ok: true };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const token = await resolveToken(args);
  const payloads = await readPayloads(args.input);

  let posted = 0;
  let failed = 0;

  for (const payload of payloads) {
    const result = await postPayload(args.apiBase, token, payload);
    if (result.ok) {
      posted += 1;
      continue;
    }

    failed += 1;
    console.error(
      `Failed to post ${payload.project}!${payload.mr_iid} ${payload.position.new_path}:${payload.position.new_line}: ${result.error}`,
    );
  }

  console.log(JSON.stringify({ posted, failed }, null, 2));
}

main().catch((error) => {
  fail(error instanceof Error ? error.stack || error.message : String(error));
});
