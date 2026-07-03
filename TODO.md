# TODO

Running task list for grahamwahlberg.com. Check items off as they land.

## Launch (done in the ship-website-replacement round)

- [x] Remove placeholder art cards from `art.html`
- [x] Real titles/descriptions for all 4 projects (`project.json` per folder)
- [x] Fix wrong links in `about.md` (informational interviews → the II project)
- [x] Delete cruft (`Zone.Identifier`, stale `directory`/`directory.ini` docs)
- [x] Remove dead code and vestigial `GEMINI_API_KEY` define block
- [x] Blog post anchor ids (`blog.html#post-slug`)
- [x] `vercel.json` with 301 redirects for old WordPress URLs
- [x] `robots.txt` + `sitemap.xml`
- [x] Rewrite `CLAUDE.md` (accurate, with style guidelines) and `README.md`

## Domain cutover (Graham — manual steps)

- [ ] **Rescue the cheat-sheet PDF first:** download `https://grahamwahlberg.com/wp-content/uploads/2024/05/commercial-real-estate-chatgpt-cheat-sheet.pdf` from the old WordPress site (it's indexed by Google), commit it at `public/wp-content/uploads/2024/05/` with the same file name, and remove the temporary redirect for it in `vercel.json`. Also export/save anything else worth keeping from WordPress before shutting it down.
- [ ] In Vercel: project → Settings → Domains → add `grahamwahlberg.com` and `www.grahamwahlberg.com`.
- [ ] In WordPress.com (Domains → DNS records): set `A @ → 76.76.21.21` and `CNAME www → cname.vercel-dns.com` (Vercel's Domains screen shows the exact records it wants — follow those if they differ).
- [ ] After DNS propagates: verify `https://grahamwahlberg.com` serves the new site with a valid certificate, and spot-check the redirects (`/informational_interviews/`, `/about/`, `/blog/`).
- [ ] Google Search Console: add/verify the domain property and submit `https://grahamwahlberg.com/sitemap.xml`.
- [ ] Cancel the WordPress.com plan once everything checks out (keep the domain registration!).

## Nice-to-haves (post-launch)

- [ ] Per-post blog pages (each post currently renders on the single `blog.html`; individual URLs would be better for sharing/SEO than `#anchors`)
- [ ] Extend the markdown parser (images, code blocks, blockquotes, H4+) — or swap in a tiny parser
- [ ] Project thumbnails (`project.json` supports `thumbnail`, none set yet)
- [ ] Move art modules out of `public/` (e.g. `src/art/`) — they're currently both bundled *and* copied verbatim to `dist/`
- [ ] RSS feed for the blog (`/feed` currently just redirects to `blog.html`)
- [ ] Favicon + Open Graph / social preview tags
- [ ] Add the informational interviews book as a proper page or link if/when published
