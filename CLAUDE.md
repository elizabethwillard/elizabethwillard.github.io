# CLAUDE.md — elizabethwillard.github.io

Personal blog of Elizabeth Willard (Software Engineer), live at
https://elizabethwillard.github.io.

> A general-purpose `CLAUDE.md` with coding guidelines lives in the parent dir
> (`/Users/elizabethwillard/Documents/CLAUDE.md`). This file adds repo-specific context.

## Stack

- **Static site generator:** Jekyll (Liquid templating). Template is a fork of
  **"Jekyll Now" v1.2.0** — a minimal, hand-rolled theme (no `minima`/gem theme).
- **Styling:** plain SCSS under `_sass/` + entrypoint `assets/style.scss`. No
  Tailwind/PostCSS/JS build pipeline. `assets/simple-jekyll-search.min.js` powers search.
- **Ruby:** 2.4.3 (`.ruby-version`). **No `Gemfile`** — the site builds against
  GitHub Pages' preinstalled dependencies, not a local bundle.

## Layout

- `_config.yml` — site name, author, footer/social links, analytics, permalinks.
- `_layouts/` — `default.html`, `page.html`, `post.html`.
- `_includes/` — partials (`meta`, `analytics`, `disqus`, `svg-icons`, `pullquote`).
- `_pages/` — standalone pages (about, archive, categories, projects, personal, search).
- `_posts/` — published posts (`YYYY-MM-DD-title.md`); `_posts/drafts/` holds drafts.
- `_sass/` — `_variables.scss`, `_reset.scss`, `_highlights.scss`, `_darcula.scss`,
  `_svg-icons.scss`. Edit these (and `assets/style.scss`) for visual changes.
- `images/` — post/site images and avatar (`images/eliz.jpg`).
- `index.html`, `search.json`, `404.md` — home, search index, not-found.

## Build & deploy

- Deployed by GitHub Actions: `.github/workflows/jekyll-gh-pages.yml`, triggered on
  push to **`master`** (also manual `workflow_dispatch`). Uses `jekyll-build-pages`.
- Local preview (when deps are installed): `bundle exec jekyll serve` or
  `jekyll serve`. Without a Gemfile you may need `gem install github-pages` first.

## Goals & context

- **Owner is not proficient in Jekyll/Liquid** — explain framework-specific concepts
  and prefer changes that are easy to maintain. Avoid introducing complex tooling
  unless agreed.
- **Active goal: a modern visual refresh / redesign** of the blog. When proposing a
  redesign, weigh: (a) restyling within the current Jekyll setup vs. (b) migrating to
  a modern framework. Surface the tradeoffs and confirm direction before large changes.
