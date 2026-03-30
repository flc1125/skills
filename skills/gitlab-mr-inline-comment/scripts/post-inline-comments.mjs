#!/usr/bin/env node

import fs from 'node:fs/promises';
import process from 'node:process';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

function fail(message) {
  console.error(message);
  process.exit(1);
}

function env(name) {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : '';
}

async function hasGlab() {
  try {
    await execFileAsync('glab', ['version']);
    return true;
  } catch {
    return false;
  }
}

function normalizeApiBase() {
  const base = env('GITLAB_API') || env('CI_API_V4_URL');
  if (!base) {
    fail('Missing GitLab API base URL. Set GITLAB_API or CI_API_V4_URL.');
  }
  return base.replace(/\/+$/, '');
}

function requiredContext() {
  const token = env('REVIEWDOG_GITLAB_API_TOKEN') || env('GITLAB_TOKEN');
  const projectPath = env('CI_PROJECT_PATH');
  const mrIid = env('CI_MERGE_REQUEST_IID');
  const headSha = env('CI_COMMIT_SHA');

  if (!token) fail('Missing GitLab token. Set REVIEWDOG_GITLAB_API_TOKEN or GITLAB_TOKEN.');
  if (!projectPath) fail('Missing CI_PROJECT_PATH.');
  if (!mrIid) fail('Missing CI_MERGE_REQUEST_IID.');
  if (!headSha) fail('Missing CI_COMMIT_SHA.');

  return { token, projectPath, mrIid, headSha };
}

function assertCommentShape(comment, index) {
  if (!comment || typeof comment !== 'object') {
    fail(`Comment ${index} is not an object.`);
  }
  if (!comment.path || typeof comment.path !== 'string') {
    fail(`Comment ${index} is missing a string path.`);
  }
  if (!Number.isInteger(comment.line) || comment.line < 1) {
    fail(`Comment ${index} has an invalid line.`);
  }
  if (!comment.body || typeof comment.body !== 'string') {
    fail(`Comment ${index} is missing a string body.`);
  }
}

async function readComments(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    fail('Input must be a JSON array of comments.');
  }
  parsed.forEach((comment, index) => assertCommentShape(comment, index));
  return parsed;
}

