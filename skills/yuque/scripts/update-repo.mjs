#!/usr/bin/env node

import {
  buildUrl,
  executeFlag,
  getBaseUrl,
  getToken,
  parseArgs,
  printUsage,
  readBodyInputNode,
  repoPath,
  request,
  toNumber,
} from './common.mjs';

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  printUsage([
    'Update Yuque repo metadata.',
    '',
    'Usage:',
    '  node update-repo.mjs --book-id 123 --name Handbook [--execute]',
    '  node update-repo.mjs --group-login team --book-slug handbook --description "New desc" [--execute]',
    '',
    'Optional:',
    '  --slug new-slug',
    '  --public 0|1|2',
    '  --toc "- [Title](slug)"',
    '  --toc-file ./toc.md',
    '  --execute',
    '',
    'Defaults to preview mode. Pass --execute to send the request.',
  ]);
  process.exit(0);
}

const body = {};

for (const key of ['name', 'slug', 'description']) {
  if (typeof args[key] === 'string') {
    body[key] = args[key];
  }
}

if (typeof args.public === 'string') {
  body.public = toNumber(args.public, 'public');
}

if (typeof args.toc === 'string') {
  body.toc = args.toc;
}

if (typeof args['toc-file'] === 'string') {
  const bodyArgs = {
    'body-file': args['toc-file'],
  };
  body.toc = await readBodyInputNode(bodyArgs);
}

if (Object.keys(body).length === 0) {
  throw new Error('Provide at least one repo field to update');
}

await request({
  method: 'PUT',
  url: buildUrl(getBaseUrl(args), repoPath(args)),
  token: getToken(args),
  body,
  execute: executeFlag(args),
});
