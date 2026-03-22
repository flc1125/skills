# Repository Guidelines

## Project Structure & Module Organization
This repository combines a small Next.js marketplace app with installable skill content. App code lives in `src/app` (routes, layout, global styles), reusable UI components in `src/components`, and parsing/helpers in `src/lib`. Static assets are under `public/`. Documentation lives in `docs/`. Each installable skill lives in `skills/<skill-name>/` and should include a `SKILL.md`; related references, docs, and agent configs stay beside it.

## Build, Test, and Development Commands
Use `npm install` to install dependencies. Run `npm run dev` to start the local Next.js server at `http://localhost:3000`. Run `npm run lint` for the primary quality gate with ESLint 9 and Next.js rules. Run `npm run build` to verify production output. In restricted environments where Turbopack build workers fail, use `npx next build --webpack` as a fallback.

## Coding Style & Naming Conventions
Write TypeScript and React with 2-space indentation omitted in favor of the repository’s current style: concise files, semicolons, and single quotes. Keep React components and files in PascalCase, such as `SkillCard.tsx`; utility modules use lowercase names such as `utils.ts`. Prefer App Router conventions in `src/app`, and keep skill directory names kebab-case, matching the skill install name where possible.

## Testing Guidelines
There is no dedicated automated test suite yet. Treat `npm run lint` and `npm run build` as required validation before opening a PR. For content changes, manually verify the affected skill page and confirm the `SKILL.md` frontmatter parses correctly. If you add tests later, place them near the relevant module or in a clearly named `tests/` directory and use descriptive names like `skills-api.test.ts`.

## Commit & Pull Request Guidelines
Recent history follows Conventional Commit style, for example `feat(subagent-orchestrator): add Codex subagent orchestration skill` and `chore(deps): update nextjs monorepo to v16.2.1`. Keep commit subjects imperative and scoped when useful. PRs should explain the user-visible change, list validation performed (`npm run lint`, `npm run build`), and link related issues. Include screenshots for UI changes and note any new skill slugs, routes, or metadata expectations.

## Content & Configuration Notes
Use the `name` field in each `SKILL.md` frontmatter as the install identifier. Keep marketplace URL slugs and install names aligned unless there is a clear reason not to. Avoid introducing required environment variables unless deployment documentation is updated in `docs/engineering-guide.md`.
