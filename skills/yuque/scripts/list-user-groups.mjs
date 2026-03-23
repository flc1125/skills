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
    'List groups for a Yuque user.',
    '',
    'Usage:',
    '  node list-user-groups.mjs --id user-login-or-id [--role 0|1] [--offset 0] [--execute]',
    '',
    'Defaults to preview mode. Pass --execute to send the request.',
  ]);
  process.exit(0);
}

requireKeys(args, ['id']);

await request({
  method: 'GET',
  url: buildUrl(getBaseUrl(args), `/api/v2/users/${args.id}/groups`, {
    role: args.role,
    offset: args.offset,
  }),
  token: getToken(args),
  execute: executeFlag(args),
});
