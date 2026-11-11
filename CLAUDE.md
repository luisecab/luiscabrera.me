# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Luis Cabrera's personal single-page portfolio at https://www.luiscabrera.me/. Plain static HTML/CSS/JS with no build step, no package manager, no tests and no linter. Deployed on Vercel straight from the repo root (`vercel.json`: `framework: null`, empty `buildCommand`, `outputDirectory: "."`). Changes land via PRs merged into `main`.

## Local preview

```bash
python3 -m http.server 8000
```

Open http://localhost:8000. `/_vercel/insights/script.js` (Vercel Web Analytics) only exists when deployed, so a 404 for it locally is expected.

## Architecture

- `index.html` holds all content: intro greeting overlay, an inline SVG "topographic" flowing-lines background (`#topoLines`, grouped into `.topo-group-N`), then sections (hero, about, projects, GitHub activity, experience timeline, hackathons, education, contact/CV request) and footer.
- `styles.css` is organised in `/* ===== Section ===== */` blocks matching those sections, plus responsive, reduced-motion and print blocks near the end. `index.html` links it as `styles.css?v=YYYYMMDD[x]`; bump that query string whenever CSS changes so returning visitors don't get a stale cached copy.
- `main.js` is one IIFE run on `DOMContentLoaded`: intro greeting sequence (skippable by any input, skipped entirely under `prefers-reduced-motion` or once `sessionStorage.introSeen` is set), then GSAP reveal animations, smooth anchor scroll, cursor-reactive displacement of the topo line groups, a console ASCII-art easter egg, and the CV request form.
- External runtime dependencies are loaded from CDNs in `index.html`: GSAP (cdnjs) and supabase-js (jsdelivr). The GitHub contribution graph is an `<img>` from ghchart.rshah.org. Inter is self-hosted in `fonts/` (variable woff2, latin + latin-ext); don't reintroduce Google Fonts.
- CV form: `main.js` calls the Supabase Edge Function `send-cv` with `{ email }` using the public anon key embedded in `main.js` (intentionally client-side). The function itself is not in this repo. Client-side email validation and a 60s rate limit exist only for UX.
- Motion respects `prefers-reduced-motion` in both CSS and JS; keep that true for any new animation.

## Content is duplicated across files

Bio, title, role and project copy appear in several places that must stay in sync when edited (past commits update them together):

- Visible copy in `index.html`
- `<title>`, meta description, Open Graph and Twitter tags in `index.html`
- JSON-LD `ProfilePage`/`Person` block in the `<head>` of `index.html`
- `llms.txt` (summary) and `llms-full.txt` (full page as plain text) for LLM/GEO crawlers
- `sitemap.xml` `lastmod` when content changes meaningfully

## Non-site files

`.vercelignore` keeps `.claude/`, `portfolio-prompt.md` and this file out of deployments. `portfolio-prompt.md` is the original design brief (warm off-white palette, glassmorphism cards, flowing SVG lines, bold section headers, no bullet lists in visible content, no saturated accents). Its content details are outdated (e.g. "FotoSeller" is now FotoReady), but the design constraints still describe the site's intended look.
