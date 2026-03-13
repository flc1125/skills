<div align="center">
  <img src="public/favicon.svg" width="64" height="64" alt="Flc's Skills Logo" />

  # Flc's Skills

  A curated collection of specialized skills for AI Agents, optimized for discovery and seamless integration.

  [![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
  [![Built on Vercel](https://img.shields.io/badge/Built%20on-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com/flc1125/skills)

  ### 🚀 [https://skills.flc.io](https://skills.flc.io)
</div>

---

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
