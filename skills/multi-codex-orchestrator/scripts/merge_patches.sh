#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 2 ]]; then
  echo "usage: $0 <run-dir> <target-repo>" >&2
  exit 1
fi

RUN_DIR="$1"
TARGET_REPO="$2"
AGENTS_DIR="$RUN_DIR/agents"

get_result_status() {
  local result_file="$1"
  sed -n 's/.*"status"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' "$result_file" | head -n 1
}

collect_patch_files() {
  sed -n 's|^diff --git a/\(.*\) b/.*$|\1|p' "$1"
}

record_touch() {
  local owner="$1"
  local file="$2"
  local entry
  local existing_file
  local existing_owner

  if (( ${#touched_file_records[@]} > 0 )); then
    for entry in "${touched_file_records[@]}"; do
      existing_file="${entry#*:}"
      existing_owner="${entry%%:*}"
      if [[ "$existing_file" == "$file" ]]; then
        echo "file conflict between $existing_owner and $owner: $file" >&2
        exit 1
      fi
    done
  fi

  touched_file_records+=("$owner:$file")
}

if [[ ! -d "$AGENTS_DIR" ]]; then
  echo "agents dir not found: $AGENTS_DIR" >&2
  exit 1
fi

if [[ ! -d "$TARGET_REPO/.git" ]]; then
  echo "target repo is not a git repository: $TARGET_REPO" >&2
  exit 1
fi

declare -a touched_file_records=()
declare -a patch_files=()

for patch_file in "$AGENTS_DIR"/*/diff.patch; do
  [[ -f "$patch_file" ]] || continue
  if [[ ! -s "$patch_file" ]]; then
    continue
  fi

  agent_dir="$(dirname "$patch_file")"
  agent_id="$(basename "$agent_dir")"
  result_file="$agent_dir/result.json"

  if [[ ! -f "$result_file" ]]; then
    echo "missing result.json for $agent_id: $result_file" >&2
    exit 1
  fi

  status="$(get_result_status "$result_file")"
  if [[ "$status" != "done" ]]; then
    echo "refusing to merge $agent_id with status '$status'" >&2
    exit 1
  fi

  while IFS= read -r touched_file; do
    [[ -z "$touched_file" ]] && continue
    record_touch "$agent_id" "$touched_file"
  done < <(collect_patch_files "$patch_file")

  patch_files+=("$patch_file")
done

for patch_file in "${patch_files[@]}"; do
  echo "applying: $patch_file"
  if ! git -C "$TARGET_REPO" apply --3way "$patch_file"; then
    echo "failed to apply patch: $patch_file" >&2
    exit 1
  fi
done

echo "patches applied to: $TARGET_REPO"
echo "next: review working tree changes, resolve conflicts if any, then run validation"
