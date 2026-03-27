#!/bin/zsh
set -euo pipefail
SCRIPT_DIR=${0:A:h}
source "$SCRIPT_DIR/common.sh"

service=''
account=''
keychain=''
requesting_actor=''
requesting_type=''
skill_name=''
purpose=''
exposure_mode='downstream-use'
confirmed=0
value_only=0

while [ "$#" -gt 0 ]; do
  case "$1" in
    --service) service="$2"; shift 2 ;;
    --account) account="$2"; shift 2 ;;
    --keychain) keychain="$2"; shift 2 ;;
    --requesting-actor) requesting_actor="$2"; shift 2 ;;
    --requesting-type) requesting_type="$2"; shift 2 ;;
    --skill-name) skill_name="$2"; shift 2 ;;
    --purpose) purpose="$2"; shift 2 ;;
    --exposure-mode) exposure_mode="$2"; shift 2 ;;
    --confirmed) confirmed=1; shift ;;
    --value-only) value_only=1; shift ;;
    *) fail_json "usage_error" "Unknown argument" "argument" "$1"; exit "$ERR_USAGE" ;;
  esac
done

require_arg "service" "$service"
require_arg "account" "$account"
require_confirmed "$confirmed"
build_keychain_args "$keychain"
keychain=$(normalize_keychain "$keychain")

set +e
secret=$(find_secret "$service" "$account" "${KEYCHAIN_ARGS[@]}")
rc=$?
set -e
if [ "$rc" -eq "$ERR_NOT_FOUND" ]; then
  fail_json "not_found" "Credential was not found in macOS Keychain" \
    "service" "$service" "account" "$account" "keychain" "$keychain"
  exit "$ERR_NOT_FOUND"
elif [ "$rc" -ne 0 ]; then
  fail_json "security_error" "Failed to read plaintext secret from macOS Keychain" \
    "service" "$service" "account" "$account" "keychain" "$keychain"
  exit "$ERR_SECURITY"
fi

if [ "$value_only" -eq 1 ]; then
  printf '%s\n' "$secret"
  exit 0
fi

printf '{"ok":true,"action":"read-secret","service":"%s","account":"%s","keychain":"%s","requesting_actor":"%s","requesting_type":"%s","skill_name":"%s","purpose":"%s","exposure_mode":"%s","secret":"%s","secret_exposed_to_user":false}\n' \
  "$(json_escape "$service")" "$(json_escape "$account")" "$(json_escape "$keychain")" \
  "$(json_escape "$requesting_actor")" "$(json_escape "$requesting_type")" "$(json_escape "$skill_name")" \
  "$(json_escape "$purpose")" "$(json_escape "$exposure_mode")" "$(json_escape "$secret")"
