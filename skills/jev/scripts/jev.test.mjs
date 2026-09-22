import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdtemp, readFile, writeFile, readdir, rm, stat, realpath } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(new URL('./jev.mjs', import.meta.url));
const request = {
  state: { message: '请退还重复收取的费用，不要取消订阅。', count: 2, active: true },
  questions: {
    refund: { type: 'noul', instructions: 'Does `message` request a refund?', criteria: { true: 'Refund requested', false: 'No refund requested' } },
    action: { type: 'choice', instructions: { question: 'What is requested in `message`?' }, criteria: { refund: null, cancel: 'Cancel subscription', none: 'Neither' } },
    impact: { type: 'score', instructions: ['How severe is the issue in `message`?'], criteria: ['No impact', { description: 'Limited impact' }, ['Blocking impact']] },
  },
};
const response = {
  model: 'jev-test-pinned',
  answers: {
    refund: { type: 'noul', noul: 0.98 },
    action: { type: 'choice', choice: 'refund', confidence: 0.9, probabilities: { refund: 0.98, cancel: 0.01, none: 0.01 } },
    impact: { type: 'score', score: 1.1, confidence: 0.8, probabilities: { 0: 0, 1: 0.9, 2: 0.1 }, legend: { 0: 'No impact', 1: 'Limited impact', 2: 'Blocking impact' } },
  },
  usage: { input_tokens: 100, output_tokens: 20 },
};

async function fixture(t, config = {}) {
  const directory = await realpath(await mkdtemp(join(tmpdir(), 'jev-test-')));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const configPath = join(directory, 'config.json');
  await writeFile(configPath, JSON.stringify(config));
  const env = { ...process.env, JEV_CONFIG_FILE: configPath };
  for (const key of Object.keys(env)) if (key.startsWith('TYPESAFE_')) delete env[key];
  return {
    directory, configPath,
    run(args = [], input = request, overrides = {}) {
      return new Promise((resolveRun, reject) => {
        const child = spawn(process.execPath, [script, ...args], { env: { ...env, ...overrides }, cwd: directory, stdio: ['pipe', 'pipe', 'pipe'] });
        let stdout = '';
        let stderr = '';
        child.stdout.setEncoding('utf8').on('data', (chunk) => { stdout += chunk; });
        child.stderr.setEncoding('utf8').on('data', (chunk) => { stderr += chunk; });
        child.on('error', reject);
        child.stdin.on('error', () => {});
        child.on('close', (code) => {
          try { resolveRun({ code, stdout, stderr, result: stdout ? JSON.parse(stdout) : undefined }); }
          catch (error) { reject(error); }
        });
        child.stdin.end(typeof input === 'string' ? input : JSON.stringify(input));
      });
    },
  };
}

async function server(t, handler) {
  const requests = [];
  const service = createServer(async (req, res) => {
    let body = '';
    req.setEncoding('utf8');
    for await (const chunk of req) body += chunk;
    requests.push({ url: req.url, authorization: req.headers.authorization, body: JSON.parse(body) });
    await handler(req, res, requests.length);
  });
  await new Promise((resolveListen, reject) => {
    service.once('error', reject);
    service.listen(0, '127.0.0.1', resolveListen);
  });
  t.after(() => new Promise((resolveClose) => { service.closeAllConnections(); service.close(resolveClose); }));
  return { baseUrl: `http://127.0.0.1:${service.address().port}`, requests };
}

test('offline validation accepts structured questions without credentials and creates no outputs', async (t) => {
  const f = await fixture(t);
  const result = await f.run(['--validate-only']);
  assert.equal(result.code, 0);
  assert.deepEqual(result.result, { valid: true, model: 'jev-latest', question_count: 3, evaluated: false });
  assert.deepEqual(await readdir(f.directory), ['config.json']);
  const missing = await f.run();
  assert.equal(missing.code, 2);
  assert.equal(missing.result.error.code, 'MISSING_API_KEY');
});

