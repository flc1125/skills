#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';

import {
  DEFAULT_BASE_URL,
  parseArgs,
  parseGetnoteJson,
  buildUrl,
  delay,
  ensureSuccessfulResult,
  printJson,
  resolvePathMaybeRelative,
  toPositiveInt,
  DEFAULT_CLIENT_ID,
} from './common.mjs';

function splitArgs(argv) {
  const positionals = [];
  const flags = [];

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (!token.startsWith('--')) {
      positionals.push(token);
      continue;
    }

    flags.push(token);
    const next = argv[index + 1];
    if (next && !next.startsWith('--')) {
      flags.push(next);
      index += 1;
    }
  }

  return {
    positionals,
    args: parseArgs(flags),
  };
}

function redactTokenData(data) {
  if (!data || typeof data !== 'object') {
    return data;
  }

  return {
    ...data,
    api_key: data.api_key ? '<redacted>' : undefined,
    has_api_key: Boolean(data.api_key),
  };
}

async function main() {
  const { positionals, args } = splitArgs(process.argv.slice(2));
  const code = positionals[0];

  if (!code) {
    throw new Error(
      'Usage: node skills/getnote/scripts/oauth-poll.mjs <code> [client_id] [--write-auth-file <path>]',
    );
  }

  const baseUrl = process.env.GETNOTE_BASE_URL || DEFAULT_BASE_URL;
  const clientId = positionals[1] || process.env.GETNOTE_CLIENT_ID || DEFAULT_CLIENT_ID;
  const intervalMs = toPositiveInt(process.env.GETNOTE_OAUTH_INTERVAL_MS, 'GETNOTE_OAUTH_INTERVAL_MS', 5000);
  const maxAttempts = toPositiveInt(process.env.GETNOTE_OAUTH_MAX_ATTEMPTS, 'GETNOTE_OAUTH_MAX_ATTEMPTS', 120);
  const url = buildUrl(baseUrl, '/open/api/v1/oauth/token');

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'device_code',
        client_id: clientId,
        code,
      }),
    });

    const text = await response.text();
    let parsed;
    if (text && text.trim().startsWith('{')) {
      try {
        parsed = parseGetnoteJson(text);
      } catch {
        parsed = { raw: text };
      }
    } else {
      parsed = { raw: text };
    }
    const message = parsed?.data?.msg;

    if (response.ok && parsed?.success && parsed?.data?.api_key) {
      if (typeof args['write-auth-file'] === 'string') {
        const outputPath = resolvePathMaybeRelative(args['write-auth-file']);
        const outputDir = path.dirname(outputPath);
        const exists = await fs
          .stat(outputPath)
          .then(() => true)
          .catch(() => false);

        if (exists) {
          throw new Error(`Refusing to overwrite existing auth file: ${outputPath}`);
        }

        await fs.mkdir(outputDir, { recursive: true });
        await fs.writeFile(
          outputPath,
          JSON.stringify(
            {
              version: 1,
              api_key: parsed.data.api_key,
              client_id: parsed.data.client_id || clientId,
              base_url: baseUrl,
            },
            null,
            2,
          ),
        );
      }

      printJson({
        ok: true,
        attempts: attempt,
        data: redactTokenData(parsed.data),
        wrote_auth_file: args['write-auth-file']
          ? resolvePathMaybeRelative(args['write-auth-file'])
          : null,
      });
      return;
    }

    if (message === 'authorization_pending') {
      await delay(intervalMs);
      continue;
    }

    if (message === 'rejected') {
      printJson({
        ok: false,
        attempts: attempt,
        error: 'user rejected authorization',
        data: parsed,
      });
      process.exit(2);
    }

    if (message === 'expired_token') {
      printJson({
        ok: false,
        attempts: attempt,
        error: 'device code expired',
        data: parsed,
      });
      process.exit(3);
    }

    if (message === 'already_consumed') {
      printJson({
        ok: false,
        attempts: attempt,
        error: 'device code already consumed',
        data: parsed,
      });
      process.exit(4);
    }

    const result = {
      status: response.status,
      ok: response.ok,
      data: parsed,
    };

    ensureSuccessfulResult(result, 'Get 笔记 OAuth token poll');

    printJson({
      ok: false,
      attempts: attempt,
      error: 'unexpected OAuth response',
      data: parsed,
    });
    process.exit(5);
  }

  printJson({
    ok: false,
    error: 'poll timeout',
    attempts: maxAttempts,
  });
  process.exit(6);
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
