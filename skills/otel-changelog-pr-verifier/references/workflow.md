# Workflow Reference

Use this file when the `otel-changelog-pr-verifier` skill needs concrete commands, decision rules, or response formatting.

The default repository example is `open-telemetry/opentelemetry-go`, but the same workflow applies to similar OpenTelemetry Go repositories. When the local checkout is ambiguous, make the repository explicit with `-R <owner/repo>`.

## Command Set

### Local preparation

```bash
gh pr checkout <pr-number>
gh pr checkout <pr-number> -R <owner/repo>
git status --short --branch
git remote -v
gh pr view <pr-number> --json baseRefName
gh pr view <pr-number> -R <owner/repo> --json baseRefName
git diff --stat origin/<base-branch>...HEAD -- CHANGELOG.md
git diff origin/<base-branch>...HEAD -- CHANGELOG.md
```

Prefer auto-detecting the base branch from PR metadata instead of assuming `main`.

### Release section extraction

Read the current release block only:

```bash
awk '/^## \[<release>\]/{flag=1;print;next}/^## \[<previous-release>\]/{flag=0}flag' CHANGELOG.md
```

Get line numbers for reportable findings:

```bash
nl -ba CHANGELOG.md | sed -n '<start>,<end>p'
```

### PR number extraction

```bash
awk '/^## \[<release>\]/{flag=1;next}/^## \[<previous-release>\]/{flag=0}flag' CHANGELOG.md | rg -o '#[0-9]+' -N | sort -u
```

### GitHub verification

Single PR:

```bash
gh pr view <number> --json number,title,url,state,mergedAt
gh pr view <number> -R <owner/repo> --json number,title,url,state,mergedAt
```

Batch:

```bash
for n in <numbers>; do
  gh pr view "$n" --json number,title,url,state,mergedAt
done
```

## Matching Heuristics

Treat an entry as correct when most of the following align:

- package or subsystem matches, such as `sdk/resource`, `trace`, `attribute`, `otlpmetrichttp`
- operation matches, such as add, fix, deprecate, optimize, limit, support
- named API, option, env var, or type matches, such as `WithService`, `EMPTY`, `TraceIdRatioBased`
- the PR title is a concise restatement of the same user-visible change

Treat an entry as suspicious when any of the following apply:

- package names differ materially
- the changelog says "add" but the PR is clearly about an unrelated fix or refactor
- the changelog names a symbol or option not present in the PR title or scope
- multiple nearby entries appear shifted by one PR number

Do not flag these by themselves:

- wording style differences between changelog prose and PR titles
- broader changelog text that expands on a narrower PR title
- one PR being referenced by multiple changelog lines when the change affected multiple packages

## Output Templates

### No issues

```markdown
未发现错误项。
```

### Issues found

```markdown
- [CHANGELOG.md:<line>](/absolute/path/to/CHANGELOG.md#L<line>) `<entry text>`
  uses `#<number>`, but the referenced PR is `<title>`.
  PR URL: <url>
```

### Optional summary table

Use only if the user asks for a complete mapping:

```markdown
| CHANGELOG line | PR | Title | Status |
|---|---|---|---|
```
