# Blog Migration to Astro + Navfolio — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Jekyll site at `elizabethwillard.github.io` with an Astro site built on the Navfolio theme, migrating all content, adding MathJax math rendering, GA4, and giscus comments, and deploying via GitHub Pages.

**Architecture:** Scaffold Navfolio (Astro 6 + Tailwind 4 + TypeScript) onto a new branch, replacing the Jekyll files. Content moves into Astro content collections (`src/content/blog`, `vibe`, `projects`, `about`). Configuration is driven by `src/config/site.toml`. Math, redirects, and GA4 are the only custom additions on top of the stock theme. The existing GitHub Actions workflow is repointed from Jekyll to an Astro+Pagefind build.

**Tech Stack:** Astro 6, Tailwind CSS 4, TypeScript, MDX, Pagefind (search), `@astrojs/rss`, `@astrojs/sitemap`, `astro-expressive-code` (code blocks), `remark-math` + `rehype-mathjax` (math), `sharp` (images), npm + `tsx`.

## Global Constraints

- Node `>=22.12.0` (theme `engines` requirement). Verify with `node -v`.
- Package manager: **npm** (theme ships Bun configs; we shim its TS scripts with `tsx`). Bun is the fallback only if a `tsx`-run script fails.
- Host: free GitHub Pages, **user site** at `https://elizabethwillard.github.io`, `base: '/'` (no custom domain, no CNAME). `astro.config.mjs` derives this automatically under `GITHUB_ACTIONS=true`.
- Math: use **`rehype-mathjax/svg`** (self-contained SVG output, no client JS, no extra CSS).
- Every blog post requires `title`, `description`, and `date` frontmatter (Navfolio Zod schema rejects builds otherwise).
- Drafts must carry `draft: true` so they never publish.
- All work happens on branch `redesign-astro-navfolio`; `master` stays live until final merge.
- Commit after every task.

## File Structure

**Created (by scaffolding the theme — not authored by hand):** the entire Navfolio `src/`, `astro.config.mjs`, `package.json`, `pagefind.yml`, `scripts/`, `tsconfig.json`, etc.

**Created/authored by us:**
- `src/content/blog/<slug>.md` — 8 migrated posts (+ a temporary `_mathcheck.md`)
- `src/content/blog/drafts/` or `draft: true` posts — migrated drafts
- `src/components/GoogleAnalytics.astro` — GA4 snippet
- `public/images/**` — migrated images + avatar

**Modified by us:**
- `package.json` — swap `bun` → `tsx` in `fonts:ui`, `post:new`, `vibe:new`, `build`; add `tsx` devDep
- `astro.config.mjs` — add `markdown` (math plugins) and `redirects`
- `src/components/BaseHead.astro` — include `<GoogleAnalytics />`
- `src/config/site.toml` — replace all theme defaults with Elizabeth's data + giscus IDs
- `src/content/about.mdx`, `src/content/projects/index.mdx` — real content
- `.github/workflows/jekyll-gh-pages.yml` — Jekyll build → Astro+Pagefind build

**Deleted at the end:** Jekyll files (`_config.yml`, `_layouts/`, `_includes/`, `_sass/`, `_pages/`, `index.html`, `404.md`, `search.json`, root `assets/`, `_posts/`).

**Note on verification style:** This is a static-site migration, so each task's gate is a concrete build/inspect/serve check (not unit tests). Treat the "Expected" output as the pass condition.

---

### Task 1: Scaffold Navfolio on a new branch with an npm toolchain

**Files:**
- Create: entire Navfolio tree (via degit)
- Modify: `package.json`

**Interfaces:**
- Produces: a buildable Astro project at repo root; npm scripts `dev`, `build`, `post:new`, `vibe:new` working without Bun.

- [ ] **Step 1: Create the branch**

```bash
cd /Users/elizabethwillard/Documents/elizabethwillard.github.io
git checkout master && git pull
git checkout -b redesign-astro-navfolio
node -v   # must be >= 22.12.0
```

