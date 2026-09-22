#!/usr/bin/env node
import { readFile, writeFile, mkdir, rename, unlink, lstat } from 'node:fs/promises';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { createInterface, emitKeypressEvents } from 'node:readline';
import { setTimeout as sleep } from 'node:timers/promises';

const DEFAULT_URL = 'https://api.typesafe.ai';
const DEFAULT_MODEL = 'jev-latest';
const RETRYABLE = new Set([429, 500, 502, 503, 504, 529]);
const object = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const text = (value) => typeof value === 'string' && value.trim().length > 0;
const description = (value) => text(value) || object(value) || Array.isArray(value);
const probability = (value) => typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1;
const homePath = (value) => resolve(value.startsWith('~/') ? join(homedir(), value.slice(2)) : value);
const json = (value) => `${JSON.stringify(value)}\n`;

class JevError extends Error {
  constructor(code, message, exitCode = 2, details = {}) {
    super(message);
    this.code = code;
    this.exitCode = exitCode;
    this.details = details;
  }
}

function requireThat(condition, message, code = 'INVALID_INPUT', exitCode = 2) {
  if (!condition) throw new JevError(code, message, exitCode);
}

function parseJson(value, label) {
  try { return JSON.parse(value); }
  catch { throw new JevError('INVALID_JSON', `${label} must contain valid JSON.`); }
}

async function readJsonFile(path, label) {
  let contents;
  try { contents = await readFile(path, 'utf8'); }
  catch (error) { throw new JevError('READ_FAILED', `Unable to read ${label} (${error.code}).`); }
  return parseJson(contents, label);
}

function serviceUrl(value) {
  requireThat(text(value), 'base_url must be a nonempty service-root URL.', 'INVALID_CONFIG');
  let url;
  try { url = new URL(value); }
  catch { throw new JevError('INVALID_CONFIG', 'base_url is not a valid URL.'); }
  requireThat(['https:', 'http:'].includes(url.protocol) && !url.username && !url.password && !url.search && !url.hash,
    'base_url must use HTTP(S) without URL credentials, query, or fragment.', 'INVALID_CONFIG');
  url.pathname = url.pathname.replace(/\/+$/, '');
  requireThat(!/\/v1(?:\/systemone)?$/.test(url.pathname),
    'base_url must be the service root; omit /v1 and /v1/systemone.', 'INVALID_CONFIG');
  return url.toString().replace(/\/+$/, '');
}

async function loadConfig(allowMissing = false) {
  const explicit = process.env.JEV_CONFIG_FILE?.trim();
  const path = homePath(explicit || join(homedir(), '.config', 'jev', 'config.json'));
  let file = {};
  try { file = parseJson(await readFile(path, 'utf8'), 'Configuration'); }
  catch (error) {
    if (error instanceof JevError) throw error;
    if (error.code !== 'ENOENT' || (explicit && !allowMissing)) {
      throw new JevError('READ_FAILED', `Unable to read configuration (${error.code}).`);
    }
  }
  requireThat(object(file), 'Configuration must be a JSON object.', 'INVALID_CONFIG');
  const env = (name) => process.env[name]?.trim() || undefined;
  const apiKey = env('TYPESAFE_API_KEY') ?? file.api_key;
  const baseUrl = serviceUrl(env('TYPESAFE_BASE_URL') ?? file.base_url ?? DEFAULT_URL);
  const model = env('TYPESAFE_MODEL') ?? file.model ?? DEFAULT_MODEL;
  requireThat(apiKey === undefined || (text(apiKey) && !/[\r\n]/.test(apiKey)),
    'api_key must be a nonempty string without line breaks.', 'INVALID_CONFIG');
  requireThat(text(model), 'model must be a nonempty string.', 'INVALID_CONFIG');
  return { path, file, apiKey, baseUrl, model };
}

