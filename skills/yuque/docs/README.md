# Yuque OpenAPI Docs

This directory stores local documentation artifacts for the `yuque` skill.

## Files

- `yuque_openapi_20251121_green.yaml`: local copy of the Yuque OpenAPI definition used to design and extend this skill
- `auth.md`: authentication rules and local token usage guidance

## Source

Original documentation page:

- https://www.yuque.com/yuque/developer/openapi

## Usage

Use this YAML file when:

- reviewing endpoint coverage for the skill
- updating `references/` content
- adding or adjusting `scripts/`
- checking schema details before enabling more Yuque features

Use `auth.md` when:

- wiring local authentication for script execution
- checking token resolution order
- deciding between environment variables and command-line token input

Use `../.env.example` as the local template for `.env` when enabling authenticated execution.

## Update Notes

When Yuque updates its OpenAPI definition, replace the local YAML copy in this directory and review:

- `SKILL.md`
- `references/`
- `scripts/`
