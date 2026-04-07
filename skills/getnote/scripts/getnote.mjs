#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import {
  DEFAULT_BASE_URL,
  DEFAULT_CLIENT_ID,
  buildUrl,
  csvToArray,
  delay,
  ensureSuccessfulResult,
  parseArgs,
  printJson,
  printUsage,
  readOptionalText,
  requestJson,
  requireKeys,
  resolveAuth,
  resolvePathMaybeRelative,
  toPositiveInt,
} from './common.mjs';

const MIME_TYPE_BY_EXT = {
  '.gif': { mimeType: 'image/gif', uploadType: 'gif' },
  '.jpg': { mimeType: 'image/jpeg', uploadType: 'jpg' },
  '.jpeg': { mimeType: 'image/jpeg', uploadType: 'jpg' },
  '.png': { mimeType: 'image/png', uploadType: 'png' },
  '.webp': { mimeType: 'image/webp', uploadType: 'webp' },
};

function usage() {
  printUsage([
    'Operate on Get笔记 through the bundled skill script.',
    '',
    'Usage:',
    '  node skills/getnote/scripts/getnote.mjs <command> [options]',
    '',
    'Commands:',
    '  save-text                    Save a plain text note',
    '  save-link                    Save a link note',
    '  save-image                   Upload and save an image note',
    '  task-progress                Check a task or poll until done',
    '  search                       Global semantic recall',
    '  search-knowledge             Knowledge-base semantic recall',
    '  list-notes                   List notes by since_id cursor',
    '  note-detail                  Read note detail',
    '  update-note                  Update a note',
    '  delete-note                  Move a note to trash',
    '  list-knowledge               List owned knowledge bases',
    '  list-subscribed-knowledge    List subscribed knowledge bases',
    '  create-knowledge             Create a knowledge base',
    '  knowledge-notes              List notes under a knowledge base',
    '  knowledge-add                Add notes to a knowledge base',
    '  knowledge-remove             Remove notes from a knowledge base',
    '  knowledge-bloggers           List subscribed bloggers under a knowledge base',
    '  knowledge-blogger-contents   List blogger contents',
    '  knowledge-blogger-detail     Read one blogger content item',
    '  knowledge-lives              List finished lives under a knowledge base',
    '  knowledge-live-detail        Read one live detail item',
    '  add-tags                     Add tags to a note',
    '  delete-tag                   Delete one tag from a note',
    '  oauth-device-code            Start OAuth device flow',
    '',
    'Common options:',
    '  --execute                    Send the live request. Preview mode is default.',
    '  --auth-file <path>           Override auth file path',
    '  --api-key <key>              Override api_key for this run',
    '  --client-id <id>             Override client_id for this run',
    '  --owner-id <id>              Optional owner ID override',
    '  --base-url <url>             Override API base URL',
    '  --help                       Show this help',
  ]);
}

function executeFlag(args) {
  return args.execute === true;
}

function requireNonEmptyStringArg(args, key, label = key) {
  if (typeof args[key] !== 'string' || !args[key].trim()) {
    throw new Error(`Provide --${label} with a value`);
  }
}

function maybeTags(args) {
  const tags = csvToArray(args.tags);
  return tags.length > 0 ? tags : undefined;
}

function firstDefined(...values) {
  for (const value of values) {
    if (value !== undefined) {
      return value;
    }
  }

  return undefined;
}

function extractTaskId(payload) {
  const data = payload?.data;

  if (typeof data?.task_id === 'string') {
    return data.task_id;
  }

  const taskId = data?.tasks?.[0]?.task_id;
  return typeof taskId === 'string' ? taskId : null;
}

function extractTaskStatus(payload) {
  return payload?.data?.status || payload?.status || null;
}

async function apiRequest(args, options) {
  const auth = resolveAuth(args, {
    execute: executeFlag(args),
    requireApiKey: options.requiresAuth ?? true,
  });
  const url = buildUrl(auth.baseUrl, options.routePath, options.query);

  return requestJson({
    method: options.method,
    url,
    auth,
    body: options.body,
    execute: executeFlag(args),
    requiresAuth: options.requiresAuth ?? true,
    includeClientId: options.includeClientId ?? true,
  });
}

async function executeApiRequest(args, options) {
  const result = await apiRequest(args, options);
  ensureSuccessfulResult(result, options.context || options.routePath);
  return result;
}

function summarizeUpload(upload) {
  if (!upload) {
    return null;
  }

  return {
    accessUrl: upload.accessUrl,
    localPath: upload.localPath,
  };
}

