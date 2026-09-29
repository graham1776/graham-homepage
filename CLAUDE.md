# CLAUDE.md

## Project Overview

Personal portfolio and blog website for Graham Wahlberg, live at **grahamwahlberg.com**. A static multi-page site built with **Vite + vanilla TypeScript** — no framework (React, Vue, etc.). All DOM manipulation is done with native browser APIs.

## Tech Stack

- **Build tool:** Vite 6.2
- **Language:** TypeScript 5.7 (strict mode)
- **Target:** ES2020, ESM modules
- **Styling:** Single global CSS file (`index.css`) — no preprocessor or CSS-in-JS
- **Deployment:** Vercel (zero-config Vite build; redirects in `vercel.json`), deploys on push to `main`
- **Dependencies:** Zero production dependencies; only devDependencies (vite, typescript, @types/node)

## Repository Structure

```
├── index.html              # Home page (hero, Start Here, About)
├── now.html                # "Now" page
├── projects.html           # Projects showcase
├── art.html                # Generative art gallery
├── business-ideas.html     # Business ideas catalog (static)
├── blog.html               # Blog index (post cards, newest first)
├── post.html               # Single blog post, served at /blog/<slug>
├── project.html            # Project shell (sidebar + framed project), served at /projects/<folder>/
├── resume.html             # Resume (static)
├── links.html              # Curated links (static)
├── contact.html            # Contact page
├── index.tsx               # Main application logic (shared by all pages)
├── index.css               # Global stylesheet (all pages)
├── vite.config.ts          # Multi-page build, manifest generation, clean-URL page generation
├── vercel.json             # Redirects (old WordPress URLs, raw project URLs)
├── tsconfig.json           # TypeScript configuration
├── TODO.md                 # Running task list / roadmap
└── public/
    ├── robots.txt
    ├── sitemap.xml         # Static; update when adding/removing pages
    └── content/            # Dynamic content loaded at runtime
        ├── about.md        # About section markdown (rendered on home page)
        ├── headshot.jpeg
        ├── art/            # Generative art modules (*.js) + auto-generated manifest.json
        ├── blog/           # Blog posts (*.md) + hand-maintained manifest.json
        └── projects/       # Self-contained project sub-sites + auto-generated manifest.json
```

## Commands

```sh
npm install          # Install dependencies
npm run dev          # Start Vite dev server with hot reload
npm run build        # Production build (output: dist/)
npm run preview      # Preview production build locally
```

There are no test, lint, or format commands. Note: `npm run build` does **not** type-check (esbuild strips types); run `npx tsc --noEmit` to check types.

## Architecture & Key Patterns

### Multi-Page Build

Vite is configured with **11 HTML entry points** (`vite.config.ts` → `rollupOptions.input`). Each HTML file is a separate page sharing the same `index.tsx` and `index.css`. When adding a page, add it to the input map, the sidebar nav in **every** HTML file, and `public/sitemap.xml`, and include the Vercel Web Analytics snippet (the two `<script>` tags before `</head>`, `/_vercel/insights/script.js`). New project sub-site pages need that snippet too, or their traffic isn't counted. The one exception is `project.html`: it deliberately has no snippet, because the framed project page counts the view.

`post.html` and `project.html` are served at clean URLs as **real files**, with no server rewrites: after the build, the `cleanUrlPages` plugin in `vite.config.ts` copies the built `post.html` to `dist/blog/<slug>/index.html` for every post in the blog manifest, and the built `project.html` to `dist/projects/<folder>/<page>` for every HTML page of every project. In `npm run dev` the same plugin maps those URLs on the fly. Don't switch this to `vercel.json` rewrites: they 404'd in production. They use `<base href="/">` so the sidebar's relative links still resolve from nested paths.

### Project Shell

Projects open at `/projects/<folder>/<path>`: `project.html` keeps the site sidebar and frames `/content/projects/<folder>/<path>` in an iframe, mirroring the frame's URL and title into the address bar as the visitor navigates. Links from a project back into the main site load at the top level; off-site links open in a new tab. A raw `/content/projects/...` URL opened as a page (Google result, bookmark) is redirected to the shell by a `vercel.json` rule keyed on `Sec-Fetch-Dest: document`. That redirect is intentionally not permanent: a cached 308 would also redirect the iframe. Link to projects as `/projects/<folder>/`, never `/content/projects/...`. On mobile the shell shows only the name bar (links home), not the stacked nav.

### Drop-In Content System (the core workflow)

Content is loaded at runtime via `fetch()` from JSON manifests in `public/content/`. Projects and art manifests are **auto-generated at build time** by the `generateManifests` plugin in `vite.config.ts` — dropping files in the right folder is all that's required:

