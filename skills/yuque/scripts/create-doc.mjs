#!/usr/bin/env node

import {
  docsCollectionPath,
  executeFlag,
  getBaseUrl,
  getToken,
  parseArgs,
  printUsage,
  readBodyInputNode,
  request,
  requireKeys,
} from './common.mjs';

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  printUsage([
    'Create a Yuque doc in a repo.',
    '',
    'Usage:',
    '  node create-doc.mjs --group-login team --book-slug handbook --title "Intro" --body "# Hello"',
    '  node create-doc.mjs --book-id 123 --title "Intro" --body-file ./doc.md',
    '',
    'Optional:',
    '  --slug intro',
    '  --public 0|1|2',
    '  --format markdown|html|lake',
    '  --execute',
    '',
    'Defaults to preview mode. Pass --execute to send the request.',
  ]);
  process.exit(0);
}

requireKeys(args, ['title']);

const body = await readBodyInputNode(args);
const payload = {
  title: args.title,
  body,
  format: args.format || 'markdown',
};

if (typeof args.slug === 'string') {
  payload.slug = args.slug;
}

if (typeof args.public === 'string') {
  payload.public = Number(args.public);
}

const baseUrl = getBaseUrl(args);
const token = getToken(args);
const url = `${baseUrl}${docsCollectionPath(args)}`;

await request({
  method: 'POST',
  url,
  token,
  body: payload,
  execute: executeFlag(args),
});
