#!/bin/zsh
set -euo pipefail

readonly SECURITY_BIN=/usr/bin/security
readonly ERR_USAGE=64
readonly ERR_CONFIRMATION_REQUIRED=65
readonly ERR_ALREADY_EXISTS=66
readonly ERR_NOT_FOUND=44
readonly ERR_SECURITY=70

json_escape() {
  local value="${1-}"
  value=${value//\\/\\\\}
  value=${value//\"/\\\"}
  value=${value//$'\n'/\\n}
  value=${value//$'\r'/\\r}
  value=${value//$'\t'/\\t}
  printf '%s' "$value"
}

fail_json() {
  local code="$1"
  local message="$2"
  shift 2
  printf '{"ok":false,"code":"%s","message":"%s"' "$(json_escape "$code")" "$(json_escape "$message")"
  while [ "$#" -gt 1 ]; do
    printf ',"%s":"%s"' "$(json_escape "$1")" "$(json_escape "$2")"
    shift 2
  done
  printf '}\n' >&2
}

require_arg() {
  local name="$1"
  local value="${2-}"
  if [ -z "$value" ]; then
    fail_json "usage_error" "Missing required argument" "argument" "$name"
    exit "$ERR_USAGE"
  fi
}

normalize_keychain() {
  local value="${1-}"
  if [ -z "$value" ]; then
    printf 'login'
  else
    printf '%s' "$value"
  fi
}

build_keychain_args() {
  local value="${1-}"
  if [ -n "$value" ] && [ "$value" != "login" ]; then
    KEYCHAIN_ARGS=("$value")
  else
    KEYCHAIN_ARGS=()
  fi
}

find_item() {
  setopt localoptions noerrexit
  local service="$1"
  local account="$2"
  shift 2
  local -a keychain_args=("$@")
  local output
  output=$("$SECURITY_BIN" find-generic-password -s "$service" -a "$account" "${keychain_args[@]}" 2>&1)
  local rc=$?
  printf '%s' "$output"
  return "$rc"
}

find_secret() {
  setopt localoptions noerrexit
  local service="$1"
  local account="$2"
  shift 2
  local -a keychain_args=("$@")
  local output
  output=$("$SECURITY_BIN" find-generic-password -s "$service" -a "$account" -w "${keychain_args[@]}" 2>&1)
  local rc=$?
  printf '%s' "$output"
  return "$rc"
}

extract_attr() {
  local raw="$1"
  local attr="$2"
  printf '%s\n' "$raw" | sed -n "s/.*\"${attr}\"<blob>=\"\(.*\)\"/\1/p" | head -n 1
}

require_confirmed() {
  local confirmed="${1-0}"
  if [ "$confirmed" != "1" ]; then
    fail_json "confirmation_required" "Explicit confirmation is required for this action" \
      "hint" "Re-run with --confirmed after user approval"
    exit "$ERR_CONFIRMATION_REQUIRED"
  fi
}
