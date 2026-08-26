# ELI5

Create a picture-first explanation of a topic for someone with no prior knowledge.

The skill produces a self-contained HTML artifact with large visuals, short labels, one concrete example, and a concise takeaway.

## Install

```bash
npx skills add https://skills.flc.io --skill eli5
```

If the custom skill source is temporarily unavailable, install from GitHub:

```bash
npx skills add https://github.com/flc1125/skills --skill eli5
```

## Usage

Invoke the skill with a topic:

```text
Use $eli5 to explain how DNS works.
```

It is intended for explicit ELI5 requests and picture-first explainers. Ordinary concise explanations do not need this skill.

## What This Version Adds

This repository keeps the upstream idea of explaining a topic with big pictures and very few words, while adding:

- tool-agnostic topic handling instead of relying on Claude-specific argument substitution
- a standalone HTML output contract with no packages, build step, or network access
- guidance for accurate analogies, responsive layout, and accessibility
- clearer activation boundaries and fallback behavior for other requested output formats

## Structure

```text
eli5/
├── SKILL.md
├── README.md
└── agents/
    └── openai.yaml
```

## Source Attribution

This skill is an adapted implementation inspired by the following upstream source:

- Author/Repository: `anthropics/claude-plugins-community`
- Upstream path: `eli5/skills/eli5/SKILL.md`
- URL: <https://github.com/anthropics/claude-plugins-community/blob/main/eli5/skills/eli5/SKILL.md>
