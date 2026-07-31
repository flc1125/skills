<div align="center">
  <img src="web/public/favicon.svg" width="64" height="64" alt="Flc's Skills Logo" />

  # Flc's Skills

  A curated collection of specialized skills for AI Agents, optimized for discovery and seamless integration.

  [![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-6-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
  [![Built on Vercel](https://img.shields.io/badge/Built%20on-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com/flc1125/skills)

  ### 🚀 [https://skills.flc.io](https://skills.flc.io)
</div>

---

An open repository of reusable skills maintained for personal use and public reuse.

This repo contains a Claude Code plugin, a Codex plugin, and installable skills that can be added directly from GitHub and used as building blocks for agent workflows, AI assistants, or other compatible tools.

The installable skill content lives in `skills/`. The Next.js marketplace that powers [skills.flc.io](https://skills.flc.io) now lives in `web/`.

## ✨ Overview

- Install the full skill collection as a Claude Code or Codex plugin
- Install individual skills directly from this repository
- Browse available skills on the visual marketplace at [skills.flc.io](https://skills.flc.io)
- Reuse the repository as a lightweight source of portable skills

## 📦 Installation

### Install as a Claude Code plugin

Add this repository as a Claude Code plugin marketplace, then install the bundled `skills` plugin:

```bash
claude plugin marketplace add flc1125/skills
claude plugin install skills@flc-skills
```

Or use the interactive `/plugin` command inside Claude Code. Plugin skills are namespaced, so invoke them as `/skills:<skill-name>` (for example `/skills:code-review`).

Use this path when you want the full collection available in Claude Code.

### Install as a Codex plugin

Add this repository as a Codex plugin marketplace, then install the bundled `skills` plugin:

```bash
codex plugin marketplace add flc1125/skills
codex plugin add skills@flc-skills
```

Use this path when you want the full collection available in Codex.

### Install an individual skill

Use `npx skills add` when you only want one skill, want to choose from an interactive prompt, or are using a compatible skill installer outside the Codex plugin system.

Choose a skill interactively:

```bash
npx skills add https://github.com/flc1125/skills
```

Install a specific skill directly:

```bash
npx skills add https://github.com/flc1125/skills --skill <skill-name>
```

For example:

```bash
npx skills add https://github.com/flc1125/skills --skill engineering-backend-architect
```

If you install a specific skill directly, use the skill's install name shown on the marketplace or in its `SKILL.md`, not the marketplace URL slug.

## 🚀 Usage

Browse all published skills at [skills.flc.io](https://skills.flc.io).

After installing the Codex plugin, start a new Codex thread and ask Codex to use the relevant workflow, or invoke a bundled skill explicitly. If you install an individual skill directly, use it through your local skills setup or any compatible tool that supports this format.

Refer to each skill's `SKILL.md` for its purpose, trigger guidance, and usage details.

## 🛠 Development

The web marketplace is a standalone Next.js app under `web/`.

```bash
cd web
npm install
npm run dev
```

Use `npm run lint` and `npm run build` inside `web/` to validate marketplace changes.

## 📝 License

This repository is licensed under the MIT License. See [LICENSE](./LICENSE).