- [ ] **Step 2: Fetch the theme into a temp dir and copy it in**

```bash
npx degit dodolalorc/astro-navfolio /tmp/navfolio
# copy everything except the theme's git/sample lockfile
rsync -a --exclude='.git' --exclude='bun.lock' /tmp/navfolio/ ./
```

Keep the existing `_posts/`, `images/`, `docs/`, `CLAUDE.md`, `.git/` (content migration consumes `_posts/` and `images/` later). Do NOT delete Jekyll files yet.

- [ ] **Step 3: Swap Bun for tsx in package.json scripts**

Replace the `scripts` block in `package.json` with:

```json
  "scripts": {
    "dev": "astro dev",
    "fonts:ui": "tsx scripts/fonts/subset-ui-font.ts",
    "build": "npm run fonts:ui && astro build && pagefind --site dist --output-subdir pagefind --root-selector main --exclude-selectors \"[data-pagefind-ignore]\"",
    "preview": "astro preview",
    "astro": "astro",
    "post:new": "tsx scripts/new-content.ts blog",
    "vibe:new": "tsx scripts/new-content.ts vibe",
    "lint": "eslint .",
    "format": "prettier --write .",
    "format:check": "npm run lint && prettier --check .",
    "prepare": "husky"
  },
```

Then add `tsx` to devDependencies:

```bash
npm pkg set devDependencies.tsx="^4.19.0"
```

- [ ] **Step 4: Install dependencies**

```bash
npm install
```

Expected: completes without peer-dependency errors that block install. (Warnings are fine.)

- [ ] **Step 5: Verify the dev server runs with stock theme content**

```bash
npm run dev
```

Expected: Astro prints `http://localhost:4321`. Open it — the stock Navfolio homepage renders. Stop the server (Ctrl-C).

- [ ] **Step 6: Verify a production build + Pagefind succeed**

```bash
npm run build
```

Expected: `dist/` is produced and the final line shows Pagefind indexing pages. If `npm run fonts:ui` fails under `tsx`, fallback: `npm pkg set scripts.fonts:ui="echo skip-fonts"` (ships the full UI font) and re-run; record this in the commit message.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: scaffold Navfolio theme with npm/tsx toolchain"
```

---

### Task 2: Add MathJax rendering

**Files:**
- Modify: `astro.config.mjs`
- Create: `src/content/blog/_mathcheck.md` (temporary)

**Interfaces:**
- Produces: `$...$` (inline) and `$$...$$` (block) LaTeX render to SVG at build time across all `.md`/`.mdx` content.

- [ ] **Step 1: Install math plugins**

```bash
npm install remark-math rehype-mathjax
```

- [ ] **Step 2: Add the plugins to astro.config.mjs**

At the top of `astro.config.mjs`, add imports:

```js
import remarkMath from 'remark-math';
import rehypeMathjax from 'rehype-mathjax/svg';
```

In the `defineConfig({...})` object, add a `markdown` key alongside the existing `site`, `base`, `integrations`:

```js
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeMathjax],
  },
```

(The `mdx()` integration inherits this markdown config by default, so MDX gets math too.)

- [ ] **Step 3: Create a temporary math-check post**

`src/content/blog/_mathcheck.md`:

```markdown
---
title: Math Check
description: Temporary post to verify MathJax rendering.
date: 2026-06-19
draft: true
---

Inline: $a^2 + b^2 = c^2$.

Block:

