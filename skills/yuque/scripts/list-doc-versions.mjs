#!/usr/bin/env node

import {
  buildUrl,
  docVersionsPath,
  executeFlag,
  getBaseUrl,
  getToken,
  parseArgs,
  printUsage,
  request,
  requireKeys,
} from './common.mjs';

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  printUsage([
    'List Yuque doc versions.',
    '',
    'Usage:',
    '  node list-doc-versions.mjs --doc-id 456 [--offset 0] [--limit 20] [--execute]',
    '',
    'Defaults to preview mode. Pass --execute to send the request.',
  ]);
  process.exit(0);
}

requireKeys(args, ['doc-id']);

await request({
  method: 'GET',
  url: buildUrl(getBaseUrl(args), docVersionsPath(args), {
    doc_id: args['doc-id'],
    offset: args.offset,
    limit: args.limit,
  }),
  token: getToken(args),
  execute: executeFlag(args),
});