test('configuration priority, URL normalization and masked offline check', async (t) => {
  const f = await fixture(t, { api_key: 'file-secret', base_url: 'https://file.example/gateway/', model: 'file-model' });
  const result = await f.run(['config', 'check'], '', { TYPESAFE_API_KEY: 'env-secret', TYPESAFE_BASE_URL: 'https://env.example/prefix///', TYPESAFE_MODEL: 'env-model' });
  assert.equal(result.code, 0);
  assert.equal(result.result.base_url, 'https://env.example/prefix');
  assert.equal(result.result.model, 'env-model');
  assert.equal(result.result.api_key_set, true);
  assert.doesNotMatch(result.stdout + result.stderr, /file-secret|env-secret/);
  const explicit = await f.run(['--validate-only'], { ...request, model: 'request-model' }, { TYPESAFE_MODEL: 'env-model' });
  assert.equal(explicit.result.model, 'request-model');
});

test('invalid input and config fail locally with machine-readable errors', async (t) => {
  const f = await fixture(t);
  const cases = [
    '{broken json',
    { ...request, questions: {} },
    { ...request, api_key: 'must-not-be-accepted' },
    { ...request, questions: { q: { type: 'score', instructions: 'Rate', criteria: ['Only one'] } } },
    { ...request, questions: { q: { type: 'choice', instructions: 'Choose', criteria: {} } } },
    { ...request, questions: { q: { type: 'noul', instructions: {}, criteria: {} } } },
    { ...request, questions: { q: { type: 'noul', instructions: 'Judge', criteria: { maybe: 'Unknown' } } } },
  ];
  for (const input of cases) assert.equal((await f.run(['--validate-only'], input)).code, 2);
  for (const url of ['file:///tmp/api', 'https://user:secret@example.com', 'https://api.example/v1', 'https://api.example/v1/systemone', 'https://api.example?key=secret']) {
    const result = await f.run(['--validate-only'], request, { TYPESAFE_BASE_URL: url });
    assert.equal(result.result.error.code, 'INVALID_CONFIG');
    assert.doesNotMatch(result.stdout + result.stderr, /secret/);
  }
  const missing = await f.run(['config', 'check'], '', { JEV_CONFIG_FILE: join(f.directory, 'absent.json') });
  assert.equal(missing.result.error.code, 'READ_FAILED');
  const nonterminal = await f.run(['config', 'init'], '', { JEV_CONFIG_FILE: join(f.directory, 'new.json') });
  assert.equal(nonterminal.result.error.code, 'TTY_REQUIRED');
});

test('live transport preserves Unicode, gateway prefix, question IDs and raw result', async (t) => {
  const api = await server(t, (_req, res) => res.end(JSON.stringify(response)));
  const f = await fixture(t, { api_key: 'mock-secret', base_url: `${api.baseUrl}/gateway/`, model: 'configured-model' });
  const result = await f.run(['evaluate']);
  assert.equal(result.code, 0);
  assert.deepEqual(result.result, response);
  assert.equal(result.stderr, '');
  assert.equal(api.requests[0].url, '/gateway/v1/systemone');
  assert.equal(api.requests[0].authorization, 'Bearer mock-secret');
  assert.deepEqual(api.requests[0].body, { ...request, model: 'configured-model' });
  assert.doesNotMatch(result.stdout + result.stderr, /mock-secret/);
});

test('file input/output preserves full response, protects existing files and uses private mode', async (t) => {
  const api = await server(t, (_req, res) => res.end(JSON.stringify(response)));
  const f = await fixture(t, { api_key: 'mock', base_url: api.baseUrl });
  await writeFile(join(f.directory, 'request.json'), JSON.stringify(request));
  const result = await f.run(['evaluate', '--input', 'request.json', '--output', 'result.json'], 'not used');
  assert.equal(result.code, 0);
  assert.equal(result.result.output_file, join(f.directory, 'result.json'));
  assert.deepEqual(JSON.parse(await readFile(result.result.output_file, 'utf8')), response);
  assert.equal((await stat(result.result.output_file)).mode & 0o777, 0o600);
  const second = await f.run(['--output', 'result.json']);
  assert.equal(second.code, 4);
  assert.equal(second.result.error.code, 'OUTPUT_EXISTS');
  assert.equal(api.requests.length, 1);
});