function normalizeUploadShape(data) {
  if (data?.data?.tokens?.length) {
    return data.data.tokens[0];
  }

  if (data?.data && typeof data.data === 'object') {
    return data.data;
  }

  throw new Error('Get笔记 upload token response did not contain upload credentials');
}

function inferImageInfo(imagePath) {
  const ext = path.extname(imagePath).toLowerCase();
  const match = MIME_TYPE_BY_EXT[ext];

  if (!match) {
    throw new Error('Unsupported image extension. Use png, jpg, jpeg, gif, or webp');
  }

  return match;
}

async function uploadImage(authArgs, imagePath) {
  const resolvedPath = resolvePathMaybeRelative(imagePath);

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Image file not found: ${resolvedPath}`);
  }

  const info = inferImageInfo(resolvedPath);
  const uploadToken = await executeApiRequest(authArgs, {
    method: 'GET',
    routePath: '/open/api/v1/resource/image/upload_token',
    query: {
      mime_type: info.uploadType,
      count: 1,
    },
    context: 'Get笔记 image upload token request',
  });

  const token = normalizeUploadShape(uploadToken.data);
  const form = new FormData();

  form.append('key', token.object_key);
  form.append('OSSAccessKeyId', token.accessid);
  form.append('policy', token.policy || '');
  form.append('signature', token.signature || '');
  form.append('callback', token.callback || '');
  form.append('Content-Type', token.oss_content_type || info.mimeType);
  form.append(
    'file',
    new Blob([fs.readFileSync(resolvedPath)], { type: info.mimeType }),
    path.basename(resolvedPath),
  );

  const response = await fetch(token.host, {
    method: 'POST',
    body: form,
  });

  if (response.status !== 200 && response.status !== 204) {
    throw new Error(`Get笔记 OSS upload failed: HTTP ${response.status}`);
  }

  return {
    accessUrl: token.access_url,
    localPath: resolvedPath,
  };
}

async function pollTask(args, taskId) {
  const intervalMs = toPositiveInt(args['interval-ms'], 'interval-ms', 15000);
  const timeoutMs = toPositiveInt(args['timeout-ms'], 'timeout-ms', 600000);
  const startedAt = Date.now();
  let attempts = 0;

  while (true) {
    attempts += 1;

    const progress = await executeApiRequest(args, {
      method: 'POST',
      routePath: '/open/api/v1/resource/note/task/progress',
      body: { task_id: taskId },
      context: 'Get笔记 task progress request',
    });

    const status = extractTaskStatus(progress.data);

    if (status === 'success' || status === 'failed') {
      return {
        attempts,
        final: progress,
      };
    }

    if (Date.now() - startedAt >= timeoutMs) {
      throw new Error(`Timed out waiting for task ${taskId} after ${attempts} checks`);
    }

    await delay(intervalMs);
  }
}

async function handleSaveText(args) {
  const content = await readOptionalText(args, 'content', 'content-file');

  if (typeof content !== 'string' || !content.trim()) {
    throw new Error('Provide --content or --content-file');
  }

  const body = {
    title: args.title,
    content,
    note_type: 'plain_text',
    tags: maybeTags(args),
    parent_id: firstDefined(args['parent-id'], undefined),
  };

  const result = await executeApiRequest(args, {
    method: 'POST',
    routePath: '/open/api/v1/resource/note/save',
    body,
  });

  printJson(result);
}

async function handleSaveLink(args) {
  requireKeys(args, ['url']);
  requireNonEmptyStringArg(args, 'url');

  const content = await readOptionalText(args, 'content', 'content-file');
  const body = {
    title: args.title,
    content,
    note_type: 'link',
    tags: maybeTags(args),
    parent_id: firstDefined(args['parent-id'], undefined),
    link_url: args.url,
  };

  if (!executeFlag(args)) {
    printJson({
      workflow: 'save-link',
      request: await apiRequest(args, {
        method: 'POST',
        routePath: '/open/api/v1/resource/note/save',
        body,
      }),
      polling: args.poll === true ? { mode: 'preview', until: 'success|failed' } : null,
    });
    return;
  }

  const initial = await executeApiRequest(args, {
    method: 'POST',
    routePath: '/open/api/v1/resource/note/save',
    body,
    context: 'Get笔记 link save request',
  });

  if (args.poll !== true) {
    printJson(initial);
    return;
  }

  const taskId = extractTaskId(initial.data);

  if (!taskId) {
    printJson(initial);
    return;
  }

  const progress = await pollTask(args, taskId);
  const noteId = progress.final.data?.data?.note_id;
  let detail = null;

  if (typeof noteId === 'string' && noteId !== '0') {
    detail = await executeApiRequest(args, {
      method: 'GET',
      routePath: '/open/api/v1/resource/note/detail',
      query: { id: noteId },
      context: 'Get笔记 note detail request',
    });
  }

  printJson({
    workflow: 'save-link',
    initial,
    poll: progress,
    detail,
  });
}

async function handleSaveImage(args) {
  const localImage = args.image;
  const remoteImageUrl = args['image-url'];

  if (localImage !== undefined && typeof localImage !== 'string') {
    throw new Error('Provide --image with a local file path');
  }

  if (remoteImageUrl !== undefined && typeof remoteImageUrl !== 'string') {
    throw new Error('Provide --image-url with a value');
  }

  if (!localImage && !remoteImageUrl) {
    throw new Error('Provide --image with a local file');
  }

  if (localImage && remoteImageUrl) {
    throw new Error('Use either --image or --image-url, not both');
  }

  if (remoteImageUrl) {
    throw new Error(
      'Direct --image-url input is not supported by this script. Provide --image with a local file so the signed upload flow stays inside the trusted path.',
    );
  }

  const content = await readOptionalText(args, 'content', 'content-file');
  const baseBody = {
    title: args.title,
    content,
    note_type: 'img_text',
    tags: maybeTags(args),
    parent_id: firstDefined(args['parent-id'], undefined),
  };

  if (!executeFlag(args)) {
    printJson({
      workflow: 'save-image',
      upload:
        typeof localImage === 'string'
          ? {
              mode: 'preview',
              localPath: resolvePathMaybeRelative(localImage),
            }
          : null,
      request: await apiRequest(args, {
        method: 'POST',
        routePath: '/open/api/v1/resource/note/save',
        body: {
          ...baseBody,
          image_urls: ['<uploaded_access_url>'],
        },
      }),
      polling: args.poll === true ? { mode: 'preview', until: 'success|failed' } : null,
    });
    return;
  }

  const upload = localImage ? await uploadImage(args, localImage) : null;
  const imageUrl = upload?.accessUrl;

  const initial = await executeApiRequest(args, {
    method: 'POST',
    routePath: '/open/api/v1/resource/note/save',
    body: {
      ...baseBody,
      image_urls: [imageUrl],
    },
    context: 'Get笔记 image save request',
  });

  if (args.poll !== true) {
    printJson({
      workflow: 'save-image',
      upload: summarizeUpload(upload),
      initial,
    });
    return;
  }

  const taskId = extractTaskId(initial.data);

  if (!taskId) {
    printJson({
      workflow: 'save-image',
      upload: summarizeUpload(upload),
      initial,
    });
    return;
  }

  const progress = await pollTask(args, taskId);
  const noteId = progress.final.data?.data?.note_id;
  let detail = null;

  if (typeof noteId === 'string' && noteId !== '0') {
    detail = await executeApiRequest(args, {
      method: 'GET',
      routePath: '/open/api/v1/resource/note/detail',
      query: { id: noteId },
      context: 'Get笔记 note detail request',
    });
  }

  printJson({
    workflow: 'save-image',
    upload: summarizeUpload(upload),
    initial,
    poll: progress,
    detail,
  });
}

async function handleTaskProgress(args) {
  requireKeys(args, ['task-id']);

  if (args['until-done'] !== true || !executeFlag(args)) {
    const result = await executeApiRequest(args, {
      method: 'POST',
      routePath: '/open/api/v1/resource/note/task/progress',
      body: { task_id: args['task-id'] },
    });
    printJson(result);
    return;
  }

  printJson(await pollTask(args, args['task-id']));
}

async function handleSearch(args) {
  requireKeys(args, ['query']);

  const result = await executeApiRequest(args, {
    method: 'POST',
    routePath: '/open/api/v1/resource/recall',
    body: {
      query: args.query,
      top_k: toPositiveInt(args['top-k'], 'top-k', 3),
    },
  });

  printJson(result);
}

async function handleSearchKnowledge(args) {
  requireKeys(args, ['topic-id', 'query']);

  const result = await executeApiRequest(args, {
    method: 'POST',
    routePath: '/open/api/v1/resource/recall/knowledge',
    body: {
      topic_id: args['topic-id'],
      query: args.query,
      top_k: toPositiveInt(args['top-k'], 'top-k', 3),
    },
  });

  printJson(result);
}

async function handleListNotes(args) {
  const result = await executeApiRequest(args, {
    method: 'GET',
    routePath: '/open/api/v1/resource/note/list',
    query: {
      since_id: args['since-id'] || '0',
    },
  });

  printJson(result);
}

async function handleNoteDetail(args) {
  requireKeys(args, ['note-id']);

  const result = await executeApiRequest(args, {
    method: 'GET',
    routePath: '/open/api/v1/resource/note/detail',
    query: {
      id: args['note-id'],
      image_quality: args['image-quality'],
    },
  });

  printJson(result);
}

async function handleUpdateNote(args) {
  requireKeys(args, ['note-id']);

  const content = await readOptionalText(args, 'content', 'content-file');
  const tags = maybeTags(args);

  if (args.title === undefined && content === undefined && tags === undefined) {
    throw new Error('Provide at least one of --title, --content, --content-file, or --tags');
  }

  const result = await executeApiRequest(args, {
    method: 'POST',
    routePath: '/open/api/v1/resource/note/update',
    body: {
      note_id: args['note-id'],
      title: args.title,
      content,
      tags,
    },
  });

  printJson(result);
}

async function handleDeleteNote(args) {
  requireKeys(args, ['note-id']);

  const result = await executeApiRequest(args, {
    method: 'POST',
    routePath: '/open/api/v1/resource/note/delete',
    body: {
      note_id: args['note-id'],
    },
  });

  printJson(result);
}

async function handleListKnowledge(args) {
  const result = await executeApiRequest(args, {
    method: 'GET',
    routePath: '/open/api/v1/resource/knowledge/list',
    query: {
      page: toPositiveInt(args.page, 'page', 1),
    },
  });

  printJson(result);
}

async function handleListSubscribedKnowledge(args) {
  const result = await executeApiRequest(args, {
    method: 'GET',
    routePath: '/open/api/v1/resource/knowledge/subscribe/list',
    query: {
      page: toPositiveInt(args.page, 'page', 1),
    },
  });

  printJson(result);
}

async function handleCreateKnowledge(args) {
  requireKeys(args, ['name']);

  const result = await executeApiRequest(args, {
    method: 'POST',
    routePath: '/open/api/v1/resource/knowledge/create',
    body: {
      name: args.name,
      description: args.description,
      cover: args.cover || '',
    },
  });

  printJson(result);
}

async function handleKnowledgeNotes(args) {
  requireKeys(args, ['topic-id']);

  const result = await executeApiRequest(args, {
    method: 'GET',
    routePath: '/open/api/v1/resource/knowledge/notes',
    query: {
      topic_id: args['topic-id'],
      page: toPositiveInt(args.page, 'page', 1),
    },
  });

  printJson(result);
}

async function handleKnowledgeAdd(args) {
  requireKeys(args, ['topic-id', 'note-ids']);

  const noteIds = csvToArray(args['note-ids']);
  if (noteIds.length === 0) {
    throw new Error('Expected --note-ids to contain at least one note ID');
  }

  const result = await executeApiRequest(args, {
    method: 'POST',
    routePath: '/open/api/v1/resource/knowledge/note/batch-add',
    body: {
      topic_id: args['topic-id'],
      note_ids: noteIds,
    },
  });

  printJson(result);
}

async function handleKnowledgeRemove(args) {
  requireKeys(args, ['topic-id', 'note-ids']);

  const noteIds = csvToArray(args['note-ids']);
  if (noteIds.length === 0) {
    throw new Error('Expected --note-ids to contain at least one note ID');
  }

  const result = await executeApiRequest(args, {
    method: 'POST',
    routePath: '/open/api/v1/resource/knowledge/note/remove',
    body: {
      topic_id: args['topic-id'],
      note_ids: noteIds,
    },
  });

  printJson(result);
}

async function handleKnowledgeBloggers(args) {
  requireKeys(args, ['topic-id']);

  const result = await executeApiRequest(args, {
    method: 'GET',
    routePath: '/open/api/v1/resource/knowledge/bloggers',
    query: {
      topic_id: args['topic-id'],
      page: toPositiveInt(args.page, 'page', 1),
    },
  });

  printJson(result);
}

async function handleKnowledgeBloggerContents(args) {
  requireKeys(args, ['topic-id', 'follow-id']);

  const result = await executeApiRequest(args, {
    method: 'GET',
    routePath: '/open/api/v1/resource/knowledge/blogger/contents',
    query: {
      topic_id: args['topic-id'],
      follow_id: args['follow-id'],
      page: toPositiveInt(args.page, 'page', 1),
    },
  });

  printJson(result);
}

async function handleKnowledgeBloggerDetail(args) {
  requireKeys(args, ['topic-id', 'post-id']);

  const result = await executeApiRequest(args, {
    method: 'GET',
    routePath: '/open/api/v1/resource/knowledge/blogger/content/detail',
    query: {
      topic_id: args['topic-id'],
      post_id: args['post-id'],
    },
  });

  printJson(result);
}

async function handleKnowledgeLives(args) {
  requireKeys(args, ['topic-id']);

  const result = await executeApiRequest(args, {
    method: 'GET',
    routePath: '/open/api/v1/resource/knowledge/lives',
    query: {
      topic_id: args['topic-id'],
      page: toPositiveInt(args.page, 'page', 1),
    },
  });

  printJson(result);
}

async function handleKnowledgeLiveDetail(args) {
  requireKeys(args, ['topic-id', 'live-id']);

  const result = await executeApiRequest(args, {
    method: 'GET',
    routePath: '/open/api/v1/resource/knowledge/live/detail',
    query: {
      topic_id: args['topic-id'],
      live_id: args['live-id'],
    },
  });

  printJson(result);
}

async function handleAddTags(args) {
  requireKeys(args, ['note-id', 'tags']);
  const tags = maybeTags(args);

  if (!tags || tags.length === 0) {
    throw new Error('Expected --tags to contain at least one tag');
  }

  const result = await executeApiRequest(args, {
    method: 'POST',
    routePath: '/open/api/v1/resource/note/tags/add',
    body: {
      note_id: args['note-id'],
      tags,
    },
  });

  printJson(result);
}

async function handleDeleteTag(args) {
  requireKeys(args, ['note-id', 'tag-id']);

  const result = await executeApiRequest(args, {
    method: 'POST',
    routePath: '/open/api/v1/resource/note/tags/delete',
    body: {
      note_id: args['note-id'],
      tag_id: args['tag-id'],
    },
  });

  printJson(result);
}

async function handleOAuthDeviceCode(args) {
  const auth = resolveAuth(args, {
    execute: false,
    requireApiKey: false,
    bestEffortAuthFile: true,
  });
  const result = await requestJson({
    method: 'POST',
    url: buildUrl(auth.baseUrl, '/open/api/v1/oauth/device/code'),
    auth,
    body: {
      client_id: auth.clientId,
    },
    execute: executeFlag(args),
    requiresAuth: false,
    includeClientId: false,
  });

  ensureSuccessfulResult(result, 'Get笔记 OAuth device code request');
  printJson(result);
}

const handlers = {
  'save-text': handleSaveText,
  'save-link': handleSaveLink,
  'save-image': handleSaveImage,
  'task-progress': handleTaskProgress,
  search: handleSearch,
  'search-knowledge': handleSearchKnowledge,
  'list-notes': handleListNotes,
  'note-detail': handleNoteDetail,
  'update-note': handleUpdateNote,
  'delete-note': handleDeleteNote,
  'list-knowledge': handleListKnowledge,
  'list-subscribed-knowledge': handleListSubscribedKnowledge,
  'create-knowledge': handleCreateKnowledge,
  'knowledge-notes': handleKnowledgeNotes,
  'knowledge-add': handleKnowledgeAdd,
  'knowledge-remove': handleKnowledgeRemove,
  'knowledge-bloggers': handleKnowledgeBloggers,
  'knowledge-blogger-contents': handleKnowledgeBloggerContents,
  'knowledge-blogger-detail': handleKnowledgeBloggerDetail,
  'knowledge-lives': handleKnowledgeLives,
  'knowledge-live-detail': handleKnowledgeLiveDetail,
  'add-tags': handleAddTags,
  'delete-tag': handleDeleteTag,
  'oauth-device-code': handleOAuthDeviceCode,
};

async function main() {
  const command = process.argv[2];

  if (!command || command === '--help' || command === 'help') {
    usage();
    return;
  }

  const args = parseArgs(process.argv.slice(3));

  if (args.help === true) {
    usage();
    return;
  }

  const handler = handlers[command];

  if (!handler) {
    throw new Error(`Unknown command: ${command}`);
  }

  await handler(args);
}

main().catch((error) => {
  console.error(
    JSON.stringify(
      {
        ok: false,
        error: error.message,
      },
      null,
      2,
    ),
  );
  process.exit(1);
});
