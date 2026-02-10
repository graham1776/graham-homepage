# CLAUDE.md

## Project Overview

Personal portfolio and blog website for Graham Wahlberg. A static multi-page site built with **Vite + vanilla TypeScript** — no framework (React, Vue, etc.). All DOM manipulation is done with native browser APIs.

## Tech Stack

- **Build tool:** Vite 6.2
- **Language:** TypeScript 5.7 (strict mode, JSX enabled via `react-jsx`)
- **Target:** ES2020, ESM modules
- **Styling:** Single global CSS file (`index.css`) — no preprocessor or CSS-in-JS
- **Deployment:** Static site hosted on Vercel
- **Dependencies:** Zero production dependencies; only devDependencies (vite, typescript, @types/node)

## Repository Structure

```
├── index.html              # Home page entry
├── art.html                # Art gallery page
├── blog.html               # Blog listing page
├── projects.html           # Projects showcase
├── business-ideas.html     # Business ideas page
├── contact.html            # Contact page
├── links.html              # Curated links page
├── now.html                # "Now" page
├── index.tsx               # Main application logic (all pages)
├── index.css               # Global stylesheet (all pages)
├── vite.config.ts          # Vite config with multi-page build + manifest plugin
├── tsconfig.json           # TypeScript configuration
├── metadata.json           # Site metadata
└── public/content/         # Dynamic content loaded at runtime
    ├── about.md            # About page markdown
    ├── art/                # Generative art modules (*.js)
    ├── blog/               # Blog posts (*.md) + manifest.json
    └── projects/           # Project directories + manifest.json
```

## Commands

```sh
npm install          # Install dependencies
npm run dev          # Start Vite dev server with hot reload
npm run build        # Production build (output: dist/)
npm run preview      # Preview production build locally
```

There are no test, lint, or format commands configured.

## Architecture & Key Patterns

### Multi-Page Build

Vite is configured with 8 HTML entry points (`vite.config.ts`). Each HTML file is a separate page sharing the same `index.tsx` and `index.css`. All pages are bundled independently during production build.

### Dynamic Content via Manifests

Content (projects, blog posts, art) is loaded at runtime via `fetch()` from JSON manifests in `public/content/`. Manifests are **auto-generated during build** by a custom Vite plugin (`generateManifests` in `vite.config.ts`).

- `public/content/projects/manifest.json` — scans project directories for `metadata.json`
- `public/content/art/manifest.json` — scans `*.js` art module files, extracts `metadata` via regex

### Custom Markdown Parser

The project uses a **hand-written markdown-to-HTML converter** in `index.tsx` (functions `markdownToHtml` and `applyInlineMarkdown`). It supports headings (H1–H3), paragraphs, unordered lists, bold, italic, and links. No markdown library is used.

### Art Module System

Each art piece in `public/content/art/` is a standalone `.js` file that exports:
```js
export const metadata = { title: "...", description: "..." };
export function render(canvas, ctx) { /* Canvas 2D drawing */ }
```
Art modules are bundled via `import.meta.glob('./public/content/art/*.js')` and rendered into canvas elements. A modal system allows fullscreen viewing with a regenerate button.

### Core TypeScript Interfaces

Defined in `index.tsx`:
- `Project` — `{ folderName, title, description, thumbnail?, entryPoint? }`
- `BlogManifestEntry` — `{ fileName, title, date (YYYY-MM-DD), snippet }`
- `ArtPiece` — `{ fileName, title, description }`

## Code Conventions

- **No framework abstractions** — use `document.getElementById`, `innerHTML`, `addEventListener`, etc.
- **Single CSS file** with BEM-inspired class naming (`.project-card`, `.blog-post-summary`, `.art-item`)
- **CSS Grid** for content layouts (`.project-grid`, `.art-grid`), **Flexbox** for nav and modals
- **Responsive breakpoints:** 800px (major layout shift — sidebar to top nav), 768px (minor adjustments)
- **Accessibility:** ARIA attributes, `.sr-only` class, focus styles, `aria-live` regions for dynamic content
- **Semantic HTML** with appropriate heading hierarchy
- **No unused variables/parameters** — enforced by `tsconfig.json` strict settings

## Environment Variables

Set in `.env.local` (not committed):
- `GEMINI_API_KEY` — Gemini API key (injected via Vite's `loadEnv`)
- `API_KEY` — General API key

## Adding Content

### New Blog Post
1. Create a markdown file in `public/content/blog/`
2. Add an entry to `public/content/blog/manifest.json` with `fileName`, `title`, `date` (YYYY-MM-DD), and `snippet`

### New Art Piece
1. Create a `.js` file in `public/content/art/` exporting `metadata` and `render(canvas, ctx)`
2. The manifest is auto-generated during build — no manual entry needed

### New Project
1. Create a directory in `public/content/projects/` with a `metadata.json` containing `title`, `description`, and optionally `thumbnail` and `entryPoint`
2. The manifest is auto-generated during build