- **Project** = any directory in `public/content/projects/` containing an `index.html` (also detects `app.html`/`main.html`). Optional **`project.json`** in the directory sets `title`, `description`, `thumbnail`, `entryPoint`; otherwise both are auto-derived from the folder name. Projects are fully self-contained sub-sites — their internal code does not need to follow this repo's conventions.
- **Art piece** = any `.js` file in `public/content/art/` exporting:
  ```js
  export const metadata = { title: "...", description: "..." };
  export function render(canvas, ctx) { /* Canvas 2D drawing; may use randomness */ }
  ```
  Art modules are bundled via `import.meta.glob('./public/content/art/*.js')` and rendered into 300×200 canvases, with a fullscreen modal (800×600) and a Regenerate button.
- **Blog post** = a `.md` file in `public/content/blog/` **plus a manual entry** in `public/content/blog/manifest.json` (`fileName`, `title`, `date` YYYY-MM-DD, `snippet`). `blog.html` lists posts as cards (title, date, snippet), newest first. Each post has its own page at `/blog/<slug>`, where the slug is the file name minus the date prefix (e.g. `/blog/questions-to-ask-a-landlord`); the post's first `# heading` is stripped (the manifest title is used). Old `blog.html#slug` links redirect to the post page, unknown slugs show the post list, and old WordPress `/YYYY/MM/DD/slug` permalinks redirect to `/blog/slug`. Add new posts to `public/sitemap.xml` too.

Manifests for projects/art are regenerated on every build and committed — never hand-edit those two; edit `project.json` or art `metadata` instead.

### Custom Markdown Parser

Hand-written markdown→HTML converter in `index.tsx` (`markdownToHtml`, `applyInlineMarkdown`). Supports **only**: H1–H3, paragraphs, unordered/ordered lists, bold, italic, links. No images, code blocks, blockquotes, tables, or H4+. Keep blog posts and `about.md` within this subset (or extend the parser first).

### Core TypeScript Interfaces (in `index.tsx`)

- `Project` — `{ folderName, title, description, thumbnail?, entryPoint? }`
- `BlogManifestEntry` — `{ fileName, title, date, snippet }`
- `ArtPiece` — `{ fileName, title, description }`

### SEO / Legacy URLs

`vercel.json` 301-redirects the old WordPress site's URLs (`/informational_interviews/`, `/about/`, `/blog/`, `/contact/`, `/feed/`, and `/YYYY/MM/DD/slug` permalinks) to their new homes. Don't remove these. `public/sitemap.xml` is static — keep it in sync with the entry points.

## Style Guidelines

### Visual design (see `index.css`)

- **Typography:** system sans stack `'Segoe UI', Tahoma, Geneva, Verdana, sans-serif` for everything, with `'Courier New', Courier, monospace` as the accent font (taglines, sidebar project submenu). Don't introduce webfonts — zero-dependency is the point.
- **Palette:** body text `#333` (secondary `#444`/`#555`, muted `#666`/`#777`); links and primary buttons `#007bff` (hover `#0056b3`); page background `#fff`, sidebar `#f5f5f5`, light panels `#f8f9fa`; footer `#333` with `#f4f4f4` text; errors `#d9534f`. Stay in this palette; no CSS variables are defined — use the literal values like the rest of the file.
- **Layout:** left sidebar nav (collapses to top nav ≤800px); **CSS Grid** for content grids (`.project-grid`, `.art-grid`), **Flexbox** for nav and modals. Breakpoints: **800px** (major — sidebar→top nav) and **768px** (minor adjustments).
- **Class naming:** BEM-inspired, lowercase-hyphenated (`.project-card`, `.blog-post-full`, `.art-item`, `.btn-view-project`). New styles go in `index.css` grouped near related rules — no inline styles except trivial dynamic ones set from TS.

### Code style

- **No framework abstractions** — `document.getElementById`, `innerHTML` templates, `addEventListener`. Feature functions are self-guarding: they look up their root element and silently return if it's not on the current page, so `index.tsx` can run on every page.
- Graceful degradation on fetch failure: remove `.loading-message`, insert a `<p class="error-message">`.
- Semantic HTML with correct heading hierarchy; ARIA attributes, `.sr-only`, and `aria-live` regions for dynamic content. External links get `target="_blank" rel="noopener noreferrer"`.
- TypeScript strict mode with no unused locals/parameters is enforced by `tsconfig.json`.

### Writing voice (content)

First person, plain-spoken, enthusiastic but unpolished-on-purpose (see `business-ideas.html`, `about.md`). Short paragraphs, liberal lists and links. Identity anchors that recur across pages: husband/father of 5, Christian, industrial real estate ("industrial real estate nerd"), Goodman/GNAP, informational interviews evangelist.

## Deployment Notes

- Pushing to `main` triggers the Vercel production deploy.
- No environment variables are required to build or run.
- The old WordPress cheat-sheet PDF URL (`/wp-content/uploads/2024/05/commercial-real-estate-chatgpt-cheat-sheet.pdf`) currently redirects to `/`; if the PDF is added at that exact path under `public/`, remove the redirect from `vercel.json`.
