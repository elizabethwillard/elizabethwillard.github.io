# Blog Redesign: Migrate to Astro + Navfolio

**Date:** 2026-06-19
**Status:** Approved design — pending implementation plan
**Owner:** Elizabeth Willard

## Goal

Replace the current Jekyll ("Jekyll Now" fork) site at
`elizabethwillard.github.io` with a modern Astro site based on the
[Navfolio](https://github.com/dodolalorc/astro-navfolio) theme. The refresh
targets four goals the owner prioritized equally: **visual design, authoring
experience, features & content, and performance/SEO.**

Rust/Go learning is explicitly **out of scope** for this project (pursued
separately).

## Decisions (locked)

| Topic | Decision |
|---|---|
| Framework | Astro (latest, v6 via Navfolio) |
| Theme | Navfolio (MIT) — portfolio + blog + projects + short-form "vibe" notes |
| Hosting | Free GitHub Pages, user site at `https://elizabethwillard.github.io` (no custom domain / no CNAME) |
| Package manager | npm (Navfolio ships Bun configs; npm is fine and matches owner's comfort) |
| Setup approach | New git branch off `master`, replace Jekyll there, merge when verified |
| Old post URLs | Adopt Navfolio `/blog/[slug]` paths **+ redirects** from old `/:title/` paths |
| Math | Add `remark-math` + `rehype-mathjax` (MathJax, per requirement) — not built into Navfolio |
| Analytics | New **GA4** property (current `UA-43339302-11` is dead Universal Analytics) |
| Comments | **giscus** (GitHub Discussions); replaces unused/empty Disqus |
| Drafts | Migrated but kept unpublished (`draft: true`) |

## Architecture & Stack

- **Astro 6**, **Tailwind CSS 4** (via Vite), **TypeScript**, no React.
- **Content collections** with Zod-validated frontmatter for blog posts,
  projects, and vibe notes.
- Built-in: **Pagefind** static full-text search, `@astrojs/rss`,
  `@astrojs/sitemap`, `sharp` image optimization, tags/categories/series,
  related-posts widget, light/dark mode with color palettes.
- Config via `src/config/site.toml`; content under `src/content/`.
- Scaffolding scripts: `post:new`, `vibe:new` (run via npm).

## The One Gap: Math Rendering

Navfolio has no built-in math. Add a remark/rehype pipeline in
`astro.config` (`remark-math` + `rehype-mathjax`) so `$...$` / `$$...$$`
render **at build time** (no client CDN, fixing the current site's broken
MathJax setup). Using MathJax per the owner's stated requirement; `rehype-katex`
remains a drop-in alternative if a lighter/faster renderer is preferred later.

## Content Migration

- **8 published posts** (`_posts/*.md`) → `src/content/blog/*.md`. Map Jekyll
  frontmatter (`title`, `date`, `categories`) → Navfolio schema
  (`title`, `pubDate`, `tags`, etc.). Verify code highlighting (Shiki) and
  math render per post.
- **~11 drafts** (`_posts/drafts/`) → migrated with `draft: true`.
- **Personal writing** → longer pieces as blog posts tagged `personal`; quick
  thoughts as Navfolio **vibe** notes.
- **Images** (`images/`) → moved into the theme's asset structure for `sharp`.
- **Pages**: about, projects → Navfolio equivalents. `archive`, `categories`,
  `search` → replaced by tag pages + Pagefind.
- **Redirects**: Astro `redirects` config emits meta-refresh stub pages at the
  old `/:title/` paths (works on static GitHub Pages).

## Config & Features (`site.toml` + integrations)

- Site identity, bio ("Software Engineer"), avatar (`images/eliz.jpg`).
- Social links from current `_config.yml`: GitHub `elizabethwillard`,
  LinkedIn `elizabeth-willard`, email `ewillard42@gmail.com`, RSS. (Drop empty
  ones.)
- **GA4**: new property; wire measurement ID into Navfolio analytics slot.
- **giscus**: enable GitHub Discussions on the repo; configure category/repo IDs.
- SEO/meta + social share cards via Navfolio's built-in handling.

## Deployment

Swap the build step in `.github/workflows/jekyll-gh-pages.yml` (already on
updated action versions):

1. `npm install`
2. `astro build` (with `site: https://elizabethwillard.github.io`, `base: '/'`)
3. Pagefind index step (post-build)
4. Existing `upload-pages-artifact@v3` → `deploy-pages@v4`

Remove the Jekyll-specific `jekyll-build-pages` step.

## Verification / Success Criteria

- [ ] `astro build` succeeds; local preview works.
- [ ] All 8 published posts present and rendered.
- [ ] **Math renders** (spot-check RL + a Bayes draft); code blocks highlighted.
- [ ] Pagefind search returns results.
- [ ] RSS feed validates; sitemap generated.
- [ ] Old `/:title/` URLs redirect to new paths.
- [ ] giscus loads; GA4 receives a pageview.
- [ ] Lighthouse: strong perf/SEO/a11y scores.
- [ ] Merge branch → `master`; live site deploys via Actions.

## Out of Scope

- Rust/Go learning work.
- Custom domain.
- Writing new post content (migration only; drafts stay drafts).
