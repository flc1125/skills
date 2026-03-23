#!/usr/bin/env node

import { executeFlag, getBaseUrl, getToken, parseArgs, printUsage, repoPath, request } from './common.mjs';

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  printUsage([
    'Read a Yuque repo by ID or readable path.',
    '',
    'Usage:',
    '  node read-repo.mjs --book-id 123 [--execute]',
    '  node read-repo.mjs --group-login team --book-slug handbook [--execute]',
    '',
    'Defaults to preview mode. Pass --execute to send the request.',
  ]);
  process.exit(0);
}

const baseUrl = getBaseUrl(args);
const token = getToken(args);
const url = `${baseUrl}${repoPath(args)}`;

await request({
  method: 'GET',
  url,
  token,
  execute: executeFlag(args),
});
