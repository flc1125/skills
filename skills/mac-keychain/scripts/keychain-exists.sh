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
find_item "$service" "$account" "${KEYCHAIN_ARGS[@]}" >/dev/null
rc=$?
set -e

if [ "$rc" -eq 0 ]; then
  printf '{"ok":true,"exists":true,"service":"%s","account":"%s","keychain":"%s"}\n' \
    "$(json_escape "$service")" "$(json_escape "$account")" "$(json_escape "$keychain")"
elif [ "$rc" -eq "$ERR_NOT_FOUND" ]; then
  printf '{"ok":true,"exists":false,"service":"%s","account":"%s","keychain":"%s"}\n' \
    "$(json_escape "$service")" "$(json_escape "$account")" "$(json_escape "$keychain")"
else
  fail_json "security_error" "Failed to query macOS Keychain" \
    "service" "$service" "account" "$account" "keychain" "$keychain"
  exit "$ERR_SECURITY"
fi