function normalizeGlabHost(hostname) {
  if (!hostname) return '';
  return hostname.replace(/^https?:\/\//, '').replace(/\/+$/, '');
}

function glabBaseArgs(hostname) {
  return hostname ? ['--hostname', hostname] : [];
}

async function runGlabJson(args, { input } = {}) {
  const { stdout } = await execFileAsync('glab', args, {
    input,
    maxBuffer: 10 * 1024 * 1024,
  });
  return stdout ? JSON.parse(stdout) : null;
}

async function runGlabApi(hostname, endpoint, { method, input, paginate = false } = {}) {
  const args = [...glabBaseArgs(hostname), 'api', endpoint, '--output', 'json'];
  if (method) {
    args.push('--method', method);
  }
  if (paginate) {
    args.push('--paginate');
  }
  if (input !== undefined) {
    args.push('--input', '-');
  }
  return runGlabJson(args, { input });
}

async function resolveContextWithGlab() {
  const hostname = normalizeGlabHost(env('GITLAB_HOST'));
  const mrIid = env('CI_MERGE_REQUEST_IID');
  const headSha = env('CI_COMMIT_SHA');

  const repo = await runGlabApi(hostname, 'projects/:fullpath');
  const projectPath = repo.path_with_namespace;
  if (!projectPath) {
    fail('Unable to resolve GitLab project path with glab.');
  }

  if (!mrIid) {
    fail('Missing CI_MERGE_REQUEST_IID. This script currently expects an MR pipeline context.');
  }
  if (!headSha) {
    fail('Missing CI_COMMIT_SHA. This script currently expects an MR pipeline context.');
  }

  return {
    hostname,
    projectPath,
    mrIid,
    headSha,
  };
}

async function getMergeRequestViaGlab(hostname, mrIid) {
  return runGlabApi(hostname, `projects/:fullpath/merge_requests/${mrIid}`);
}

async function listAllDiscussionsViaGlab(hostname, mrIid) {
  return runGlabApi(
    hostname,
    `projects/:fullpath/merge_requests/${mrIid}/discussions?per_page=100`,
    { paginate: true },
  );
}

async function postCommentViaGlab(hostname, mrIid, payload) {
  try {
    await runGlabApi(
      hostname,
      `projects/:fullpath/merge_requests/${mrIid}/discussions`,
      {
        method: 'POST',
        input: JSON.stringify(payload),
      },
    );
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function getMergeRequestViaHttp(apiBase, token, projectPath, mrIid) {
  const project = encodeURIComponent(projectPath);
  const url = `${apiBase}/projects/${project}/merge_requests/${mrIid}`;
  const res = await fetch(url, {
    headers: { 'PRIVATE-TOKEN': token },
  });
  if (!res.ok) {
    fail(`Failed to load merge request context: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

async function listAllDiscussionsViaHttp(apiBase, token, projectPath, mrIid) {
  const project = encodeURIComponent(projectPath);
  let page = 1;
  const out = [];

  for (;;) {
    const url = `${apiBase}/projects/${project}/merge_requests/${mrIid}/discussions?page=${page}&per_page=100`;
    const res = await fetch(url, {
      headers: { 'PRIVATE-TOKEN': token },
    });
    if (!res.ok) {
      fail(`Failed to list discussions: ${res.status} ${res.statusText}`);
    }
    const items = await res.json();
    out.push(...items);

    const nextPage = res.headers.get('x-next-page');
    if (!nextPage) break;
    page = Number(nextPage);
    if (!page) break;
  }

  return out;
}

function normalizeBody(body) {
  return body.replace(/\r\n/g, '\n').trimEnd();
}

function hasDuplicate(discussions, comment) {
  const targetBody = normalizeBody(comment.body);
  return discussions.some((discussion) =>
    (discussion.notes || []).some((note) => {
      const position = note.position || {};
      return (
        position.new_path === comment.path &&
        Number(position.new_line) === comment.line &&
        normalizeBody(note.body || '') === targetBody
      );
    }),
  );
}

async function postCommentViaHttp(apiBase, token, projectPath, mrIid, payload) {
  const project = encodeURIComponent(projectPath);
  const url = `${apiBase}/projects/${project}/merge_requests/${mrIid}/discussions`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'PRIVATE-TOKEN': token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    return { ok: false, error: `${res.status} ${res.statusText}: ${text}` };
  }

  return { ok: true };
}

function buildPayload(comment, mr, headSha) {
  const baseSha =
    mr.diff_refs?.base_sha ||
    mr.diff_refs?.start_sha ||
    mr.sha ||
    mr.target_branch_sha;
  const startSha = mr.diff_refs?.start_sha || baseSha;
  if (!baseSha || !startSha) {
    fail('Missing MR diff refs. This script expects GitLab MR diff metadata with base/start SHA.');
  }

  const position = {
    position_type: 'text',
    base_sha: baseSha,
    start_sha: startSha,
    head_sha: headSha,
    new_path: comment.path,
    new_line: comment.line,
  };

  if (comment.old_path && Number.isInteger(comment.old_line) && comment.old_line > 0) {
    position.old_path = comment.old_path;
    position.old_line = comment.old_line;
  }

  return {
    body: comment.body,
    position,
  };
}

async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    fail('Usage: post-inline-comments.mjs <comments.json>');
  }

  const comments = await readComments(filePath);
  const useGlab = await hasGlab();

  let projectPath;
  let mrIid;
  let headSha;
  let mr;
  let discussions;
  let postComment;

  if (useGlab) {
    const ctx = await resolveContextWithGlab();
    projectPath = ctx.projectPath;
    mrIid = ctx.mrIid;
    headSha = ctx.headSha;
    mr = await getMergeRequestViaGlab(ctx.hostname, mrIid);
    discussions = await listAllDiscussionsViaGlab(ctx.hostname, mrIid);
    postComment = (payload) => postCommentViaGlab(ctx.hostname, mrIid, payload);
  } else {
    const apiBase = normalizeApiBase();
    const { token, projectPath: path, mrIid: iid, headSha: sha } = requiredContext();
    projectPath = path;
    mrIid = iid;
    headSha = sha;
    mr = await getMergeRequestViaHttp(apiBase, token, projectPath, mrIid);
    discussions = await listAllDiscussionsViaHttp(apiBase, token, projectPath, mrIid);
    postComment = (payload) => postCommentViaHttp(apiBase, token, projectPath, mrIid, payload);
  }

  let posted = 0;
  let skipped = 0;
  let failed = 0;

  for (const comment of comments) {
    if (hasDuplicate(discussions, comment)) {
      skipped += 1;
      continue;
    }

    const payload = buildPayload(comment, mr, headSha);
    const result = await postComment(payload);
    if (result.ok) {
      posted += 1;
      continue;
    }

    failed += 1;
    console.error(`Failed to post ${comment.path}:${comment.line}: ${result.error}`);
  }

  console.log(JSON.stringify({ projectPath, mrIid, posted, skipped, failed }, null, 2));
}

main().catch((error) => {
  fail(error instanceof Error ? error.stack || error.message : String(error));
});
