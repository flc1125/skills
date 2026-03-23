#!/usr/bin/env node

import { buildUrl, logPreflight, parseArgs, printUsage, repoPath } from './common.mjs';

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  printUsage([
    'Prepare a preflight plan for deleting a Yuque repo.',
    '',
    'Usage:',
    '  node delete-repo-preflight.mjs --book-id 123',
    '  node delete-repo-preflight.mjs --group-login team --book-slug handbook',
  ]);
  process.exit(0);
}

logPreflight({
  action: 'delete-repo',
  target: args,
  endpoint: buildUrl('https://www.yuque.com', repoPath(args)),
  method: 'DELETE',
  impact: 'Deletes the target repo and all user-facing navigation to its docs.',
  reversible: 'No direct restore flow is defined in this OpenAPI file.',
  saferAlternative: 'Mark the repo deprecated, change visibility, or move content elsewhere first.',
});
