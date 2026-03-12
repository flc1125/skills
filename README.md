# flc1125/skills

This is a personal Codex Skills repository for storing and sharing skills that can be installed on demand.

## 📦 Installation

Install a specific skill from this repository with `npx skills add`:

```bash
npx skills add https://github.com/flc1125/skills --skill <skill-name>
```

Example:

```bash
npx skills add https://github.com/flc1125/skills --skill engineering-backend-architect
```

## 🔎 How to Find the Skill Name

Each skill includes a `SKILL.md` file. The skill name is usually defined in the frontmatter `name` field. For example:

```yaml
name: engineering-backend-architect
```

You can also search the repository for all `SKILL.md` files:

```bash
find . -name SKILL.md
```

Open the matching file and use its `name` value as the `--skill` argument.

## 📝 License

This repository is licensed under the MIT License. See [LICENSE](./LICENSE).
