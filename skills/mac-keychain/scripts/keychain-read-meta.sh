#!/bin/zsh
set -euo pipefail
SCRIPT_DIR=${0:A:h}
source "$SCRIPT_DIR/common.sh"

service=''
account=''
keychain=''

while [ "$#" -gt 0 ]; do
  case "$1" in
    --service) service="$2"; shift 2 ;;
    --account) account="$2"; shift 2 ;;
    --keychain) keychain="$2"; shift 2 ;;
    *) fail_json "usage_error" "Unknown argument" "argument" "$1"; exit "$ERR_USAGE" ;;
  esac
done

require_arg "service" "$service"
require_arg "account" "$account"
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
  fail_json "security_error" "Failed to read credential metadata from macOS Keychain" \
    "service" "$service" "account" "$account" "keychain" "$keychain"
  exit "$ERR_SECURITY"
fi

label=$(extract_attr "$raw" 'labl')
if [ -z "$label" ]; then
  label="$service"
fi

printf '{"ok":true,"exists":true,"service":"%s","account":"%s","label":"%s","keychain":"%s"}\n' \
  "$(json_escape "$service")" "$(json_escape "$account")" "$(json_escape "$label")" "$(json_escape "$keychain")"
