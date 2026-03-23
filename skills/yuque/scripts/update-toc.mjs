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
  tocPath,
} from './common.mjs';

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  printUsage([
    'Run a non-destructive Yuque TOC update.',
    '',
    'Usage:',
    '  node update-toc.mjs --book-id 123 --action appendNode --action-mode child --target-uuid parent --doc-id 456',
    '  node update-toc.mjs --group-login team --book-slug handbook --action editNode --action-mode sibling --node-uuid nodeA --title "New title"',
    '',
    'Optional:',
    '  --doc-ids 1,2,3',
    '  --type DOC|LINK|TITLE',
    '  --url https://example.com',
    '  --open-window 0|1',
    '  --visible 0|1',
    '  --execute',
    '',
    'Dangerous action removeNode is intentionally blocked in this script.',
  ]);
  process.exit(0);
}

requireKeys(args, ['action', 'action-mode']);

if (args.action === 'removeNode') {
  throw new Error('removeNode is guarded. Use remove-toc-node-preflight.mjs instead.');
}

const payload = {
  action: args.action,
  action_mode: args['action-mode'],
};

if (typeof args['target-uuid'] === 'string') {
  payload.target_uuid = args['target-uuid'];
}

if (typeof args['node-uuid'] === 'string') {
  payload.node_uuid = args['node-uuid'];
}

if (typeof args['doc-id'] === 'string') {
  payload.doc_ids = [toNumber(args['doc-id'], 'doc-id')];
}

if (typeof args['doc-ids'] === 'string') {
  payload.doc_ids = args['doc-ids'].split(',').filter(Boolean).map((value) => toNumber(value, 'doc-ids'));
}

for (const key of ['type', 'title', 'url']) {
  if (typeof args[key] === 'string') {
    payload[key] = args[key];
  }
}

if (typeof args['open-window'] === 'string') {
  payload.open_window = toNumber(args['open-window'], 'open-window');
}

if (typeof args.visible === 'string') {
  payload.visible = toNumber(args.visible, 'visible');
}

await request({
  method: 'PUT',
  url: buildUrl(getBaseUrl(args), tocPath(args)),
  token: getToken(args),
  body: payload,
  execute: executeFlag(args),
});
