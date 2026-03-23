#!/usr/bin/env node

import { buildUrl, executeFlag, getBaseUrl, getToken, parseArgs, printUsage, request, statsPath } from './common.mjs';

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  printUsage([
    'Read Yuque group statistics.',
    '',
    'Usage:',
    '  node read-statistics.mjs --group-login team --kind summary [--execute]',
    '  node read-statistics.mjs --group-login team --kind members [--execute]',
    '  node read-statistics.mjs --group-login team --kind books [--execute]',
    '  node read-statistics.mjs --group-login team --kind docs [--execute]',
    '',
    'Defaults to preview mode. Pass --execute to send the request.',
  ]);
  process.exit(0);
}

await request({
  method: 'GET',
  url: buildUrl(getBaseUrl(args), statsPath(args)),
  token: getToken(args),
  execute: executeFlag(args),
});
