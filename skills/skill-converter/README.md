# Skill Converter

`skill-converter` adapts an upstream agent spec, prompt file, markdown role definition, or similar source document into a local skill that fits this repository.

## Files

- `SKILL.md`: executable skill instructions for converting and packaging the source material
- `agents/openai.yaml`: OpenAI-facing metadata and default prompt
- `README.md`: human-facing summary of the skill's purpose, file set, and scope boundaries

## Usage

Use this skill when importing an external role or prompt into the local skill format, or when auditing whether an imported skill matches repository conventions.

The skill keeps the source capability as the core artifact and treats repository-specific files as a thin adaptation layer.

## Scope

This skill is intended for converting source material into a reusable local skill. It is not a generic documentation rewrite or code migration workflow.
