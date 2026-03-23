#!/usr/bin/env node

import { buildUrl, executeFlag, getBaseUrl, getToken, parseArgs, printUsage, request } from './common.mjs';

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  printUsage([
    'Call the Yuque heartbeat endpoint.',
    '',
    'Usage:',
    '  node heartbeat.mjs [--execute]',
    '',
    'Defaults to preview mode. Pass --execute to send the request.',
  ]);
  process.exit(0);
}

await request({
  method: 'GET',
  url: buildUrl(getBaseUrl(args), '/api/v2/hello'),
  token: getToken(args),
  execute: executeFlag(args),
});
