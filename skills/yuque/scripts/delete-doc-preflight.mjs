#!/usr/bin/env node

import { buildUrl, docPath, logPreflight, parseArgs, printUsage } from './common.mjs';

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  printUsage([
    'Prepare a preflight plan for deleting a Yuque doc.',
    '',
    'Usage:',
    '  node delete-doc-preflight.mjs --book-id 123 --doc-id 456',
    '  node delete-doc-preflight.mjs --group-login team --book-slug handbook --doc-id 456',
  ]);
  process.exit(0);
}

logPreflight({
  action: 'delete-doc',
  target: args,
  endpoint: buildUrl('https://www.yuque.com', docPath(args)),
  method: 'DELETE',
  impact: 'Deletes the target doc. References from TOC, links, and shares may break.',
  reversible: 'No direct API restore flow is defined in this OpenAPI file.',
  saferAlternative: 'Move the doc into an archive section or rename it clearly instead of deleting it.',
});
