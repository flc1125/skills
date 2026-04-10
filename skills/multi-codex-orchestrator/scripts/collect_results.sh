#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "usage: $0 <run-dir>" >&2
  exit 1
fi

RUN_DIR="$1"
WORKTREES_DIR="$RUN_DIR/worktrees"
AGENTS_DIR="$RUN_DIR/agents"

if [[ ! -d "$RUN_DIR" ]]; then
  echo "run dir not found: $RUN_DIR" >&2
  exit 1
fi

for agent_dir in "$AGENTS_DIR"/*; do
  [[ -d "$agent_dir" ]] || continue
  agent_id="$(basename "$agent_dir")"
  worktree_dir="$WORKTREES_DIR/$agent_id"
  patch_file="$agent_dir/diff.patch"

  if [[ -d "$worktree_dir" ]]; then
    if ! git -C "$worktree_dir" diff --cached --quiet; then
      echo "error: staged changes detected in $worktree_dir that would be omitted from $patch_file" >&2
      echo "action: run 'git -C \"$worktree_dir\" diff --cached' and export staged changes before collecting results" >&2
      exit 1
    fi

    if [[ -n "$(git -C "$worktree_dir" ls-files --others --exclude-standard)" ]]; then
      echo "error: untracked files detected in $worktree_dir that would be omitted from $patch_file" >&2
      echo "action: track new files or include them in a commit before collecting results" >&2
      exit 1
    fi

    git -C "$worktree_dir" diff > "$patch_file"
  fi

  echo "agent: $agent_id"
  [[ -f "$agent_dir/result.json" ]] && echo "  result: $agent_dir/result.json" || echo "  result: missing"
  [[ -f "$agent_dir/last-message.txt" ]] && echo "  message: $agent_dir/last-message.txt" || echo "  message: missing"
  [[ -s "$patch_file" ]] && echo "  diff: $patch_file" || echo "  diff: empty"
done