test('rate limits retry with clean stdout, respecting retry-after', async (t) => {
  const api = await server(t, (_req, res, count) => {
    if (count === 1) { res.writeHead(429, { 'Retry-After': '1' }); res.end('mock-secret'); }
    else res.end(JSON.stringify(response));
  });
  const f = await fixture(t, { api_key: 'mock-secret', base_url: api.baseUrl });
  const started = Date.now();
  const result = await f.run(['--retries', '1']);
  assert.equal(result.code, 0);
  assert.deepEqual(result.result, response);
  assert.equal(api.requests.length, 2);
  assert.ok(Date.now() - started >= 1000);
  assert.match(result.stderr, /HTTP 429; retrying/);
  assert.doesNotMatch(result.stdout + result.stderr, /mock-secret/);
});

test('retry exhaustion is bounded and long retry-after stops immediately', async (t) => {
  const api = await server(t, (req, res) => {
    res.writeHead(529, req.url.startsWith('/long') ? { 'Retry-After': '120' } : {});
    res.end();
  });
  const f = await fixture(t, { api_key: 'mock', base_url: api.baseUrl });
  const exhausted = await f.run(['--retries', '1']);
  assert.equal(exhausted.code, 3);
  assert.equal(exhausted.result.error.attempts, 2);
  assert.equal(api.requests.length, 2);
  const delayed = await f.run([], request, { TYPESAFE_BASE_URL: `${api.baseUrl}/long` });
  assert.equal(delayed.result.error.code, 'RETRY_LATER');
  assert.equal(api.requests.length, 3);
});

test('authentication failures and redirects neither leak response bodies nor retry', async (t) => {
  const api = await server(t, (req, res) => {
    res.writeHead(req.url.startsWith('/redirect') ? 307 : 401, { Location: '/should-not-follow' });
    res.end('mock-secret and submitted personal data');
  });
  const f = await fixture(t, { api_key: 'mock-secret', base_url: api.baseUrl });
  const unauthorized = await f.run();
  assert.equal(unauthorized.result.error.status, 401);
  assert.doesNotMatch(unauthorized.stdout + unauthorized.stderr, /mock-secret|personal data/);
  const redirect = await f.run([], request, { TYPESAFE_BASE_URL: `${api.baseUrl}/redirect` });
  assert.equal(redirect.result.error.status, 307);
  assert.equal(api.requests.length, 2);
});

test('invalid response shapes cannot become successful judgments', async (t) => {
  let outgoing;
  const api = await server(t, (_req, res) => res.end(outgoing));
  const f = await fixture(t, { api_key: 'mock', base_url: api.baseUrl });
  const wrongOption = structuredClone(response);
  wrongOption.answers.action.choice = 'invented';
  const wrongScore = structuredClone(response);
  wrongScore.answers.impact.score = 9;
  const wrongProbability = structuredClone(response);
  wrongProbability.answers.refund.noul = 1.1;
  const missing = structuredClone(response);
  delete missing.answers.refund;
  for (const value of ['not JSON', '{}', JSON.stringify(wrongOption), JSON.stringify(wrongScore), JSON.stringify(wrongProbability), JSON.stringify(missing)]) {
    outgoing = value;
    const result = await f.run();
    assert.equal(result.code, 3);
    assert.equal(result.result.error.code, 'INVALID_RESPONSE');
  }
  assert.equal(api.requests.length, 6);
});

test('timeout covers a stalled response body and does not retry', async (t) => {
  const api = await server(t, (_req, res) => { res.writeHead(200); res.write('{'); });
  const f = await fixture(t, { api_key: 'mock', base_url: api.baseUrl });
  const result = await f.run(['--timeout-ms', '200']);
  assert.equal(result.code, 3);
  assert.equal(result.result.error.code, 'TIMEOUT');
  assert.equal(api.requests.length, 1);
});