function validateRequest(input, model) {
  requireThat(object(input), 'Request must be a JSON object.');
  requireThat(Object.keys(input).every((key) => ['state', 'questions', 'model'].includes(key)),
    'Request only accepts state, questions, and model.');
  requireThat(typeof input.state === 'string' || object(input.state) || Array.isArray(input.state),
    'state must be a string, object, or array.');
  requireThat(object(input.questions) && Object.keys(input.questions).length > 0, 'questions must be a nonempty object.');
  requireThat(input.model === undefined || text(input.model), 'model must be a nonempty string.');
  for (const [index, [id, q]] of Object.entries(input.questions).entries()) {
    const label = `Question ${index + 1}`;
    requireThat(text(id) && object(q), `${label} needs a nonempty ID and an object value.`);
    requireThat(Object.keys(q).every((key) => ['type', 'instructions', 'criteria'].includes(key)), `${label} has an unknown field.`);
    requireThat(['choice', 'noul', 'score'].includes(q.type), `${label} has an unsupported type.`);
    requireThat(description(q.instructions) && Object.keys(q.instructions).length > 0, `${label} needs nonempty instructions.`);
    if (q.type === 'choice') {
      requireThat(object(q.criteria) && Object.keys(q.criteria).length >= 1 && Object.keys(q.criteria).length <= 255,
        `${label} choice criteria must contain 1–255 options.`);
      requireThat(Object.entries(q.criteria).every(([key, value]) => text(key) && (value === null || description(value))),
        `${label} has an invalid choice option or description.`);
    } else if (q.type === 'score') {
      requireThat(Array.isArray(q.criteria) && q.criteria.length >= 2 && q.criteria.length <= 10 && q.criteria.every(description),
        `${label} score criteria must contain 2–10 level descriptions.`);
    } else if (q.criteria !== undefined) {
      requireThat(object(q.criteria) && Object.entries(q.criteria).every(([key, value]) => ['true', 'false'].includes(key) && description(value)),
        `${label} noul criteria only accepts true/false descriptions.`);
    }
  }
  return { ...input, model: input.model ?? model };
}

function validateResponse(result, request) {
  const check = (condition) => requireThat(condition, 'API response does not match the submitted questions or v1 response contract.', 'INVALID_RESPONSE', 3);
  check(object(result) && text(result.model) && object(result.answers) && object(result.usage));
  check(Number.isInteger(result.usage.input_tokens) && result.usage.input_tokens >= 0);
  check(Number.isInteger(result.usage.output_tokens) && result.usage.output_tokens >= 0);
  check(Object.keys(result.answers).length === Object.keys(request.questions).length);
  for (const [id, question] of Object.entries(request.questions)) {
    const answer = result.answers[id];
    check(Object.hasOwn(result.answers, id) && object(answer) && answer.type === question.type);
    if (question.type === 'noul') {
      check(probability(answer.noul));
      continue;
    }
    check(probability(answer.confidence) && object(answer.probabilities));
    const keys = question.type === 'choice' ? Object.keys(question.criteria) : question.criteria.map((_, index) => String(index));
    check(Object.keys(answer.probabilities).length === keys.length && keys.every((key) => Object.hasOwn(answer.probabilities, key) && probability(answer.probabilities[key])));
    check(Math.abs(Object.values(answer.probabilities).reduce((sum, p) => sum + p, 0) - 1) < 0.01);
    if (question.type === 'choice') {
      check(typeof answer.choice === 'string' && Object.hasOwn(question.criteria, answer.choice));
    } else {
      check(typeof answer.score === 'number' && Number.isFinite(answer.score) && answer.score >= 0 && answer.score <= keys.length - 1);
      check(object(answer.legend) && Object.keys(answer.legend).length === keys.length && keys.every((key) => Object.hasOwn(answer.legend, key)));
    }
  }
}

