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
    'List members in a Yuque group.',
    '',
    'Usage:',
    '  node list-group-members.mjs --group-login team [--offset 0] [--execute]',
    '',
    'Defaults to preview mode. Pass --execute to send the request.',
  ]);
  process.exit(0);
}

requireKeys(args, ['group-login']);

await request({
  method: 'GET',
  url: buildUrl(getBaseUrl(args), `/api/v2/groups/${args['group-login']}/users`, {
    offset: args.offset,
  }),
  token: getToken(args),
  execute: executeFlag(args),
});
