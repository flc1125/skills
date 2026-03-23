#!/usr/bin/env node

import { buildUrl, docsCollectionPath, executeFlag, getBaseUrl, getToken, parseArgs, printUsage, request } from './common.mjs';

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  printUsage([
    'List docs in a Yuque repo.',
    '',
    'Usage:',
    '  node list-docs.mjs --book-id 123 [--offset 0] [--limit 100] [--execute]',
    '  node list-docs.mjs --group-login team --book-slug handbook [--offset 0] [--limit 100] [--execute]',
    '',
    'Defaults to preview mode. Pass --execute to send the request.',
  ]);
  process.exit(0);
}

await request({
  method: 'GET',
  url: buildUrl(getBaseUrl(args), docsCollectionPath(args), {
    offset: args.offset,
    limit: args.limit,
    optional_properties: args['optional-properties'],
  }),
  token: getToken(args),
  execute: executeFlag(args),
});
