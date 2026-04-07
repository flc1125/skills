#!/usr/bin/env node

import {
  DEFAULT_BASE_URL,
  buildUrl,
  delay,
  ensureSuccessfulResult,
  printJson,
  toPositiveInt,
  DEFAULT_CLIENT_ID,
} from './common.mjs';

async function main() {
  const code = process.argv[2];

  if (!code) {
    throw new Error('Usage: node skills/getnote/scripts/oauth-poll.mjs <code> [client_id]');
  }

  const baseUrl = process.env.GETNOTE_BASE_URL || DEFAULT_BASE_URL;
  const clientId = process.argv[3] || process.env.GETNOTE_CLIENT_ID || DEFAULT_CLIENT_ID;
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
    const parsed = text && text.trim().startsWith('{') ? JSON.parse(text) : { raw: text };
    const message = parsed?.data?.msg;

    if (response.ok && parsed?.success && parsed?.data?.api_key) {
      printJson({
        ok: true,
        attempts: attempt,
        data: parsed.data,
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

    ensureSuccessfulResult(result, 'Getnote OAuth token poll');

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
