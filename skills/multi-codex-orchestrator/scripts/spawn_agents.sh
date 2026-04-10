#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 || $# -gt 2 ]]; then
  echo "usage: $0 <plan.yaml> [--run]" >&2
  exit 1
fi

PLAN_FILE="$1"
MODE="${2:-}"

if [[ ! -f "$PLAN_FILE" ]]; then
  echo "plan not found: $PLAN_FILE" >&2
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
TASK_TEMPLATE="$ROOT_DIR/assets/templates/agent-task.md"

trim() {
  local value="$1"
  value="${value#"${value%%[![:space:]]*}"}"
  value="${value%"${value##*[![:space:]]}"}"
  printf '%s' "$value"
}

strip_quotes() {
  local value
  value="$(trim "$1")"
  value="${value%\"}"
  value="${value#\"}"
  printf '%s' "$value"
}

goal=""
repo_path=""
base_branch=""
run_root=""

declare -a agent_ids=()
declare -a agent_roles=()
declare -a agent_paths=()
declare -a agent_goals=()

current_id=""
current_role=""
current_paths=""
current_goal=""
in_agents=0

flush_agent() {
  if [[ -n "$current_id" ]]; then
    agent_ids+=("$current_id")
    agent_roles+=("$current_role")
    agent_paths+=("$current_paths")
    agent_goals+=("$current_goal")
  fi
  current_id=""
  current_role=""
  current_paths=""
  current_goal=""
}

while IFS= read -r raw_line || [[ -n "$raw_line" ]]; do
  line="$(trim "$raw_line")"
  [[ -z "$line" ]] && continue
  [[ "$line" == \#* ]] && continue

  if [[ "$line" == "agents:" ]]; then
    in_agents=1
    continue
  fi

  if [[ $in_agents -eq 0 ]]; then
    case "$line" in
      goal:*)
        goal="$(strip_quotes "${line#goal:}")"
        ;;
      repo_path:*)
        repo_path="$(strip_quotes "${line#repo_path:}")"
        ;;
      base_branch:*)
        base_branch="$(strip_quotes "${line#base_branch:}")"
        ;;
      run_root:*)
        run_root="$(strip_quotes "${line#run_root:}")"
        ;;
    esac
    continue
  fi

  case "$line" in
    -\ id:*)
      flush_agent
      current_id="$(strip_quotes "${line#- id:}")"
      ;;
    role:*)
      current_role="$(strip_quotes "${line#role:}")"
      ;;
    paths:*)
      current_paths="$(strip_quotes "${line#paths:}")"
      ;;
    goal:*)
      current_goal="$(strip_quotes "${line#goal:}")"
      ;;
  esac
done < "$PLAN_FILE"

flush_agent

if [[ -z "$goal" || -z "$repo_path" || -z "$base_branch" || -z "$run_root" ]]; then
  echo "plan is missing one of: goal, repo_path, base_branch, run_root" >&2
  exit 1
fi

if [[ ! -d "$repo_path" ]]; then
  echo "repo_path does not exist: $repo_path" >&2
  exit 1
fi

if [[ ${#agent_ids[@]} -eq 0 ]]; then
  echo "plan contains no agents" >&2
  exit 1
fi

timestamp="$(date +%Y%m%d-%H%M%S)"
run_dir="$run_root/run-$timestamp"
worktrees_dir="$run_dir/worktrees"
runs_dir="$run_dir/agents"

mkdir -p "$worktrees_dir" "$runs_dir"
printf '%s\n' "$run_dir" > "$(dirname "$PLAN_FILE")/.last-run-dir"

for i in "${!agent_ids[@]}"; do
  agent_id="${agent_ids[$i]}"
  agent_role="${agent_roles[$i]}"
  owned_paths="${agent_paths[$i]}"
  agent_goal="${agent_goals[$i]}"

  if [[ -z "$agent_id" || -z "$agent_role" || -z "$owned_paths" || -z "$agent_goal" ]]; then
    echo "agent entry $((i + 1)) is incomplete" >&2
    exit 1
  fi

  worktree_dir="$worktrees_dir/$agent_id"
  agent_run_dir="$runs_dir/$agent_id"
  task_file="$agent_run_dir/task.md"
  output_file="$agent_run_dir/last-message.txt"
  log_file="$agent_run_dir/launch.log"

  mkdir -p "$agent_run_dir"

  git -C "$repo_path" worktree add --detach "$worktree_dir" "$base_branch" >/dev/null

  sed \
    -e "s|{{GLOBAL_GOAL}}|$goal|g" \
    -e "s|{{AGENT_ID}}|$agent_id|g" \
    -e "s|{{AGENT_ROLE}}|$agent_role|g" \
    -e "s|{{OWNED_PATHS}}|$owned_paths|g" \
    -e "s|{{AGENT_GOAL}}|$agent_goal|g" \
    -e "s|{{RUN_DIR}}|$agent_run_dir|g" \
    "$TASK_TEMPLATE" > "$task_file"

  if [[ "$MODE" == "--run" ]]; then
    (
      cd "$worktree_dir"
      codex exec --full-auto -C "$worktree_dir" -o "$output_file" - < "$task_file"
    ) >"$log_file" 2>&1 &
    printf '%s\n' "$!" > "$agent_run_dir/pid"
    echo "launched $agent_id pid=$(cat "$agent_run_dir/pid")"
  else
    echo "prepared $agent_id"
  fi
done

cat <<EOF
run_dir: $run_dir
mode: ${MODE:---prepare-only}
agents: ${#agent_ids[@]}

next:
  inspect tasks under $runs_dir
  run again with --run to launch Codex workers
  collect with: $ROOT_DIR/scripts/collect_results.sh $run_dir
EOF
