# Configuration and recovery

Read this only after a configuration-related execution failure or when the user explicitly asks to configure Jev. Normal tasks call `evaluate` directly; no separate configuration check is needed.

## Identify the problem

Use the returned error code, message, and HTTP status to choose a targeted next step:

| Evidence | Next step |
| --- | --- |
| `MISSING_API_KEY` | Guide the user to supply a key through the configuration file or environment |
| `INVALID_CONFIG` | Address the field named in the error, such as `base_url` or `model` |
| `INVALID_JSON` or `READ_FAILED` explicitly referring to configuration | Correct the configuration JSON or selected file path; the same codes referring to stdin or an input file are task-input errors |
| HTTP 401 | Check whether the key is valid for the configured service |
| HTTP 403 or 404 | Investigate access or endpoint compatibility before proposing a change; these statuses alone do not prove that the key is wrong |
| `INVALID_INPUT`, input JSON errors, or HTTP 422 | Fix the agent's request or check API limits first; investigate model configuration only if evidence points to it |
| Timeout, network error, rate limit, or server failure | Handle as an execution/service problem; do not ask the user to reconfigure without further evidence |

Explain the specific problem and relevant remedy rather than presenting the entire setup procedure. `config check` is available for targeted diagnosis and never reveals the key. Do not dump configuration files or environment variables into the conversation. Missing credentials still allow request design and `--validate-only`; distinguish this from a completed live evaluation.

## File and overrides

Default file: `~/.config/jev/config.json`. Override its location with `JEV_CONFIG_FILE` (relative paths resolve from the current directory; `~/` is supported).

```json
{
  "api_key": "your-api-key",
  "base_url": "https://api.typesafe.ai",
  "model": "jev-latest"
}
```

Environment variables override file values: `TYPESAFE_API_KEY`, `TYPESAFE_BASE_URL`, and `TYPESAFE_MODEL`. Empty environment values are ignored. Only the key is required for live evaluation; the base URL and model default to the values above. An explicit request `model` overrides the configured model.

`base_url` is the service root, not the evaluation endpoint: the runner appends `/v1/systemone`. Trailing slashes are accepted and a gateway path prefix is preserved. Do not include `/v1`, `/v1/systemone`, URL credentials, query parameters, or fragments. HTTP and HTTPS are supported. A custom endpoint must implement the TypeSafe v1 contract, not an OpenAI chat-completions API.

## Configuration commands

Use the absolute directory containing this skill in place of `<skill-dir>`:

```sh
node <skill-dir>/scripts/jev.mjs config init
node <skill-dir>/scripts/jev.mjs config edit
node <skill-dir>/scripts/jev.mjs config check
```

`init` and `edit` require an interactive terminal, hide key input, and write the file with mode `0600` on POSIX. `init` refuses to overwrite an existing file. `edit` preserves fields not being changed; blank input keeps the existing value. Environment overrides are not saved into the file. Do not pass a key on the command line, ask the user to paste it into chat, or copy it into task files. The user can run the interactive command in their terminal or edit the file locally.

`check` is offline. It reports the resolved path, whether a key is set, the effective base URL, and model; it never prints the key. When the key is missing it returns this same summary with `api_key_set: false` and exits with code 2 (not an error envelope). A configured key is not proof that it is valid with the service. Missing default configuration is allowed when environment variables supply it; an explicitly selected missing file is an error, except when running `config init` to create it.
