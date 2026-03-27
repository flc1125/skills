# github-renovate-prs

Local Codex skill for scanning GitHub Renovate pull requests, building a conservative execution plan, and approving or merging only after explicit confirmation.

## Install

```bash
npx skills add https://github.com/flc1125/skills --skill github-renovate-prs
```

## Purpose

Use this skill when you want Codex to batch-check Renovate PRs across a known repository set or a specific GitHub repository, then prepare a compact candidate plan before taking any write action.

The workflow is intentionally conservative:

- identify Renovate-authored PRs
- classify each PR into candidate or skip buckets
- show a stable, referenceable plan
- wait for explicit confirmation before approve or merge operations

> [!IMPORTANT]
> This skill never approves or merges by default. It is designed to stop at the plan stage until the user explicitly confirms execution.

## What This Skill Adds

- preset multi-repository scanning when no target is provided
- Renovate-specific triage buckets such as `候选执行`, `跳过: major`, and `跳过: checks`
- stable per-plan indices for plan discussion and overrides
- execution rules that differ for `flc1125/*` and other repositories
- confirmation-first merge flow with clear skip reasons and failure reporting

## Default Repository Set

When no repository is specified, the skill scans this preset set:

- `go-fries/fries`
- `go-tapd/tapd`
- `flc1125/go-twca`
- `flc1125/go-cron`
- `flc1125/go-gitlab-webhook`
- `flc1125/go-yuque`

## How It Works

1. Resolve the target from an explicit `owner/repo`, PR URL, repository URL, or the preset repository set.
2. Identify Renovate PRs using known Renovate actors.
3. Build a concise plan with candidates, skipped items, raw PR URLs, and user-facing actions.
4. Accept scoped overrides such as excluding an item, narrowing to one repository, or rebuilding the plan with `包含 major`.
5. Execute PRs one by one only after an explicit confirmation such as `执行`.

## Usage Notes

- Interaction is kept in Chinese unless the user asks otherwise.
- In multi-repository mode, prefer plan indices or full `owner/repo#number` references.
- Bare PR references like `#123` are only safe in a single-repository context.
- Skipped items stay out of the execution set unless the user gives an explicit override that addresses the skip reason.

## Requirements

- `gh` must be installed and authenticated
- the target repositories must be accessible to the current GitHub account
- the execution environment must allow running GitHub CLI commands
