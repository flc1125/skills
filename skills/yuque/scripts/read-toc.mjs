#!/usr/bin/env node

import { executeFlag, getBaseUrl, getToken, parseArgs, printUsage, request, tocPath } from './common.mjs';

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  printUsage([
    'Read a Yuque repo TOC.',
    '',
    'Usage:',
    '  node read-toc.mjs --book-id 123 [--execute]',
    '  node read-toc.mjs --group-login team --book-slug handbook [--execute]',
    '',
    'Defaults to preview mode. Pass --execute to send the request.',
  ]);
  process.exit(0);
}

const baseUrl = getBaseUrl(args);
const token = getToken(args);
const url = `${baseUrl}${tocPath(args)}`;

await request({
  method: 'GET',
  url,
  token,
  execute: executeFlag(args),
});
