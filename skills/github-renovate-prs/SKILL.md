---
name: github-renovate-prs
description: Inspect, triage, approve, and merge GitHub Renovate pull requests with gh. When no repository is provided, use the default preset repository set, build a candidate execution plan, and execute only after explicit user confirmation. Use when the user asks to check, batch-handle, approve, or merge Renovate PRs.
---

# GitHub Renovate PRs

Manage Renovate PRs with a short, confirmation-first workflow.

## Operating Mode

Act as a conservative Renovate PR coordinator.

Prioritize:

- target resolution before commands
- a concise candidate execution plan before any write action
- one final execution confirmation instead of multi-step interactive selection
- explicit evidence for skips and failures

Keep interaction in Chinese unless the user asks otherwise.

Never approve or merge without explicit user confirmation.

## Target Resolution

Resolve the target in this order:

1. Explicit `owner/repo`
2. GitHub PR URL
3. GitHub repository URL
4. No target provided: use the `Default Repository Set`

Rules:

- Do not infer the current local repository.
- Normalize repository targets to `owner/repo`.
- When a PR URL is provided, extract both `owner/repo` and PR number.
- If the user narrows scope later with repo names or PR numbers, treat that as a plan override instead of restarting the flow.

## Default Repository Set

When the user does not specify a target repository, use this fixed preset set:

- `go-fries/fries`
- `go-tapd/tapd`
- `flc1125/go-twca`
- `flc1125/go-cron`
- `flc1125/go-gitlab-webhook`
- `flc1125/go-yuque`

Do not ask for confirmation before scanning this preset set. Scanning is read-only.

## Renovate Identification

Treat a PR as Renovate-created when `author.login` is one of:

- `app/renovate`
- `renovate[bot]`

If the repository uses another Renovate actor and the evidence is clear, call it out and continue conservatively.

## Candidate Plan Policy

Classify each Renovate PR into one of these buckets:

- `候选执行`
- `跳过: major`
- `跳过: checks`
- `跳过: blocked`
- `跳过: 需人工判断`

Mark a PR as `候选执行` only when all of the following are true:

- PR is open
- PR is not draft
- CI is passing
- PR is mergeable without an obvious blocking state
- the change is not clearly a major upgrade
- title, labels, and body do not clearly indicate a risky migration, grouped update, replacement, or other situation that likely needs manual review

Mark a PR as `跳过: 需人工判断` when the update is not clearly major but still does not look like a safe default merge candidate.

`候选执行` means recommended for the plan, not approved for execution.

## Workflow

Follow this sequence unless the user clearly asks for only one part.

### 1. Scan the target repositories

Prefer explicit `-R owner/repo` on every `gh` command.

Use commands such as:

```bash
gh pr list -R OWNER/REPO --state open --json number,title,url,author,isDraft,mergeStateStatus,statusCheckRollup,labels
gh pr view PR_NUMBER -R OWNER/REPO --json title,body,labels,url
gh pr checks PR_NUMBER -R OWNER/REPO
```

In preset mode, query each repository directly and merge the results for one combined summary.

### 2. Build a concise candidate plan

Do not force the user into a numbered selection workflow, but do assign stable per-plan indices to all plan items so the user can reference them quickly in multi-repository mode.

For every `候选执行` and `跳过` item, include:

- current plan index for each item, such as `1.` or `[1]`
- `owner/repo#number`
- PR title
- raw GitHub PR URL
- planned action for candidates, or skip reason for skipped items

Use one continuous index sequence across the whole plan snapshot. `跳过` items must continue counting after the last `候选执行` item instead of restarting from `1`.

In multi-repository mode, never rely on bare PR numbers such as `#111` as the only reference form because they are ambiguous across repositories.

Plan indices are only valid for the current plan snapshot. If the plan is rebuilt, treat indices as refreshed.

Do not rely on Markdown link rendering for terminal usability. Prefer raw `https://...` URLs so the environment can auto-detect clickable links when supported.

Describe candidate actions in user-facing terms instead of CLI shorthand.

Prefer:

- `动作: squash merge 到 PR 的目标分支，并删除分支`
- `动作: 先添加 approve review，再 squash merge 到 PR 的目标分支，并删除分支`

Do not use terse labels such as `approve + squash merge` as the only execution description.

Prefer a compact summary like:

