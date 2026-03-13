# Flc's Skills Marketplace Design Philosophy

The core objective of this project is to build an **"Efficient, Minimalist, and Developer-Friendly"** AI Skill discovery and distribution platform. During the design and implementation process, we followed these core principles, which can be reused and referenced in future similar projects.

## 1. Minimalist Design
*   **SaaS Aesthetics**: Avoid flashy decorations; use a neutral color palette (black, white, gray) and high-whitespace layouts to emphasize information scanning efficiency.
*   **Atomic Functionality**: Removed all non-core fields (such as author, version, category tags), allowing users to focus entirely on the Skill's name and functional description.
*   **Unified Icon Language**: Uses a consistent `Terminal` icon to reinforce the "tool/command" attribute.

## 2. Efficiency-First Interaction
*   **Embedded Install Commands**: Installation instructions are embedded directly into the Skill details with a one-click copy function. Seamless integration from discovery to installation is achieved via the `npx` CLI tool.
*   **Immersive Modals**: Details pop up instantly without breaking the user's browsing context. Closing returns the user exactly where they were, making the interaction cost extremely low.
*   **Deep Linking**: Every Skill has a unique URL parameter (`?skill=slug`), supporting direct sharing and precise access.

## 3. Dynamic Data-Driven (File-based CMS)
*   **Git as Database**: No traditional backend database is used; instead, the local file system is scanned directly.
*   **Zero-Config Expansion**: Adding a new folder and `SKILL.md` in the `skills/` directory allows the marketplace to automatically recognize and list it. This architecture significantly reduces content maintenance costs.

## 4. Extreme Performance (Performance & SEO)
*   **SSG Architecture**: Leverages Next.js's Static Site Generation capabilities. All Skill lists are generated as HTML during the build phase.
*   **Instant Loading**: By reading files on the server side, the client doesn't need to make extra API requests for the initial load, ensuring an optimal user experience.

## 5. Cross-Platform Consistency
*   **Native Dark Mode**: Full native support for system dark mode switching, from the UI to the Favicon, ensuring long-term usage comfort.

---

*This document aims to record the soul of this project. Any future functional iterations or style adjustments should be considered based on these principles.*
