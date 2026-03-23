#!/usr/bin/env node

import { buildUrl, logPreflight, parseArgs, printUsage, requireKeys, tocPath } from './common.mjs';

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  printUsage([
    'Prepare a preflight plan for removing a Yuque TOC node.',
    '',
    'Usage:',
    '  node remove-toc-node-preflight.mjs --book-id 123 --node-uuid nodeA --action-mode sibling',
    '  node remove-toc-node-preflight.mjs --group-login team --book-slug handbook --node-uuid nodeA --action-mode child',
  ]);
  process.exit(0);
}

requireKeys(args, ['node-uuid', 'action-mode']);

logPreflight({
  action: 'remove-toc-node',
  target: {
    ...args,
    action: 'removeNode',
  },
  endpoint: buildUrl('https://www.yuque.com', tocPath(args)),
  method: 'PUT',
  impact: 'Removes a TOC node and may hide docs or entire subtrees from navigation.',
  reversible: 'Only reversible if the prior tree structure is still known and recreated manually.',
  saferAlternative: 'Move the node under an archive branch or set visibility instead of removing it.',
});
