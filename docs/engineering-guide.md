# Flc's Skills Engineering Guide

This document provides detailed guidance for developing, debugging, building, and deploying the **Flc's Skills** marketplace.

## 1. Tech Stack Overview
*   **Frontend Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS + @tailwindcss/typography
*   **Animations**: Framer Motion
*   **Accessible Components**: Headless UI
*   **Data Parsing**: gray-matter (Markdown frontmatter parsing)
*   **Icon Library**: Lucide React

## 2. Local Development
After cloning the repository, follow these steps to start the development server:

```bash
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
name: My New Skill
description: A very useful description of this new skill, ideally around three lines.
---

# Skill Title
Write the full Markdown documentation for the skill here.
```

## 4. Debugging & Common Issues
*   **Icons not displaying**: Ensure the icon name matches [Lucide Icons](https://lucide.dev/icons) naming conventions.
*   **Styles not updating**: Verify Tailwind directives are correctly configured in `src/app/globals.css`.
*   **Markdown rendering errors**: Check the YAML frontmatter format in `SKILL.md` (wrapped in `---` and free of YAML syntax errors).

## 5. Build & Testing
It's recommended to perform a full build test before production deployment:

```bash
# Run full build
npm run build
```
Once the build is successful, all Skill pages will be statically generated in the `.next/` directory.

## 6. Deployment Guide (e.g., Vercel)
This project is deeply compatible with Vercel; an automated build solution is recommended.

1.  **Link Git Repository**: Import your repository into Vercel.
2.  **Build Settings**: Vercel automatically recognizes Next.js.
    *   Framework Preset: `Next.js`
    *   Build Command: `npm run build`
    *   Install Command: `npm install`
3.  **Environment Variables**: This project currently doesn't require specific production environment variables.
4.  **Deployment**: Click Deploy. Once the build is finished, your site is live.

### Other Deployment Methods:
*   **Docker**: Use official Next.js images for containerized deployment.
*   **Static Export**: Since this project uses API routes for dynamic details loading, `next export` is not recommended unless modified for static routing.

---

*For further technical questions, please refer to the [Next.js Documentation](https://nextjs.org/docs).*
