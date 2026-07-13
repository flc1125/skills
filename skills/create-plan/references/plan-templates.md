# Adaptive Plan Templates

Select the smallest template that makes the work executable. Remove irrelevant sections and add conditional sections only when supported by repository evidence.

## Contents

1. Compact plan
2. Implementation plan
3. Design draft
4. Conditional sections
5. Checklist writing rules

## 1. Compact Plan

Use for a bounded removal, migration, bug fix, dependency change, or configuration update.

```markdown
# <Outcome-oriented title>

状态：planned
日期：YYYY-MM-DD

## 目标

<One concrete outcome and its reason.>

## 范围

- <Included work>
- <Explicitly excluded adjacent work>

## 决策

<The chosen approach and why it is appropriate.>

## 迁移要点

<!-- Include only for incompatible changes. -->
- <Required downstream action>

## 验证

- [ ] `<repository command>`
- [ ] <Focused behavioral check>
```

Omit `迁移要点` when the change is compatible.

## 2. Implementation Plan

Use for a new component, refactor, public API change, or work spanning several phases.

````markdown
# <Component or refactor title>

状态：planned
日期：YYYY-MM-DD

## 背景与当前问题

<Verified current behavior, evidence, and why change is needed.>

## 目标

- <Observable outcome>
- <Completion criterion>

## 范围

- <Included component or contract>

## 非目标

- <Adjacent work deliberately excluded>

## 设计结论

| 能力或问题 | 结论 | 理由 |
| --- | --- | --- |
| ... | ... | ... |

## 目标 API 或行为

```text
<Signatures, data flow, or state transition when useful>
```

## 运行语义

<Errors, context, cancellation, panic, ordering, concurrency, lifecycle, persistence, or defaults.>

## 实施阶段

### 阶段 1：<Reviewable outcome>

1. <Action>
2. <Action>

### 阶段 2：<Reviewable outcome>

1. <Action>

## 测试计划

- [ ] <Normal behavior>
- [ ] <Boundary or failure behavior>
- [ ] <Concurrency, race, migration, or compatibility check when relevant>

## 验证命令

```bash
<commands that exist in this repository>
```

## 执行清单

- [ ] <Concrete implementation step>
- [ ] <Documentation or metadata step>
- [ ] <Validation step>
````

Add breaking change, migration, rollout, or pull request sections from the conditional set when needed.

## 3. Design Draft

Use when package boundaries, API shape, compatibility strategy, architecture, or another material decision remains open.

```markdown
# <Topic> 设计草案

状态：draft
日期：YYYY-MM-DD

## 草案说明

<State why this is not yet ready for implementation and what must be decided.>

## 背景

<Verified current state and constraints.>

## 核心问题

1. <Decision question>
2. <Decision question>

## 备选方案

### 方案 A：<Name>

<Shape, benefits, costs, compatibility, and risks.>

### 方案 B：<Name>

<Shape, benefits, costs, compatibility, and risks.>

## 初步倾向

<Preferred option and evidence, or state that no preference is justified yet.>

## 决策门槛

- [ ] <Evidence or decision required before promotion to planned>

## 候选实施阶段

<Only enough sequencing to evaluate feasibility; do not present unresolved work as approved execution.>

## 待确认问题

- <A question whose answer materially changes the design>
```

Promote the file to `planned` only after resolving the decision gates and rewriting the document into an unambiguous execution path.

## 4. Conditional Sections

### Breaking Changes

Add when downstream users must change code, configuration, data, deployment, or operating assumptions.

```markdown
## 破坏性变更

### 公开 API

- 删除 `<OldAPI>`；使用 `<NewAPI>`。

### 行为变化

- <Changed default, error, context, panic, ordering, timeout, retry, persistence, or lifecycle behavior.>
```

### Before and After

Use a table for several direct mappings and code for the primary migration path.

```markdown
## 迁移对照

| 变更前 | 变更后 |
| --- | --- |
| `<old>` | `<new>` |
```

Make code examples self-contained enough to understand required imports and surrounding declarations.

### Migration

```markdown
## 迁移步骤

1. 更新 import 或模块路径。
2. 替换被删除的 API。
3. 调整改变的默认值或错误处理。
4. 执行兼容性和回归验证。
```

State explicitly when no direct replacement exists. Separate required upgrade work from optional improvements.

### Pull Request Boundaries

```markdown
## PR 拆分

### PR 1：<Independent foundation>

- <Scope>
- <Validation>

### PR 2：<Dependent migration>

- 依赖 PR 1 合并。
- <Scope>
```

Each pull request should be independently reviewable and avoid temporary public APIs unless the transition requires them.

### Rollout and Rollback

Add for data, infrastructure, deployment, protocol, or high-risk operational changes.

Cover:

- compatibility window
- rollout order
- observability and success signals
- abort conditions
- rollback mechanism
- irreversible steps

### Current Status

Add to `in-progress`, `blocked`, or `completed` plans when a short status summary materially helps handoff. Report evidence, not a diary of every command.

## 5. Checklist Writing Rules

Write checklist items that can be objectively completed.

Prefer:

```markdown
- [ ] Replace `WithRetryPolicy` call sites with `WithMaxAttempts` and `WithBackoff`.
- [ ] Run `go test -race ./...` in the affected module.
```

Avoid:

```markdown
- [ ] Improve the implementation.
- [ ] Make tests better.
- [ ] Review everything.
```

Separate implementation, documentation, metadata, migration, and validation work when they can fail independently. Do not check an item until its stated result and required validation are complete.
