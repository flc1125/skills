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
  toNumber,
} from './common.mjs';

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  printUsage([
    'Update a Yuque group member role.',
    '',
    'Usage:',
    '  node update-group-member-role.mjs --group-login team --id 42 --role 1 [--execute]',
    '',
    'Roles:',
    '  0 admin',
    '  1 member',
    '  2 read-only member',
    '',
    'Defaults to preview mode. Pass --execute to send the request.',
  ]);
  process.exit(0);
}

requireKeys(args, ['group-login', 'id', 'role']);

await request({
  method: 'PUT',
  url: buildUrl(getBaseUrl(args), `/api/v2/groups/${args['group-login']}/users/${args.id}`),
  token: getToken(args),
  body: {
    role: toNumber(args.role, 'role'),
  },
  execute: executeFlag(args),
});
