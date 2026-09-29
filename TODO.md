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
- [x] In Vercel: project → Settings → Domains → add `grahamwahlberg.com` and `www.grahamwahlberg.com`.
- [x] At Squarespace (the registrar — Domains → DNS): set `A @ → 76.76.21.21` and `CNAME www → cname.vercel-dns.com` (Vercel's Domains screen shows the exact records it wants — follow those if they differ).
- [x] DNS live — both `grahamwahlberg.com` and `www` serve the new site. Still to do after DNS propagates: verify `https://grahamwahlberg.com` serves the new site with a valid certificate, and spot-check the redirects (`/informational_interviews/`, `/about/`, `/blog/`).
- [ ] Google Search Console: add/verify the domain property and submit `https://grahamwahlberg.com/sitemap.xml`.
- [ ] **Before cancelling WordPress:** export Jetpack stats CSVs (Stats → Traffic → Years; Posts & Pages, Referrers, Countries, Search Terms, Clicks) for 2016 onward. Downgrade to the free plan rather than deleting the site so the stats history stays viewable.
- [ ] Cancel the WordPress.com plan once everything checks out (keep the domain registration!).

## Analytics

- [x] Vercel Web Analytics snippet on all pages (main pages + project sub-sites)
- [x] Enable Web Analytics in the Vercel dashboard (project → Analytics) if not already on

## Next round (from Graham, Sept 2026 — not started)

### Blog posts: restore original text verbatim
The posts look like they were edited during the AI migration. Replace with Graham's original wording, word for word (source: the old WordPress posts / Graham's copy).
- [ ] Glimpse of the Kingdom (`2023-12-18-glimpse-of-the-kingdom.md`)
- [ ] Questions to Ask a Landlord (`2016-04-12-questions-to-ask-a-landlord.md`)
- [ ] Informational Interviews: what to do when they don't want to meet (`2016-03-22-informational-interviews-follow-up.md`)

### Styling
- [x] Restyle the site in the Print and Pen brand (Caslon on Fog, hairline lists, crest and signature footer, loop on home, disc on contact)
- [ ] Confirm the footer location line ("Newport Beach, California") and the home hero sentence, which merges the old tagline into one line
- [ ] `about.md` still has Title Case headings and an "About Graham Wahlberg" heading that repeats the section title; tidy when Graham reviews the copy
- [ ] One real photograph per page (harbor, job sites, buildings), per the brand; the headshot is the only photo today
- [ ] Business ideas, Links and About copy predate the brand voice (exclamation marks, "journey" in two blog posts); revisit alongside the verbatim blog restore

### Projects: keep the site nav around them
Done: `project.html` shell at `/projects/<folder>/` (sidebar + framed project).
- [x] Project sub-sites (Informational Interviews, NICU, Real Estate Poster, Family Homepage) have no link back to the main site. Explore building/serving them from the projects folder while always keeping the Graham Wahlberg left sidebar menu (e.g. a shared wrapper/header injected at build time, or an iframe shell page) — at minimum, add a back-link

### Blog: index instead of full posts
- [x] `blog.html` should list posts (title, date, snippet), not render every post in full. Pairs with the per-post pages item below — keep the existing `#anchor` links working (redirect or map them to the new post URLs)

### New menu item: Talks / Performances
- [x] `talks.html` live, grouped by year, newest first (from Graham's researched list, Sept 2026)
- [ ] After Oct 21, 2026: move the USC MRED Brown Bag from Upcoming into 2026
- [ ] Held back until confirmed (add to `talks.html` once they are):
  - 4/22/2009: Peace Garden re-opening, featured guest (remarks unconfirmed)
  - 2011–12: TREA event at USC, speaker (not yet located)
  - c. 2013–15: Goodman USC / MRED overview, presenter
  - Feb 2026: Goodman leadership briefing on AI & robotics (confirm it was delivered live, and whether it belongs on a public page)
- [ ] Fill in dates: NAIOP-U with Bennie Seybold (4/25 or 5/23/2024; shows "Spring"), Sonia Savoulian's class, Fresno State Commencement (Spring 2009)

## Nice-to-haves (post-launch)

- [x] Per-post blog pages (each post currently renders on the single `blog.html`; individual URLs would be better for sharing/SEO than `#anchors`)
- [ ] Extend the markdown parser (images, code blocks, blockquotes, H4+) — or swap in a tiny parser
- [ ] Project files that were never committed (404s): The Real Estate Poster's `styles.css` and `script.js`; NICU's `images/stories/olivia.jpg`, `ethan.jpg`, `twins.jpg`; Informational Interviews' `images/success-stories/jen.jpg`. Find the originals or remove the references
- [ ] Project thumbnails (`project.json` supports `thumbnail`, none set yet)
- [ ] Move art modules out of `public/` (e.g. `src/art/`) — they're currently both bundled *and* copied verbatim to `dist/`
- [ ] RSS feed for the blog (`/feed` currently just redirects to `blog.html`)
- [ ] Favicon + Open Graph / social preview tags
- [ ] Add the informational interviews book as a proper page or link if/when published
