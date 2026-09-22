# Runner

Use Node.js 20+ and the bundled `scripts/jev.mjs`; all dependencies are Node built-ins. Commands below use `<skill-dir>` as the absolute directory containing this skill.

Execute directly; configuration is handled inside the helper. Load [configuration guidance](configuration.md) only for a configuration-related execution failure or an explicit setup request.

## Evaluate

```sh
node <skill-dir>/scripts/jev.mjs evaluate <<'JSON'
{
  "state": {
    "request": "Please send the receipt to my personal email instead.",
    "candidates": {"billing": "billing@example.com", "personal": "me@example.com"}
  },
  "questions": {
    "recipient": {
      "type": "choice",
      "instructions": "Which entry of `candidates` is requested by `request`?",
      "criteria": {"billing": "Billing address", "personal": "Personal address", "none": "Neither address fits"}
    },
    "change_requested": {
      "type": "noul",
      "instructions": "Does `request` explicitly ask to change the receipt recipient?"
    }
  }
}
JSON
```

This only evaluates the request; it does not send a receipt. Replace the example with task-specific state and questions.

The response is an object with `model`, `answers`, and `usage`. For the example above, `answers.recipient.choice` is a candidate key to look up in the original state, while `answers.change_requested.noul` is a yes probability. A representative response shape (illustrative values, not a live result):

```json
{
  "model": "jev-version-returned-by-service",
  "answers": {
    "recipient": {
      "type": "choice",
      "choice": "personal",
      "probabilities": {"billing": 0.01, "personal": 0.98, "none": 0.01},
      "confidence": 0.9
    },
    "change_requested": {"type": "noul", "noul": 0.97}
  },
  "usage": {"input_tokens": 250, "output_tokens": 20}
}
```

For a Score question, read `answers[id].score`, `confidence`, `probabilities`, and `legend`. The latter two map string level indices (`"0"`, `"1"`, …) to probabilities and level descriptions. Noul has no separate confidence field. Preserve the raw distributions when composing results.

| Input field | Contract |
| --- | --- |
| `state` | Required string, object, or array; structured state may contain numbers and booleans |
| `questions` | Required nonempty object keyed by question IDs |
| `model` | Optional nonempty string, overrides configured model |
| Question `type` | `choice`, `noul`, or `score` |
| Question `instructions` | Required nonempty string, object, or array |
| Choice `criteria` | 1–255 named options; descriptions are strings, objects, arrays, or null |
| Score `criteria` | 2–10 ordered level descriptions; each is a string, object, or array |
| Noul `criteria` | Optional object with `true` and/or `false` descriptions |

Score indices start at zero, so a three-level rubric has scores from 0 to 2, not 0 to 1. A question ID has no semantic meaning to Jev: put its full meaning in `instructions`. Unknown request/question fields are rejected locally to catch accidental misspellings. The server remains authoritative for token limits and semantic interpretation.

For file input, offline validation, or large output:

```sh
node <skill-dir>/scripts/jev.mjs evaluate --input request.json --validate-only
node <skill-dir>/scripts/jev.mjs evaluate --input request.json --output result.json
node <skill-dir>/scripts/jev.mjs evaluate --input request.json --timeout-ms 30000 --retries 2
```

- No `--input` (or `--input -`): read JSON from stdin. No subcommand defaults to `evaluate`.
- `--validate-only`: validate the request and configuration locally, without a key or network call. Outputs a validation summary, not simulated answers.
- Normal stdout: the API JSON object, including `answers`, actual `model`, and `usage`; answers are checked against the submitted questions. No automatic filtering or thresholding is applied.
- `--output`: write the complete response to a new file with mode `0600`; stdout contains its absolute path, model, and usage. Parent directory must exist. Existing files are not overwritten. No task directories or response files are created by default.
- stderr contains diagnostics only. Errors produce one JSON object on stdout: `{"error":{"code":"…","message":"…"}}`. Check the exit code first: `0` success, `2` input/configuration error, `3` transport/API/response error, `4` file output error. Never treat an error as a negative judgment.
- Default timeout is 30 seconds **per attempt**, including response-body reading. `--timeout-ms` accepts 1–600000; `--retries` accepts 0–5 (default 2 retries, 3 total attempts).
- Retryable HTTP statuses: 429, 500, 502, 503, 504, and 529. Retries use bounded exponential backoff and honor `Retry-After` up to 30 seconds. Longer requested waits stop with `RETRY_LATER` instead of retrying early. Authentication/validation errors, malformed responses, redirects, timeouts, and ambiguous network failures are not retried automatically. A timed-out request may already have been processed; decide whether to retry it rather than starting an unbounded loop.
- HTTP error messages identify the status without dumping the response body, which could contain submitted data or credentials. Redirects are refused so the configured endpoint is the only destination for the request.

Read stdout through the available execution tool. For a large result, read the saved JSON with code and present selected records or an artifact rather than flooding tool output. The CLI handles one evaluation request at a time; batching records and combining multiple calls remain under the agent's control.

## API references

Consult the live [HTTP API](https://docs.typesafe.ai/api) for contracts and [model reference](https://docs.typesafe.ai/models) for current versions, prices, context budgets, and language support. Model aliases may change; pin a version when thresholds have been evaluated against it. Request packing must account for both total tokens and state-plus-longest-question limits. Do not silently discard input to satisfy limits.
