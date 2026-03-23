#!/usr/bin/env node

import {
  docPath,
  executeFlag,
  getBaseUrl,
  getToken,
  parseArgs,
  printUsage,
  readBodyInputNode,
  request,
} from './common.mjs';

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  printUsage([
    'Update a Yuque doc.',
    '',
    'Usage:',
    '  node update-doc.mjs --book-id 123 --doc-id 456 --body-file ./doc.md',
    '  node update-doc.mjs --group-login team --book-slug handbook --doc-id 456 --title "New title" --body "# Updated"',
    '',
    'Optional:',
    '  --slug new-slug',
    '  --public 0|1|2',
    '  --format markdown|html|lake',
    '  --execute',
    '',
    'Defaults to preview mode. Pass --execute to send the request.',
  ]);
  process.exit(0);
}

const payload = {};

if (typeof args.title === 'string') {
  payload.title = args.title;
}

if (typeof args.slug === 'string') {
  payload.slug = args.slug;
}

if (typeof args.public === 'string') {
  payload.public = Number(args.public);
}

if (typeof args.format === 'string') {
  payload.format = args.format;
}

if (args.body !== undefined || args['body-file'] !== undefined) {
  payload.body = await readBodyInputNode(args);
}

if (Object.keys(payload).length === 0) {
  throw new Error('Provide at least one of --title, --slug, --public, --format, --body, or --body-file');
}

const baseUrl = getBaseUrl(args);
const token = getToken(args);
const url = `${baseUrl}${docPath(args)}`;

await request({
  method: 'PUT',
  url,
  token,
  body: payload,
  execute: executeFlag(args),
});
