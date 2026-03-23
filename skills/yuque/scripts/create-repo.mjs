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
  toBooleanFlag,
  toNumber,
} from './common.mjs';

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  printUsage([
    'Create a Yuque repo for a group or user.',
    '',
    'Usage:',
    '  node create-repo.mjs --owner-type group --login team --name Handbook --slug handbook [--execute]',
    '  node create-repo.mjs --owner-type user --login someone --name Notes --slug notes [--public 1] [--execute]',
    '',
    'Optional:',
    '  --description "Repo description"',
    '  --public 0|1|2',
    '  --enhanced-privacy true|false',
    '  --execute',
    '',
    'Defaults to preview mode. Pass --execute to send the request.',
  ]);
  process.exit(0);
}

requireKeys(args, ['owner-type', 'login', 'name', 'slug']);

if (!['group', 'user'].includes(args['owner-type'])) {
  throw new Error('Expected --owner-type to be group or user');
}

const path =
  args['owner-type'] === 'group'
    ? `/api/v2/groups/${args.login}/repos`
    : `/api/v2/users/${args.login}/repos`;

const body = {
  name: args.name,
  slug: args.slug,
};

if (typeof args.description === 'string') {
  body.description = args.description;
}

if (typeof args.public === 'string') {
  body.public = toNumber(args.public, 'public');
}

if (typeof args['enhanced-privacy'] === 'string') {
  body.enhancedPrivacy = toBooleanFlag(args['enhanced-privacy']);
}

await request({
  method: 'POST',
  url: buildUrl(getBaseUrl(args), path),
  token: getToken(args),
  body,
  execute: executeFlag(args),
});
