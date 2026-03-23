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
    'List Yuque repos for a group or user.',
    '',
    'Usage:',
    '  node list-repos.mjs --owner-type group --login team [--offset 0] [--limit 100] [--execute]',
    '  node list-repos.mjs --owner-type user --login someone [--offset 0] [--limit 100] [--execute]',
    '',
    'Defaults to preview mode. Pass --execute to send the request.',
  ]);
  process.exit(0);
}

requireKeys(args, ['owner-type', 'login']);

if (!['group', 'user'].includes(args['owner-type'])) {
  throw new Error('Expected --owner-type to be group or user');
}

const path =
  args['owner-type'] === 'group'
    ? `/api/v2/groups/${args.login}/repos`
    : `/api/v2/users/${args.login}/repos`;

await request({
  method: 'GET',
  url: buildUrl(getBaseUrl(args), path, {
    offset: args.offset,
    limit: args.limit,
  }),
  token: getToken(args),
  execute: executeFlag(args),
});