async function evaluate(request, config, options) {
  requireThat(text(config.apiKey), 'Set api_key using config init or TYPESAFE_API_KEY before live evaluation.', 'MISSING_API_KEY');
  for (let attempt = 0; attempt <= options.retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), options.timeout);
    let response;
    let body;
    try {
      response = await fetch(`${config.baseUrl}/v1/systemone`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${config.apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
        redirect: 'manual',
        signal: controller.signal,
      });
      if (response.ok) body = await response.text();
      else await response.body?.cancel();
    } catch {
      throw new JevError(controller.signal.aborted ? 'TIMEOUT' : 'NETWORK_ERROR',
        controller.signal.aborted ? 'API request timed out; it may already have been processed.' : 'API request failed before a complete response; it may already have been processed.', 3);
    } finally { clearTimeout(timer); }

    if (response.ok) {
      let result;
      try { result = JSON.parse(body); }
      catch { throw new JevError('INVALID_RESPONSE', 'API returned invalid JSON.', 3); }
      validateResponse(result, request);
      return result;
    }
    if (!RETRYABLE.has(response.status) || attempt === options.retries) {
      const hint = response.status === 401 || response.status === 403 ? ' Check credentials and endpoint access.'
        : response.status === 422 ? ' Check the request against the current API contract and token limits.' : '';
      throw new JevError('HTTP_ERROR', `API returned HTTP ${response.status}.${hint}`, 3, { status: response.status, attempts: attempt + 1 });
    }
    let delay = Math.min(1000 * 2 ** attempt, 30000);
    const retryAfter = response.headers.get('retry-after');
    if (retryAfter !== null) {
      const seconds = Number(retryAfter);
      const requested = Number.isFinite(seconds) ? seconds * 1000 : Date.parse(retryAfter) - Date.now();
      if (Number.isFinite(requested)) delay = Math.max(delay, requested);
    }
    if (delay > 30000) throw new JevError('RETRY_LATER', 'Server requested a wait longer than 30 seconds; retry later.', 3, { status: response.status });
    process.stderr.write(`HTTP ${response.status}; retrying (${attempt + 1}/${options.retries}) in ${Math.ceil(delay)} ms.\n`);
    await sleep(delay);
  }
}

function prompt(label, fallback = '') {
  const terminal = createInterface({ input: process.stdin, output: process.stderr });
  return new Promise((resolvePrompt, reject) => {
    let answered = false;
    terminal.once('close', () => { if (!answered) reject(new JevError('CANCELLED', 'Configuration cancelled.')); });
    terminal.question(`${label}${fallback ? ` [${fallback}]` : ''}: `, (answer) => {
      answered = true;
      terminal.close();
      resolvePrompt(answer.trim() || fallback);
    });
  });
}

function promptKey(hasKey) {
  return new Promise((resolveKey, reject) => {
    const input = process.stdin;
    const previousRaw = input.isRaw;
    let value = '';
    emitKeypressEvents(input);
    input.setRawMode(true);
    input.resume();
    const finish = (error) => {
      input.off('keypress', onKey);
      input.off('end', onEnd);
      input.setRawMode(previousRaw);
      input.pause();
      process.stderr.write('\n');
      if (error) reject(error); else resolveKey(value.trim());
    };
    const onEnd = () => finish(new JevError('CANCELLED', 'Configuration cancelled.'));
    const onKey = (character, key = {}) => {
      if (key.ctrl && ['c', 'd'].includes(key.name)) return onEnd();
      if (['return', 'enter'].includes(key.name)) return finish();
      if (key.name === 'backspace') value = [...value].slice(0, -1).join('');
      else if (character && !key.ctrl && !key.meta && !/[\x00-\x1f\x7f]/.test(character)) value += character;
    };
    input.on('keypress', onKey);
    input.once('end', onEnd);
    process.stderr.write(`API key (hidden${hasKey ? '; Enter keeps existing' : ''}): `);
  });
}

async function configure(command) {
  const config = await loadConfig(command === 'init');
  if (command === 'check') {
    process.stdout.write(json({ config_file: config.path, api_key_set: Boolean(config.apiKey), base_url: config.baseUrl, model: config.model }));
    if (!config.apiKey) process.exitCode = 2;
    return;
  }
  requireThat(['init', 'edit'].includes(command), 'Use config init, config edit, or config check.');
  requireThat(process.stdin.isTTY && process.stderr.isTTY, 'Run config init/edit in an interactive terminal; never pass keys as command arguments.', 'TTY_REQUIRED');
  let exists = false;
  try { await lstat(config.path); exists = true; }
  catch (error) { if (error.code !== 'ENOENT') throw new JevError('READ_FAILED', 'Unable to inspect configuration.'); }
  requireThat(command !== 'init' || !exists, 'Configuration already exists; use config edit.', 'CONFIG_EXISTS');
  requireThat(command !== 'edit' || exists, 'Configuration does not exist; use config init.', 'MISSING_CONFIG');
  const baseUrl = serviceUrl(await prompt('Service root URL', config.file.base_url ?? DEFAULT_URL));
  const model = await prompt('Model', config.file.model ?? DEFAULT_MODEL);
  const key = await promptKey(Boolean(config.file.api_key)) || config.file.api_key;
  requireThat(text(key), 'An API key is required to save configuration.', 'MISSING_API_KEY');
  const contents = `${JSON.stringify({ ...config.file, api_key: key, base_url: baseUrl, model }, null, 2)}\n`;
  const temporary = `${config.path}.${randomUUID()}.tmp`;
  try {
    await mkdir(dirname(config.path), { recursive: true, mode: 0o700 });
    if (command === 'init') await writeFile(config.path, contents, { flag: 'wx', mode: 0o600 });
    else {
      await writeFile(temporary, contents, { flag: 'wx', mode: 0o600 });
      await rename(temporary, config.path);
    }
  } catch (error) {
    throw new JevError('WRITE_FAILED', `Unable to save configuration (${error.code}).`, 4);
  } finally { await unlink(temporary).catch(() => {}); }
  process.stdout.write(json({ config_file: config.path, saved: true }));
}

