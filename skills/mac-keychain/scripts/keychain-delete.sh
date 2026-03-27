#!/bin/zsh
set -euo pipefail
SCRIPT_DIR=${0:A:h}
source "$SCRIPT_DIR/common.sh"

service=''
account=''
keychain=''
confirmed=0

while [ "$#" -gt 0 ]; do
  case "$1" in
    --service) service="$2"; shift 2 ;;
    --account) account="$2"; shift 2 ;;
    --keychain) keychain="$2"; shift 2 ;;
    --confirmed) confirmed=1; shift ;;
    *) fail_json "usage_error" "Unknown argument" "argument" "$1"; exit "$ERR_USAGE" ;;
  esac
done

require_arg "service" "$service"
require_arg "account" "$account"
require_confirmed "$confirmed"
build_keychain_args "$keychain"
keychain=$(normalize_keychain "$keychain")

set +e
find_item "$service" "$account" "${KEYCHAIN_ARGS[@]}" >/dev/null
rc=$?
set -e
if [ "$rc" -eq "$ERR_NOT_FOUND" ]; then
  fail_json "not_found" "Credential was not found in macOS Keychain" \
    "service" "$service" "account" "$account" "keychain" "$keychain"
  exit "$ERR_NOT_FOUND"
elif [ "$rc" -ne 0 ]; then
  fail_json "security_error" "Failed to inspect macOS Keychain before delete" \
    "service" "$service" "account" "$account" "keychain" "$keychain"
  exit "$ERR_SECURITY"
fi

"$SECURITY_BIN" delete-generic-password -s "$service" -a "$account" "${KEYCHAIN_ARGS[@]}" >/dev/null
printf '{"ok":true,"action":"delete","service":"%s","account":"%s","keychain":"%s"}\n' \
  "$(json_escape "$service")" "$(json_escape "$account")" "$(json_escape "$keychain")"
