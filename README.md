# grahamwahlberg.com

Personal site of Graham Wahlberg — portfolio, blog, business ideas, generative art, and experiments. Built with Vite + vanilla TypeScript (no framework, zero production dependencies) and deployed on Vercel.

## Run locally

**Prerequisites:** Node.js 18+

```sh
npm install
npm run dev        # dev server with hot reload
npm run build      # production build → dist/
npm run preview    # serve the production build locally
```

No environment variables are required.

## Adding content

Content is drop-in — manifests for projects and art are auto-generated at build time:

- **Project:** drop a self-contained folder (with an `index.html`) into `public/content/projects/`. Optionally add a `project.json` with `title` and `description`.
- **Art piece:** drop a `.js` file into `public/content/art/` that exports `metadata = { title, description }` and `render(canvas, ctx)`.
- **Blog post:** add a `.md` file to `public/content/blog/` and an entry to `public/content/blog/manifest.json`.

See [CLAUDE.md](CLAUDE.md) for architecture details and style guidelines, and [TODO.md](TODO.md) for the roadmap.