function parseOptions(args) {
  const options = { timeout: 30000, retries: 2 };
  const values = { '--input': 'input', '--output': 'output', '--timeout-ms': 'timeout', '--retries': 'retries' };
  const seen = new Set();
  for (let index = 0; index < args.length; index++) {
    const flag = args[index];
    requireThat(!seen.has(flag), 'Duplicate CLI option.');
    seen.add(flag);
    if (flag === '--validate-only') { options.validateOnly = true; continue; }
    requireThat(Object.hasOwn(values, flag), 'Unknown CLI option; run --help.');
    const value = args[++index];
    requireThat(value !== undefined && !value.startsWith('--'), 'CLI option requires a value.');
    options[values[flag]] = value;
  }
  options.timeout = Number(options.timeout);
  options.retries = Number(options.retries);
  requireThat(Number.isInteger(options.timeout) && options.timeout >= 1 && options.timeout <= 600000, '--timeout-ms must be an integer from 1 to 600000.');
  requireThat(Number.isInteger(options.retries) && options.retries >= 0 && options.retries <= 5, '--retries must be an integer from 0 to 5.');
  requireThat(!(options.output && options.validateOnly), '--output cannot be combined with --validate-only.');
  return options;
}

async function main() {
  const args = process.argv.slice(2);
  if (args[0] === '--help' || args[0] === 'help') {
    process.stdout.write('Jev (Node.js 20+)\n  jev.mjs evaluate [--input FILE|-] [--output FILE] [--validate-only] [--timeout-ms N] [--retries N]\n  jev.mjs config init|edit|check\nConfiguration: ~/.config/jev/config.json or JEV_CONFIG_FILE\nOverrides: TYPESAFE_API_KEY, TYPESAFE_BASE_URL, TYPESAFE_MODEL\n');
    return;
  }
  if (args[0] === 'config') {
    requireThat(args.length === 2, 'Use config init, config edit, or config check.');
    return configure(args[1]);
  }
  if (args[0] === 'evaluate') args.shift();
  const options = parseOptions(args);
  const config = await loadConfig();
  let input;
  if (options.input && options.input !== '-') input = await readJsonFile(homePath(options.input), 'input file');
  else {
    requireThat(!process.stdin.isTTY, 'Provide JSON on stdin or use --input FILE.');
    let contents = '';
    process.stdin.setEncoding('utf8');
    for await (const chunk of process.stdin) contents += chunk;
    input = parseJson(contents, 'stdin');
  }
  const request = validateRequest(input, config.model);
  if (options.validateOnly) {
    process.stdout.write(json({ valid: true, model: request.model, question_count: Object.keys(request.questions).length, evaluated: false }));
    return;
  }
  if (options.output) {
    try {
      await lstat(homePath(options.output));
      throw new JevError('OUTPUT_EXISTS', 'Output file already exists; choose a new path.', 4);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
  const result = await evaluate(request, config, options);
  if (options.output) {
    const path = homePath(options.output);
    try { await writeFile(path, json(result), { flag: 'wx', mode: 0o600 }); }
    catch (error) { throw new JevError('WRITE_FAILED', `Unable to save API result (${error.code}); evaluation already completed.`, 4); }
    process.stdout.write(json({ output_file: path, model: result.model, usage: result.usage }));
  } else process.stdout.write(json(result));
}

main().catch((error) => {
  const known = error instanceof JevError;
  process.stdout.write(json({ error: { code: known ? error.code : 'INTERNAL_ERROR', message: known ? error.message : 'Unexpected local failure; check runtime and filesystem access.', ...(known ? error.details : {}) } }));
  process.exitCode = known ? error.exitCode : 3;
});
