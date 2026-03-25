# otel-go-reviewer

Local skill for reviewing changes in `open-telemetry/opentelemetry-go` with a strict senior-maintainer standard.

## Install

```bash
npx skills add https://github.com/flc1125/skills --skill otel-go-reviewer
```

## Scope

- review diffs, pull requests, or design changes in `opentelemetry-go`
- enforce OpenTelemetry specification compliance as a primary standard
- enforce repository contribution rules from `CONTRIBUTING.md`
- require changelog review for user-facing changes
- treat performance-critical paths with a high-scrutiny, measurement-driven mindset

## Structure

```text
otel-go-reviewer/
├── SKILL.md
├── README.md
├── references/
│   ├── changelog-policy.md
│   ├── repo-rules.md
│   ├── source-map.md
│   └── spec-review.md
└── agents/
    └── openai.yaml
```

## Notes

This skill is intentionally opinionated. It reviews `opentelemetry-go` changes as if every stable behavior will be depended on, every hot-path regression will be amplified at scale, and every spec deviation will create ecosystem pain later.

The skill keeps executable guidance local in `references/` and uses upstream repository documents and specification pages as authority sources when exact wording or tie-breaking is needed.

## Source Attribution

This skill is informed by upstream project documents and OpenTelemetry specification sources:

- Repository: `open-telemetry/opentelemetry-go`
- `CONTRIBUTING.md`: <https://github.com/open-telemetry/opentelemetry-go/blob/main/CONTRIBUTING.md>
- `CHANGELOG.md`: <https://github.com/open-telemetry/opentelemetry-go/blob/main/CHANGELOG.md>
- `VERSIONING.md`: <https://github.com/open-telemetry/opentelemetry-go/blob/main/VERSIONING.md>
- OpenTelemetry specification entry point: <https://opentelemetry.io/docs/specs/otel/>
