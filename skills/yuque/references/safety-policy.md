# Safety Policy

Use this file to decide whether a Yuque action should execute or stop at a preflight plan.

## Allowed By Default

- all documented read flows
- repo creation and metadata updates
- doc creation and updates
- member role changes
- TOC insertion, move, and rename operations that do not delete anything

## Guarded By Default

- doc deletion
- repo deletion
- TOC node removal
- member removal
- any batch action that can affect many docs or nodes in one step

## Preflight Template For Dangerous Actions

Before executing a dangerous request, prepare:

- target type
- target identifiers
- owning group or repo
- endpoint and HTTP method
- expected impact
- reversibility assessment
- safer alternatives

If the environment does not provide an explicit confirmation path, stop after producing the preflight summary.

## Safer Alternatives

- instead of deleting a doc, move it to an archive section or rename it clearly
- instead of deleting a repo, change visibility or mark it deprecated
- instead of removing a TOC node, move it under an archive branch
- instead of removing a member, downgrade the role when that satisfies the request