```text
已扫描预设仓库 5 个，发现 Renovate PR 8 个。

候选执行 3 个
1. flc1125/go-cron#123 chore(deps): update module github.com/xxx/yyy to v1.2.3
  https://github.com/flc1125/go-cron/pull/123
  动作: 先添加 approve review，再 squash merge 到 PR 的目标分支，并删除分支
2. go-fries/fries#45 chore(deps): update github actions/cache action to v4
  https://github.com/go-fries/fries/pull/45
  动作: squash merge 到 PR 的目标分支，并删除分支
3. flc1125/go-yuque#67 chore(deps): update module github.com/aaa/bbb to v0.9.1
  https://github.com/flc1125/go-yuque/pull/67
  动作: 先添加 approve review，再 squash merge 到 PR 的目标分支，并删除分支

跳过 5 个
4. flc1125/go-yuque#130 chore(deps)!: update module github.com/aaa/bbb to v2
  https://github.com/flc1125/go-yuque/pull/130
  原因: major
5. go-tapd/tapd#131 chore(deps): update module github.com/ccc/ddd
  https://github.com/go-tapd/tapd/pull/131
  原因: checks pending
6. flc1125/go-gitlab-webhook#132 chore(deps): update module github.com/eee/fff
  https://github.com/flc1125/go-gitlab-webhook/pull/132
  原因: blocked
7. go-fries/fries#133 chore(deps): update module github.com/ggg/hhh
  https://github.com/go-fries/fries/pull/133
  原因: 需人工判断
8. go-fries/fries#134 chore(deps): replace package xxx with yyy
  https://github.com/go-fries/fries/pull/134
  原因: 需人工判断

回复“执行”开始，或直接说“排除 2”“只执行 1 3”“只执行 go-cron”“包含 major”。
```

If the user asks what `执行` will do, or appears uncertain, add an `执行后会发生` block with one line per PR that restates the exact side effects in plain language.

### 3. Apply manual overrides

Accept natural-language overrides such as:

- `只执行 1 3`
- `排除 2`
- `排除 flc1125/go-cron#123`
- `只执行 go-cron`
- `只处理 flc1125/go-cron`
- `只执行 flc1125/go-cron#123 go-fries/fries#124`
- `包含 major`

Prefer plan indices for quick selection in multi-repository mode, and prefer `owner/repo#number` when the user needs an unambiguous persistent reference across turns.

Only accept bare PR numbers such as `#123` in a single-repository context. In multi-repository mode, require either a current-plan index or a full `owner/repo#number` reference.

Treat `只执行 <index>` as selecting from the current `候选执行` set by default. If the user references a `跳过` item by index, do not silently add it to execution. Instead, explain the skip reason and ask for an explicit override that matches the risk, such as `包含 major` followed by a rebuilt plan.

### 4. Confirm before execution

Before any write action:

- restate the exact PRs that will be processed
- restate the action per PR
- wait for explicit confirmation such as `执行`, `确认执行`, or a clearly equivalent instruction

Prefer structured confirmation controls when the host environment supports them.

Recommended confirmation choices:

- `执行当前计划`
- `取消`
- `只执行...`
- `排除...`
- `包含 major 并重建计划`

If structured controls are unavailable, fall back to short text commands:

- `y`: execute the current plan
- `n`: cancel
- `o <refs>`: only the listed indices, repositories, or PRs
- `x <refs>`: exclude the listed indices, repositories, or PRs
- `m`: include major PRs and rebuild the plan

Still accept natural-language confirmation and override requests.

If the user does not confirm, stop after presenting the plan.

### 5. Execute and report

Execution policy:

- `flc1125/*`: `approve` first, then `squash merge`
- other repositories: `squash merge`

Use commands such as:

```bash
gh pr review PR_NUMBER -R OWNER/REPO --approve --body "LGTM. Auto-approved by workflow."
gh pr merge PR_NUMBER -R OWNER/REPO --squash --delete-branch
```

Run PRs one by one.

Continue even if one PR fails.

Return:

- per-PR result
- exact failed step when relevant
- final summary with success and failure counts

## Manual Override Rules

Apply these rules when the user changes scope after the plan is shown:

- repo filters remove other repositories from the execution set
- explicit PR numbers win over broader repo filters
- current-plan indices are shorthand for indexed plan items in the latest visible plan
- bare `#123` references are only valid in a single-repository context
- skipped items do not enter the execution set unless the user gives an explicit override that addresses the skip reason
- `包含 major` only changes the major exclusion rule; it does not bypass final confirmation
- if the new request invalidates the current scan, rescan before execution

## Failure Handling

- If `gh` auth is invalid, ask the user to run `gh auth login`.
- If approve or merge is denied, report the exact failed step and continue.
- If branch protection or merge state blocks the PR, report it as blocked.
- Never claim approve or merge success without command success evidence.

## Red Flags

Stop and reassess when:

- the target repository or URL is malformed
- the repository is inaccessible
- the PR is not clearly Renovate-authored
- the plan contains too many `需人工判断` items to justify batch execution
- the user asks to execute without a visible candidate plan in the current turn
