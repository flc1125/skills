# Flc's Skills Engineering Guide

This document provides detailed guidance for developing, debugging, building, and deploying the **Flc's Skills** marketplace.

## 1. Tech Stack Overview
*   **Frontend Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS + @tailwindcss/typography
*   **Animations**: Framer Motion
*   **Accessible Components**: Headless UI
*   **Data Parsing**: gray-matter (Markdown frontmatter parsing)
*   **Public Interaction Counts**: Upstash Redis through `@upstash/redis`
*   **Icon Library**: Lucide React
*   **Linting**: ESLint 9 with `eslint-config-next`

## 2. Local Development
After cloning the repository, follow these steps to start the development server:

```bash
cd web

# Install dependencies
npm install

# Start development server
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000) for preview.

## 3. Data Maintenance
The Skill data is stored in the `skills/` directory at the root level.

### How to add a new Skill:
1.  Create a new folder in the `skills/` directory (e.g., `my-new-skill`).
2.  Create a `SKILL.md` file in that folder.
3.  Fill in the metadata at the top of the `SKILL.md` and write the main content:

```markdown
---
name: my-new-skill
description: A concise summary of what this skill does and when to use it.
---

# Skill Title
Write the full Markdown documentation for the skill here.
```

## 4. Debugging & Common Issues
*   **Icons not displaying**: Ensure the icon name matches [Lucide Icons](https://lucide.dev/icons) naming conventions.
*   **Styles not updating**: Verify Tailwind directives are correctly configured in `web/src/app/globals.css`.
*   **Markdown rendering errors**: Check the YAML frontmatter format in `SKILL.md` (wrapped in `---` and free of YAML syntax errors).
*   **Installation command looks wrong**: Use the frontmatter `name` field as the install identifier. The marketplace deep-link slug is a separate URL concern.
*   **Lint command fails after a Next upgrade**: On Next.js 16, use the ESLint CLI via `npm run lint`; `next lint` is no longer the supported entrypoint.
*   **Web app can't find skills after the move**: The marketplace now runs from `web/` and reads content from the repository-root `skills/` directory.

## 5. Build & Testing
It's recommended to perform a full build test before production deployment:

```bash
cd web

# Run lint checks
npm run lint

# Run full build
npm run build
```
Once the build is successful, the homepage is prerendered and the skill detail API route is emitted for on-demand reads.

If you are building in a restricted local sandbox and hit a Turbopack process error, use:

```bash
npx next build --webpack
```

That fallback is mainly useful for constrained local environments; standard deployments can continue using `npm run build`.

## 6. Deployment Guide (e.g., Vercel)
This project is deeply compatible with Vercel; an automated build solution is recommended.

1.  **Link Git Repository**: Import your repository into Vercel.
2.  **Build Settings**: Vercel automatically recognizes Next.js once the project root is set correctly.
    *   Root Directory: `web`
    *   Framework Preset: `Next.js`
    *   Build Command: `npm run build`
    *   Install Command: `npm install`
3.  **Environment Variables**: The marketplace works without environment variables, but public skill view and copy counts require an Upstash Redis integration:
    *   `UPSTASH_REDIS_REST_URL`
    *   `UPSTASH_REDIS_REST_TOKEN`
    Install Upstash Redis from the Vercel Marketplace and connect it to the project so Vercel injects both values. Older Marketplace connections may use the supported `KV_REST_API_URL` and `KV_REST_API_TOKEN` aliases instead. When neither pair is present or Redis is unavailable, the marketplace continues to render and hides interaction counts.
4.  **Deployment**: Click Deploy. Once the build is finished, your site is live.

### Other Deployment Methods:
*   **Docker**: Use official Next.js images for containerized deployment.
*   **Static Export**: Since this project uses API routes for dynamic details loading, `next export` is not recommended unless modified for static routing.

## 7. Public Skill Statistics

The marketplace stores public view and copy totals in Upstash Redis. Counts begin at zero when Redis is connected; existing Google Analytics events are not backfilled automatically. A view is counted at most once per anonymous visitor and skill within 24 hours. A successful command copy is counted at most once per anonymous visitor and skill within 10 seconds. The visitor identifier is an HTTP-only, same-site random cookie and does not encode personal information.

The public `GET /api/stats` endpoint returns all skill totals in one response and is cached at the CDN for 60 seconds. `POST /api/stats/:slug` accepts a `view` or `copy` interaction, validates the skill slug, applies the deduplication window, and returns the updated total. The UI hides the counters when Redis is not configured instead of showing misleading zeroes.

## 8. WebMCP Progressive Enhancement

The marketplace exposes four browser-native WebMCP tools when the current browser implements `document.modelContext.registerTool()`:

*   `search_skills`: Search skill names and descriptions or list the newest skills.
*   `get_skill_detail`: Load the complete metadata and Markdown content for a skill.
*   `get_install_command`: Return the individual `npx skills add` command for a skill.
*   `open_skill`: Open a skill detail modal in the current browser tab.

WebMCP is a progressive enhancement. The registration component performs feature detection in the browser and renders nothing. Unsupported and older browsers skip registration while retaining the complete marketplace UI and API behavior. Registration uses an `AbortSignal` so tools are automatically removed when the component unmounts, and registration failures do not block page rendering.

---

*For further technical questions, please refer to the [Next.js Documentation](https://nextjs.org/docs).*
