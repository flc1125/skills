#!/bin/zsh
set -euo pipefail
SCRIPT_DIR=${0:A:h}
source "$SCRIPT_DIR/common.sh"

service=''
account=''
secret=''
label=''
keychain=''

while [ "$#" -gt 0 ]; do
  case "$1" in
    --service) service="$2"; shift 2 ;;
    --account) account="$2"; shift 2 ;;
    --secret) secret="$2"; shift 2 ;;
    --label) label="$2"; shift 2 ;;
    --keychain) keychain="$2"; shift 2 ;;
    *) fail_json "usage_error" "Unknown argument" "argument" "$1"; exit "$ERR_USAGE" ;;
  esac
done

require_arg "service" "$service"
require_arg "account" "$account"
require_arg "secret" "$secret"
build_keychain_args "$keychain"
keychain=$(normalize_keychain "$keychain")

set +e
raw=$(find_item "$service" "$account" "${KEYCHAIN_ARGS[@]}")
rc=$?
set -e
if [ "$rc" -eq "$ERR_NOT_FOUND" ]; then
  fail_json "not_found" "Credential was not found in macOS Keychain" \
    "service" "$service" "account" "$account" "keychain" "$keychain"
  exit "$ERR_NOT_FOUND"
elif [ "$rc" -ne 0 ]; then
  fail_json "security_error" "Failed to inspect macOS Keychain before update" \
    "service" "$service" "account" "$account" "keychain" "$keychain"
  exit "$ERR_SECURITY"
fi

if [ -z "$label" ]; then
  label=$(extract_attr "$raw" 'labl')
fi

cmd=("$SECURITY_BIN" add-generic-password -U -a "$account" -s "$service")
if [ -n "$label" ]; then
  cmd+=( -l "$label" )
fi
cmd+=( -w "$secret" )
cmd+=( "${KEYCHAIN_ARGS[@]}" )
"${cmd[@]}" >/dev/null

printf '{"ok":true,"action":"update","service":"%s","account":"%s","label":"%s","keychain":"%s","secret_exposed_to_user":false}\n' \
  "$(json_escape "$service")" "$(json_escape "$account")" "$(json_escape "$label")" "$(json_escape "$keychain")"
