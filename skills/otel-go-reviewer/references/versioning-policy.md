# Versioning Policy

Use this file when the review touches exported APIs, stable telemetry, module boundaries, or release-sensitive behavior.

## Primary source

See [source-map.md](source-map.md) for upstream `VERSIONING.md`.

## Mandatory first check

Before judging compatibility severity, identify whether the touched module is:

- stable: major version greater than `v0`
- experimental: `v0`
- mixed: both stable and experimental modules are touched

Do not review stable and `v0` changes with the same default severity.

## Stable module expectations

- stable public APIs are compatibility-sensitive
- stable emitted telemetry is compatibility-sensitive because users depend on alerts and dashboards
- changes to stable interfaces are highly constrained
- findings about stable-module breakage usually deserve stronger severity than equivalent `v0` findings

## Experimental module expectations

- `v0` modules can change incompatibly
- incompatible `v0` changes are not automatically acceptable; still review them for clarity, migration impact, and changelog needs
- if a `v0` change bleeds into stable modules or stable telemetry, treat the stable surface as the governing boundary

## Interface evolution

- Some exported interfaces explicitly warn that methods may be added in minor releases
- Without that warning, stable interfaces should not be mutated casually
- For specification-defined interface changes, check the repository's staged choreography:
  - the SDK should learn the new method before the API requires it
  - the review should consider mixed-version upgrade paths, not only clean-head builds

## Versioning consequences to check

- Does the diff change behavior in a stable module without acknowledging compatibility impact?
- Does it change emitted telemetry from a stable module?
- Does it introduce a stable module dependency on an experimental surface?
- Does it assume a version transition path that repository policy would reject?
- Does it require changelog or migration guidance because users may need to update code, dashboards, or alerts?

## Review consequences

Raise at least an `Important` finding when:

- stable API compatibility is weakened without a clearly allowed path
- stable emitted telemetry changes without justification or migration guidance
- a review treats `v0` and stable modules as if they had the same compatibility promises
- a spec-interface change ignores the staged SDK-before-API evolution path

Raise `Critical` when:

- the change is likely to break stable-module users or stable telemetry consumers without an acceptable versioning path
