#!/usr/bin/env node

import { docPath, executeFlag, getBaseUrl, getToken, parseArgs, printUsage, request } from './common.mjs';

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  printUsage([
    'Read a Yuque doc.',
    '',
    'Usage:',
    '  node read-doc.mjs --id 456 [--execute]',
    '  node read-doc.mjs --book-id 123 --doc-id 456 [--execute]',
    '  node read-doc.mjs --group-login team --book-slug handbook --doc-id 456 [--execute]',
    '',
    'Defaults to preview mode. Pass --execute to send the request.',
  ]);
  process.exit(0);
}

const baseUrl = getBaseUrl(args);
const token = getToken(args);
const url = `${baseUrl}${docPath(args)}`;

await request({
  method: 'GET',
  url,
  token,
  execute: executeFlag(args),
});
