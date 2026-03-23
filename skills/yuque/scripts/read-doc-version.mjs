#!/usr/bin/env node

import { buildUrl, docVersionsPath, executeFlag, getBaseUrl, getToken, parseArgs, printUsage, request, requireKeys } from './common.mjs';

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  printUsage([
    'Read a Yuque doc version by version id.',
    '',
    'Usage:',
    '  node read-doc-version.mjs --id 789 [--execute]',
    '',
    'Defaults to preview mode. Pass --execute to send the request.',
  ]);
  process.exit(0);
}

requireKeys(args, ['id']);

await request({
  method: 'GET',
  url: buildUrl(getBaseUrl(args), docVersionsPath(args)),
  token: getToken(args),
  execute: executeFlag(args),
});
