#!/usr/bin/env node

import { buildUrl, logPreflight, parseArgs, printUsage, requireKeys } from './common.mjs';

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  printUsage([
    'Prepare a preflight plan for removing a Yuque group member.',
    '',
    'Usage:',
    '  node remove-group-member-preflight.mjs --group-login team --id 42',
  ]);
  process.exit(0);
}

requireKeys(args, ['group-login', 'id']);

logPreflight({
  action: 'remove-group-member',
  target: {
    group_login: args['group-login'],
    member_id: args.id,
  },
  endpoint: buildUrl('https://www.yuque.com', `/api/v2/groups/${args['group-login']}/users/${args.id}`),
  method: 'DELETE',
  impact: 'Removes the member from the group and may revoke access to private repos and docs.',
  reversible: 'No direct API undo is defined. Re-adding the member may not restore prior state.',
  saferAlternative: 'Downgrade the member role first if reduced access is sufficient.',
});
