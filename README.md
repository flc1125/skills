# flc1125/skills

An open repository of reusable skills maintained for personal use and public reuse.

This repo contains installable skills that can be added directly from GitHub and used as building blocks for agent workflows, AI assistants, or other compatible tools.

## ✨ Overview

- Install individual skills directly from this repository
- Discover skill names from each skill's `SKILL.md`
- Reuse the repository as a lightweight source of portable skills

## 📦 Installation

Install a specific skill from this repository with:

```bash
npx skills add https://github.com/flc1125/skills --skill <skill-name>
```

For example:

```bash
npx skills add https://github.com/flc1125/skills --skill engineering-backend-architect
```

## 🔎 How to Find the Skill Name

Each skill includes a `SKILL.md` file. The skill name is typically defined in the frontmatter `name` field:

```yaml
name: engineering-backend-architect
```

You can search the repository for all `SKILL.md` files with:

```bash
find . -name SKILL.md
```

Open the relevant file and use its `name` value as the `--skill` argument.

## 🚀 Usage

Once installed, a skill can be used through your local skills setup or any compatible tool that supports this format. Refer to the skill's own `SKILL.md` for its purpose, trigger guidance, and usage details.

## 📝 License

This repository is licensed under the MIT License. See [LICENSE](./LICENSE).
