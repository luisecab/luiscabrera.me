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

Deep-space theme: dark page, canvas starfield, a canvas galaxy in the hero, constellation-style experience timeline. Motion follows Emil Kowalski's design-engineering rules (github.com/emilkowalski/skills): only `transform`/`opacity`/`filter`, the custom curves in `--ease-out`/`--ease-in-out`, exits faster than entrances, `:active` press feedback, hover effects only inside `@media (hover: hover) and (pointer: fine)`, and a reduced-motion path that keeps fades but drops movement.

- `index.html` holds all content. An inline script in `<head>` runs before first paint: it adds `html.js` (enables the hidden-until-revealed styles) and `html.intro-active` (only when not reduced-motion and `sessionStorage.introSeen` is unset). Without JS everything renders visible and the intro never shows.
- Sky layers sit behind content: `.nebula` (static CSS gradients, z-index -2) and `<canvas id="starfield">` (z-index -1). Do not give `body` a background; it paints over negative-z layers. The page colour is on `html`.
- `main.js` is one IIFE run on `DOMContentLoaded`:
  - `createStarfield()` draws depth-layered stars with twinkle, scroll parallax, spring-smoothed pointer parallax, rare shooting stars, and a `warp(ms)` hyperspace effect. It pauses when the tab is hidden and draws a single static frame under reduced motion.
  - `createGalaxy()` draws the hero centrepiece on `<canvas id="galaxy">`: a star, a disk of orbiting particles (inner ones faster) and two energy jets, with additive blending. It tilts with the pointer, emits a shockwave on click, and only animates while the hero is on screen.
  - `runIntro()` cycles greetings, then calls `warp()` and reveals the hero, or reveals right away when the intro is off.
  - `initReveal()` uses IntersectionObserver to add `.is-visible` to `.section > .section-title`, `main .glass-card`, `.experience-card` and `.footer-content`, staggering elements that arrive in the same batch. The reveal animates `translate`/`filter`/`opacity`, so `transform` stays free for hover lift. Keep those properties separate.
  - `initEnigmas()`: the footer button `#cipher` is Morse for "warp"; typing that word or pressing the button triggers the warp and a galaxy pulse. The console message hints at this. Other cues are deliberate too: coordinates in the hero and About (Warsaw, and Mexico City → Warsaw), `data-cue` chapter labels on section titles, "E = mc²" under the galaxy.
  - Also: `.spotlight` cursor glow on cards, console easter egg, CV form.
- `styles.css` is organised in `/* ===== Section ===== */` blocks, with hover, responsive, reduced-motion and print blocks at the end. `index.html` links `styles.css?v=…` and `main.js?v=…`. Bump the query string when either file changes so returning visitors don't get a stale cached copy.
- External runtime dependencies: supabase-js (jsdelivr), and the GitHub contribution graph `<img>` from ghchart.rshah.org (rendered dark-on-light, inverted with CSS filters). Inter is self-hosted in `fonts/`; don't reintroduce Google Fonts.
- CV form: `main.js` calls the Supabase Edge Function `send-cv` with `{ email }` using the public anon key embedded in `main.js` (intentionally client-side). The function itself is not in this repo. Client-side email validation and a 60s rate limit exist only for UX.

## Content is duplicated across files

Bio, title, role and project copy appear in several places that must stay in sync when edited (past commits update them together):

- Visible copy in `index.html`
- `<title>`, meta description, Open Graph and Twitter tags in `index.html`
- JSON-LD `ProfilePage`/`Person` block in the `<head>` of `index.html`
- `llms.txt` (summary) and `llms-full.txt` (full page as plain text) for LLM/GEO crawlers
- `sitemap.xml` `lastmod` when content changes meaningfully

## Non-site files

`.vercelignore` keeps `.claude/`, `portfolio-prompt.md` and this file out of deployments. `portfolio-prompt.md` is the original design brief (light palette, flowing SVG lines). The site has since moved to the space theme above, so only its structural rules still apply: bold section headers, no bullet lists in visible prose, no saturated accents.
