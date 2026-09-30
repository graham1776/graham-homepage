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
├── talks.html              # Talks / speaking history (static)
├── links.html              # Curated links (static)
├── contact.html            # Contact page
├── index.tsx               # Main application logic (shared by all pages)
├── index.css               # Global stylesheet (all pages): Print and Pen brand
├── vite.config.ts          # Multi-page build, manifest generation, clean-URL page generation
├── vercel.json             # Redirects (old WordPress URLs, raw project URLs)
├── tsconfig.json           # TypeScript configuration
├── TODO.md                 # Running task list / roadmap
└── public/
    ├── brand/              # Crest, signature, loop, favicon (Pen blue SVGs)
    ├── fonts/              # Self-hosted Libre Caslon woff2 + OFL licence
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

Vite is configured with **12 HTML entry points** (`vite.config.ts` → `rollupOptions.input`). Each HTML file is a separate page sharing the same `index.tsx` and `index.css`. When adding a page, add it to the input map, the sidebar nav in **every** HTML file, and `public/sitemap.xml`, and include the Vercel Web Analytics snippet (the two `<script>` tags before `</head>`, `/_vercel/insights/script.js`). New project sub-site pages need that snippet too, or their traffic isn't counted. The one exception is `project.html`: it deliberately has no snippet, because the framed project page counts the view.

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

Hand-written markdown→HTML converter in `index.tsx` (`markdownToHtml`, `applyInlineMarkdown`). Supports **only**: H1–H3, paragraphs, unordered/ordered lists, horizontal rules (`---`), bold, italic, links. No images, code blocks, blockquotes, tables, or H4+. Keep blog posts and `about.md` within this subset (or extend the parser first).

### Core TypeScript Interfaces (in `index.tsx`)

- `Project` — `{ folderName, title, description, thumbnail?, entryPoint? }`
- `BlogManifestEntry` — `{ fileName, title, date, snippet }`
- `ArtPiece` — `{ fileName, title, description }`

### SEO / Legacy URLs

`vercel.json` 301-redirects the old WordPress site's URLs (`/informational_interviews/`, `/about/`, `/blog/`, `/contact/`, `/feed/`, and `/YYYY/MM/DD/slug` permalinks) to their new homes. Don't remove these. `public/sitemap.xml` is static — keep it in sync with the entry points.

## Style Guidelines

### Visual design: "Print and Pen" (see `index.css`)

The site follows Graham's personal brand. The full spec is the `wahlberg-brand` skill; this is the working summary. Two layers:

- **Print** is everything typeset: Libre Caslon in Press black on a Fog page. Quiet and bookish. Structure comes from type size, space and hairlines, never ornament.
- **Pen** is one ink blue, only for things a hand does: link underlines, the current-page underline, focus rings, the signature, the crest stamp, the loop, the disc and the few buttons. If a blue thing isn't a hand mark, make it black.

- **Tokens** (CSS variables in `:root`, `index.css`): `--fog #EBEAE5` (page; never pure white), `--press #000` (all text), `--pencil #5E5D58` (dates, captions, labels), `--pen #2440B0` (hand layer only; no tints), `--hairline rgba(0,0,0,.22)`. No other colors, no gradients.
- **Type:** Libre Caslon Display for page titles, headings and the home hero sentence (weight 400 only); Libre Caslon Text (regular, italic, bold) for everything else. Self-hosted woff2 files in `public/fonts/` (SIL OFL), fallback `Georgia, serif`. **No monospace, no sans-serif, no other webfonts.** Body 20px (18px on phones), line-height 1.62.
- **Print rules:** flush left, never justified. Paragraphs are indented 1.6em with no space between them (the first after a heading isn't indented). Labels and dates are italic Pencil in sentence case; never tracked capitals. Dates are written out: "18 December 2023". Headings are sentence case.
- **Banned:** cards, shadows, rounded boxes, icons, emoji, gradients, badges, big-number stat callouts. Lists of things (blog, projects, talks, Start Here) are **hairline lists**: rows separated by 1px hairlines.
- **Pen marks, each used sparingly:** the footer on every page carries the crest (`/brand/crest-pen.svg`, rotated −8° as a stamp, never under 96px wide, never redrawn) and Graham's signature (`/brand/signature-pen.svg`, an image, never a script font). At most one **loop** per page (home: around Informational interviews, with "start here" in Pen italic) and at most one **disc** (contact: "Write to me"). Keep to three kinds of pen mark per page.
- **Buttons:** few. Pen fill, Fog italic text, fully rounded ends, 44px tall (`.button`, art buttons).
- **Layout:** left sidebar nav (Graham wants the site menu always on the left, including around projects); the current page gets a Pen underline via `aria-current`. At ≤800px the sidebar becomes a name bar with a "Menu" text button (added by `setupSidebarNav` in `index.tsx`; no hamburger icon). Main column is left-aligned at a ~36em measure. Breakpoints: 1100px (narrower margins), 800px (phones), 768px (minor).
- **Class naming:** BEM-inspired, lowercase-hyphenated. New styles go in `index.css` grouped near related rules; no inline styles.
- **Motion:** none beyond hover color changes; respect `prefers-reduced-motion`.

### Code style

- **No framework abstractions** — `document.getElementById`, `innerHTML` templates, `addEventListener`. Feature functions are self-guarding: they look up their root element and silently return if it's not on the current page, so `index.tsx` can run on every page.
- Graceful degradation on fetch failure: remove `.loading-message`, insert a `<p class="error-message">` that says what to do next, without apology.
- Semantic HTML with correct heading hierarchy; ARIA attributes, `.sr-only`, and `aria-live` regions for dynamic content. External links get `target="_blank" rel="noopener noreferrer"`.
- TypeScript strict mode with no unused locals/parameters is enforced by `tsconfig.json`.

### Writing voice (content)

First person, plain-spoken. Thesis first, specific over general, understatement over emphasis, short paragraphs, em-dashes sparingly. Banned: leverage, synergies, journey, deep-dive, unpack, "at the end of the day", going forward, utilize, reach out, circle back. Existing pages (`business-ideas.html`, `about.md`) are Graham's own looser voice; don't rewrite his copy without asking. Identity anchors that recur across pages: husband/father of 5, Christian, industrial real estate ("industrial real estate nerd"), Goodman/GNAP, informational interviews evangelist.

## Deployment Notes

- Pushing to `main` triggers the Vercel production deploy.
- No environment variables are required to build or run.
- The old WordPress cheat-sheet PDF URL (`/wp-content/uploads/2024/05/commercial-real-estate-chatgpt-cheat-sheet.pdf`) currently redirects to `/`; if the PDF is added at that exact path under `public/`, remove the redirect from `vercel.json`.