$$
\int_0^\infty e^{-x}\,dx = 1
$$
```

- [ ] **Step 4: Build and confirm math rendered to SVG**

```bash
npm run build
grep -rl "mjx-container" dist/ | head
```

Expected: at least one matching file (MathJax emits `<mjx-container>` with inline SVG). If empty, the plugins are not wired — recheck Step 2.

- [ ] **Step 5: Commit**

```bash
git add astro.config.mjs package.json package-lock.json src/content/blog/_mathcheck.md
git commit -m "feat: add MathJax (remark-math + rehype-mathjax) build-time rendering"
```

---

### Task 3: Migrate images into public/

**Files:**
- Create: `public/images/**` (copied from `images/`)

**Interfaces:**
- Produces: all `/images/...` URLs referenced in posts resolve; avatar available at `/images/eliz.jpg`.

- [ ] **Step 1: Copy the image tree into Astro's public dir**

```bash
mkdir -p public/images
rsync -a images/ public/images/
ls public/images/eliz.jpg   # avatar must be present
```

- [ ] **Step 2: Build and confirm images are emitted**

```bash
npm run build
ls dist/images/eliz.jpg
```

Expected: file exists in `dist/`.

- [ ] **Step 3: Commit**

```bash
git add public/images
git commit -m "feat: migrate images into public/images"
```

---

### Task 4: Migrate the 8 published posts

**Files:**
- Create: `src/content/blog/<slug>.md` × 8
- Read (source): `_posts/*.md`

**Interfaces:**
- Consumes: Navfolio blog schema — required `title: string`, `description: string`, `date: <YYYY-MM-DD>`; optional `tags: string[]`, `categories: string[]`, `series: string[]`, `draft: boolean`.
- Produces: 8 live posts at `/blog/<slug>/`. The `<slug>` is the new filename (no date prefix), which Task 9 redirects to.

**Slug map (old Jekyll URL → new file/slug):**

| Source file | New file `src/content/blog/<slug>.md` | New URL |
|---|---|---|
| `2023-12-21-learningaboutdotnet.md` | `learningaboutdotnet.md` | `/blog/learningaboutdotnet/` |
| `2023-12-25-dyeing-linen.md` | `dyeing-linen.md` | `/blog/dyeing-linen/` |
| `2024-01-22-learningaboutrl.md` | `learningaboutrl.md` | `/blog/learningaboutrl/` |
| `2024-02-07-starting-ec2-with-jupyter-hub.md` | `starting-ec2-with-jupyter-hub.md` | `/blog/starting-ec2-with-jupyter-hub/` |
| `2024-04-15-using_githubactions_with_ecr_and_ec2.md` | `using_githubactions_with_ecr_and_ec2.md` | `/blog/using_githubactions_with_ecr_and_ec2/` |
| `2024-08-02-computer_organization_and_instruction_set_architecture.md` | `computer_organization_and_instruction_set_architecture.md` | `/blog/computer_organization_and_instruction_set_architecture/` |
| `2024-09-21-computer_instruction_set_architecture.md` | `computer_instruction_set_architecture.md` | `/blog/computer_instruction_set_architecture/` |
| `2026-06-16slicker_python.md` | `slicker_python.md` | `/blog/slicker_python/` |

- [ ] **Step 1: Inspect every source post's current frontmatter**

```bash
for f in _posts/*.md; do echo "=== $f ==="; awk '/^---$/{c++} c==1{print} c==2{exit}' "$f"; done
```

Record each post's existing `title`, `date`, and `categories`/`tags`. Note: `2026-06-16slicker_python.md` has a malformed filename (missing the dash after the date) — read its frontmatter to get the real `date`; if `date` is absent, use `2026-06-16`.

- [ ] **Step 2: Create each new post file**

For each row in the slug map, create `src/content/blog/<slug>.md` by copying the source post body and rewriting the frontmatter to this shape:

```markdown
---
title: <existing title>
description: <one concise sentence summarizing the post — write from the first paragraph if none exists>
date: <YYYY-MM-DD from source>
tags: [<lowercase topical tags, e.g. aws, python, dotnet>]
categories: [<existing categories, or a single broad one>]
---

<original Markdown body, unchanged>
```

Rules:
- `description` is **required** — every post must have a non-empty one-sentence summary.
- Keep the original body verbatim (code fences, images, links). Image URLs already point at `/images/...` and resolve via Task 3.
- Tag the personal posts (e.g. `dyeing-linen`) with `tags: [personal]`.

- [ ] **Step 3: Build and confirm all 8 posts compile**

```bash
npm run build 2>&1 | tee /tmp/build.log
ls dist/blog/learningaboutrl/index.html
ls dist/blog/slicker_python/index.html
```

Expected: build succeeds (no Zod frontmatter errors) and both sampled post pages exist. If the build reports a missing `description` or bad `date`, fix that post's frontmatter.

- [ ] **Step 4: Spot-check code highlighting and any math**

```bash
grep -l "expressive-code" dist/blog/using_githubactions_with_ecr_and_ec2/index.html
```

Expected: match (code blocks rendered). If any post uses `$...$` math, confirm `mjx-container` appears in its built HTML.

- [ ] **Step 5: Commit**

```bash
git add src/content/blog
git commit -m "feat: migrate 8 published posts to Astro content collection"
```

---

### Task 5: Migrate drafts (kept unpublished)

**Files:**
- Create: `src/content/blog/<slug>.md` for each draft, with `draft: true`
- Read (source): `_posts/drafts/*`

**Interfaces:**
- Consumes: same blog schema as Task 4.
- Produces: draft posts present in the repo but excluded from the published site (`draft: true`; the home `latest` and listings exclude drafts).

- [ ] **Step 1: List the draft sources**

```bash
ls -1 _posts/drafts/
```

(Some entries are directories, e.g. `2026-02-06-preparing_for_aws_csa_exam`, `fastapistreamlitdocker` — migrate their `.md` content; bring along any local images into `public/images/`.)

- [ ] **Step 2: Create each draft post**

For each draft `.md`, create `src/content/blog/<slug>.md` using the same frontmatter shape as Task 4 **plus** `draft: true`:

```markdown
---
title: <title or a sensible one from filename>
description: <one-sentence summary; "Draft — work in progress." is acceptable for stubs>
date: <date from filename/frontmatter, else today 2026-06-19>
draft: true
tags: [<topical>]
---

<original body>
```

Use a clean slug (drop date prefixes and fix typos, e.g. `lgbmnotes.md`, `wtf-is-bayes.md`).

- [ ] **Step 3: Build and confirm drafts are excluded from listings**

```bash
npm run build
test ! -e dist/blog/page/  -o  -d dist/blog
grep -rl "draft" dist/blog/index.html ; echo "exit: $?"
```

Expected: build succeeds; draft titles do NOT appear in `dist/blog/index.html` (grep finds nothing → exit 1). Draft pages may still be individually reachable; that is acceptable.

- [ ] **Step 4: Commit**

```bash
git add src/content/blog public/images
git commit -m "feat: migrate drafts as unpublished (draft: true)"
```

---

### Task 6: Configure site.toml with Elizabeth's identity

**Files:**
- Modify: `src/config/site.toml`

**Interfaces:**
- Consumes: site config schema (`site`, `profile`, `topNav`, `home`, `theme`, `search`, `blog`, `comments`).
- Produces: site metadata, profile card, homepage, nav, social links reflect Elizabeth (giscus IDs handled in Task 7).

- [ ] **Step 1: Replace identity blocks**

Edit `src/config/site.toml`:

`[config.site]`:
```toml
title = "Elizabeth Willard"
description = "Software Engineer — notes on ML, AWS, and systems."
pageTitle = "Elizabeth Willard"
pageDescription = "Software engineer writing about machine learning, AWS, computer architecture, and the occasional personal project."
repository = "https://github.com/elizabethwillard/elizabethwillard.github.io"
footerNote = "© Elizabeth Willard"
```

`[config.profile]`:
```toml
name = "Elizabeth Willard"
handle = "@elizabethwillard"
role = "Software Engineer"
company = ""
location = ""
email = "ewillard42@gmail.com"
website = "https://elizabethwillard.github.io"
github = "https://github.com/elizabethwillard"
meta = "Software Engineer"
avatar = "/images/eliz.jpg"
```

- [ ] **Step 2: Set theme palette, search placeholder, posts-per-page**

```toml
# [config.theme]
palette = "green-soft"   # pick any of the 8 palettes; preview at build time

# [config.search]
placeholder = "Search posts..."

# [config.blog]
postsPerPage = 6
```

- [ ] **Step 3: Replace homepage content (`[config.home]` blocks)**

Update `[config.home.quote]`, `[config.home.intro]`, `[config.home.navigation]`, `[config.home.connect]`, and `[config.home.doing]` to Elizabeth's own copy. At minimum, in `[config.home.connect]` keep real links and drop placeholder ones:

```toml
[[config.home.connect]]
label = "GitHub"
href = "https://github.com/elizabethwillard"
icon = "github"

[[config.home.connect]]
label = "LinkedIn"
href = "https://www.linkedin.com/in/elizabeth-willard"
icon = "compass"

[[config.home.connect]]
label = "Email"
href = "mailto:ewillard42@gmail.com"
icon = "mail"

[[config.home.connect]]
label = "RSS"
href = "/rss.xml"
icon = "book"
```

Replace `[config.home.intro].body` and `[config.home.quote].text` arrays with Elizabeth's own short bio lines (English only). Point `image` fields at existing assets in `public/images/` (e.g. `/images/eliz.jpg`) or remove unused image references.

- [ ] **Step 4: Trim topNav if desired**

Keep `[[config.topNav.links]]` for Home, Blog, Projects, About. Remove `Vibe` only if not using short-form notes (Elizabeth wants personal writing, so keep it).

- [ ] **Step 5: Build and verify**

```bash
npm run build
grep -o "Elizabeth Willard" dist/index.html | head -1
```

Expected: build succeeds and "Elizabeth Willard" appears on the homepage. Run `npm run dev` and eyeball the homepage, profile card, and footer.

- [ ] **Step 6: Commit**

```bash
git add src/config/site.toml
git commit -m "feat: configure site.toml with Elizabeth's identity and homepage"
```

---

### Task 7: Configure giscus comments

**Files:**
- Modify: `src/config/site.toml` (`[config.comments.giscus]`)

**Interfaces:**
- Produces: giscus comment box on posts, backed by GitHub Discussions on the blog repo.

- [ ] **Step 1: Enable Discussions + install giscus app (manual, one-time)**

On `github.com/elizabethwillard/elizabethwillard.github.io`: Settings → General → Features → enable **Discussions**. Then install the **giscus GitHub App** (https://github.com/apps/giscus) and grant it access to this repo.

- [ ] **Step 2: Obtain the giscus IDs**

Go to https://giscus.app, enter the repo `elizabethwillard/elizabethwillard.github.io`, choose mapping = **pathname** and a Discussion **Category** (e.g. "Announcements"). Copy the generated `data-repo-id` and `data-category-id`.

- [ ] **Step 3: Write the real IDs into site.toml**

Replace `[config.comments.giscus]` values:

```toml
[config.comments.giscus]
repo = "elizabethwillard/elizabethwillard.github.io"
repo_id = "<data-repo-id from giscus.app>"
category = "Announcements"
category_id = "<data-category-id from giscus.app>"
mapping = "pathname"
strict = "0"
reactions_enabled = "1"
emit_metadata = "0"
input_position = "bottom"
light_theme = "light"
dark_theme = "dark"
lang = "en"
loading = "lazy"
```

- [ ] **Step 4: Build and verify the giscus script is present**

```bash
npm run build
grep -rl "giscus" dist/blog/learningaboutrl/index.html
```

Expected: match. (Live comment loading requires the deployed site + GitHub App; verify fully after deploy.)

- [ ] **Step 5: Commit**

```bash
git add src/config/site.toml
git commit -m "feat: configure giscus comments"
```

---

### Task 8: ~~Add GA4 analytics~~ — SKIPPED for v1

**Decision (2026-06-19):** Analytics is skipped for the initial migration. Do
not create a `GoogleAnalytics.astro` component, do not modify `BaseHead.astro`
for analytics, and do not add any `PUBLIC_GA_ID` wiring. GA4 can be added in a
later follow-up. No work in this task.

---

### Task 9: Redirect old Jekyll URLs

**Files:**
- Modify: `astro.config.mjs`

**Interfaces:**
- Consumes: the new slugs from Task 4.
- Produces: meta-refresh stub pages at the old `/:title/` paths pointing to `/blog/<slug>/`.

- [ ] **Step 1: Add the redirects map to astro.config.mjs**

In `defineConfig({...})`, add a `redirects` key:

```js
  redirects: {
    '/learningaboutdotnet/': '/blog/learningaboutdotnet/',
    '/dyeing-linen/': '/blog/dyeing-linen/',
    '/learningaboutrl/': '/blog/learningaboutrl/',
    '/starting-ec2-with-jupyter-hub/': '/blog/starting-ec2-with-jupyter-hub/',
    '/using_githubactions_with_ecr_and_ec2/': '/blog/using_githubactions_with_ecr_and_ec2/',
    '/computer_organization_and_instruction_set_architecture/': '/blog/computer_organization_and_instruction_set_architecture/',
    '/computer_instruction_set_architecture/': '/blog/computer_instruction_set_architecture/',
    '/slicker_python/': '/blog/slicker_python/',
  },
```

(If Step 1 of Task 4 found any post with an explicit `permalink` differing from its filename, adjust that key to match the real old URL.)

- [ ] **Step 2: Build and confirm redirect stubs exist**

```bash
npm run build
cat dist/learningaboutrl/index.html | grep -i "refresh\|/blog/learningaboutrl"
```

Expected: the generated page contains a meta-refresh / canonical pointing at `/blog/learningaboutrl/`.

- [ ] **Step 3: Commit**

```bash
git add astro.config.mjs
git commit -m "feat: redirect legacy /:title/ URLs to /blog/<slug>/"
```

---

### Task 10: Port the About and Projects pages

**Files:**
- Modify: `src/content/about.mdx`, `src/content/projects/index.mdx`
- Read (source): `_pages/about.md`, `_pages/projects.md`, `_pages/personal.md`

**Interfaces:**
- Produces: real About and Projects pages.

- [ ] **Step 1: Read the current page content**

```bash
cat _pages/about.md _pages/projects.md _pages/personal.md
```

- [ ] **Step 2: Rewrite about.mdx**

Replace the body of `src/content/about.mdx` with Elizabeth's About content (from `_pages/about.md`, refreshed). Keep the existing frontmatter keys the file already has (`title`, `description`, `date`); update their values. Fold any worth-keeping `personal.md` content here or leave it for vibe notes.

- [ ] **Step 3: Rewrite projects/index.mdx**

Replace the body of `src/content/projects/index.mdx` with the projects from `_pages/projects.md`, updating frontmatter values to match.

- [ ] **Step 4: Build and verify**

```bash
npm run build
ls dist/about/index.html dist/projects/index.html
```

Expected: both pages exist and show the new content (spot-check via `npm run dev`).

- [ ] **Step 5: Commit**

```bash
git add src/content/about.mdx src/content/projects/index.mdx
git commit -m "feat: port About and Projects pages"
```

---

### Task 11: Repoint the GitHub Actions workflow to Astro

**Files:**
- Modify: `.github/workflows/jekyll-gh-pages.yml`

**Interfaces:**
- Consumes: `npm run build` producing `dist/` with Pagefind index.
- Produces: a Pages deployment built from Astro instead of Jekyll. `astro.config.mjs` auto-resolves `site`/`base` because `GITHUB_ACTIONS=true`.

- [ ] **Step 1: Replace the build job steps**

Edit `.github/workflows/jekyll-gh-pages.yml` — replace the `build` job's `steps:` with:

```yaml
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - name: Setup Pages
        uses: actions/configure-pages@v5
      - name: Install dependencies
        run: npm ci
      - name: Build with Astro
        run: npm run build
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist
```

Leave the `deploy` job (already on `deploy-pages@v4`) unchanged. Remove the `jekyll-build-pages` step entirely. (No GA env: analytics is skipped for v1 per Task 8.)

- [ ] **Step 2: Validate the workflow YAML locally**

```bash
python3 -c "import yaml,sys; yaml.safe_load(open('.github/workflows/jekyll-gh-pages.yml')); print('YAML OK')"
```

Expected: `YAML OK`.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/jekyll-gh-pages.yml
git commit -m "ci: build and deploy with Astro instead of Jekyll"
```

---

### Task 12: Remove Jekyll files, final verification, and merge

**Files:**
- Delete: `_config.yml`, `_layouts/`, `_includes/`, `_sass/`, `_pages/`, `index.html`, `404.md`, `search.json`, root `assets/`, `_posts/` (including `_posts/drafts/`)
- Remove: temporary `src/content/blog/_mathcheck.md`

**Interfaces:**
- Produces: a clean Astro-only repo; live site after merge.

- [ ] **Step 1: Delete the now-migrated Jekyll files**

```bash
git rm -r _config.yml _layouts _includes _sass _pages index.html 404.md search.json assets _posts
git rm src/content/blog/_mathcheck.md
```

(If `search.json` or root `assets/` does not exist, drop it from the command.)

- [ ] **Step 2: Full clean build**

```bash
rm -rf dist node_modules
npm ci
npm run build
```

Expected: build succeeds end to end with no Jekyll files present.

- [ ] **Step 3: Verification checklist (serve the build and check each)**

```bash
npm run preview   # serves dist/ at http://localhost:4321
```

Verify in the browser / via curl:
- [ ] Homepage renders with Elizabeth's identity.
- [ ] All 8 posts listed at `/blog/` (drafts absent).
- [ ] A math post shows rendered equations (`mjx-container` SVG).
- [ ] Code blocks are highlighted.
- [ ] Search (`mod+k` / Pagefind) returns results: `ls dist/pagefind/pagefind.js`.
- [ ] `dist/rss.xml` exists and is valid XML.
- [ ] `dist/sitemap-index.xml` exists.
- [ ] Old URL redirects: open `http://localhost:4321/learningaboutrl/` → lands on `/blog/learningaboutrl/`.
- [ ] giscus markup present on a post page.

- [ ] **Step 4: Commit cleanup**

```bash
git add -A
git commit -m "chore: remove Jekyll files; Astro migration complete"
```

- [ ] **Step 5: Merge to master (after user sign-off)**

```bash
git checkout master
git merge --no-ff redesign-astro-navfolio -m "Migrate blog from Jekyll to Astro + Navfolio"
git push origin master
```

Then watch the Actions run deploy, and confirm the live site at `https://elizabethwillard.github.io` (posts, math, search, redirects, giscus loads live, GA4 receives a hit in realtime).

---

## Self-Review

**Spec coverage:** Astro+Navfolio scaffold (T1) ✓; MathJax (T2) ✓; image migration (T3) ✓; 8 posts + URL slugs (T4) ✓; drafts unpublished (T5) ✓; site identity/social/GA-comments config (T6, T7, T8) ✓; `/blog/` + redirects (T9) ✓; About/Projects/personal pages (T10) ✓; GA4 replacing dead UA (T8, T11) ✓; giscus replacing Disqus (T7) ✓; deploy on GitHub Pages user site (T11) ✓; verification criteria (T12) ✓. All spec sections map to tasks.

**Placeholder scan:** Remaining `<...>` items are genuine user-supplied values (giscus IDs, GA Measurement ID, post titles/descriptions) with explicit instructions on how to obtain and where to put them — not deferred work.

**Type/name consistency:** Frontmatter keys (`title`, `description`, `date`, `draft`, `tags`, `categories`) match the Navfolio Zod schema in `src/content.config.ts`. `site.toml` block names match the `siteConfig` schema. Build output paths (`dist/`, `dist/pagefind/`, `dist/blog/<slug>/`) are consistent across tasks. npm scripts referenced (`dev`, `build`, `preview`) match Task 1's `package.json`.
