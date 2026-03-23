#!/usr/bin/env node

import {
  executeFlag,
  getBaseUrl,
  getToken,
  parseArgs,
  printUsage,
  request,
  requireKeys,
  tocPath,
} from './common.mjs';

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  printUsage([
    'Move or edit a Yuque TOC node without deleting it.',
    '',
    'Usage:',
    '  node move-toc-node.mjs --book-id 123 --node-uuid nodeA --target-uuid parentB --action-mode child',
    '  node move-toc-node.mjs --group-login team --book-slug handbook --node-uuid nodeA --target-uuid siblingB --action-mode sibling --prepend',
    '',
    'Optional:',
    '  --title "New node title"',
    '  --doc-id 456',
    '  --execute',
    '',
    'Defaults to preview mode. Pass --execute to send the request.',
  ]);
  process.exit(0);
}

requireKeys(args, ['node-uuid', 'target-uuid', 'action-mode']);

const payload = {
  action: args.prepend ? 'prependNode' : 'editNode',
  action_mode: args['action-mode'],
  node_uuid: args['node-uuid'],
  target_uuid: args['target-uuid'],
};

if (typeof args.title === 'string') {
  payload.title = args.title;
}

if (typeof args['doc-id'] === 'string') {
  payload.doc_ids = [Number(args['doc-id'])];
}

const baseUrl = getBaseUrl(args);
const token = getToken(args);
const url = `${baseUrl}${tocPath(args)}`;

await request({
  method: 'PUT',
  url,
  token,
  body: payload,
  execute: executeFlag(args),
});
