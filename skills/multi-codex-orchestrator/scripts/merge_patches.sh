#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 2 ]]; then
  echo "usage: $0 <run-dir> <target-repo>" >&2
  exit 1
fi

RUN_DIR="$1"
TARGET_REPO="$2"
AGENTS_DIR="$RUN_DIR/agents"

if [[ ! -d "$AGENTS_DIR" ]]; then
  echo "agents dir not found: $AGENTS_DIR" >&2
  exit 1
fi

if [[ ! -d "$TARGET_REPO/.git" ]]; then
  echo "target repo is not a git repository: $TARGET_REPO" >&2
  exit 1
fi

for patch_file in "$AGENTS_DIR"/*/diff.patch; do
  [[ -f "$patch_file" ]] || continue
  if [[ ! -s "$patch_file" ]]; then
    continue
  fi

  echo "applying: $patch_file"
  git -C "$TARGET_REPO" apply --3way "$patch_file"
done

echo "patches applied to: $TARGET_REPO"
echo "next: review staged changes, resolve conflicts if any, then run validation"
