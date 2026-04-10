#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "usage: $0 <project-dir>" >&2
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
PROJECT_DIR="$1"
PLAN_FILE="$PROJECT_DIR/plan.yaml"

mkdir -p "$PROJECT_DIR"

if [[ -e "$PLAN_FILE" ]]; then
  echo "plan already exists: $PLAN_FILE" >&2
  exit 1
fi

cp "$ROOT_DIR/assets/templates/plan.yaml" "$PLAN_FILE"

cat <<EOF
created: $PLAN_FILE

next:
  1. edit repo_path, goal, and agent blocks
  2. keep run_root under /tmp/
  3. run: $ROOT_DIR/scripts/spawn_agents.sh $PLAN_FILE
EOF
