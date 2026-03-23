#!/usr/bin/env node

import {
  buildUrl,
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
    'Search Yuque docs or repos.',
    '',
    'Usage:',
    '  node search.mjs --q keyword --type doc [--scope team/book] [--page 1] [--creator login] [--execute]',
    '',
    'Defaults to preview mode. Pass --execute to send the request.',
  ]);
  process.exit(0);
}

requireKeys(args, ['q', 'type']);

await request({
  method: 'GET',
  url: buildUrl(getBaseUrl(args), '/api/v2/search', {
    q: args.q,
    type: args.type,
    scope: args.scope,
    page: args.page,
    offset: args.offset,
    creator: args.creator,
    creatorId: args['creator-id'],
  }),
  token: getToken(args),
  execute: executeFlag(args),
});
