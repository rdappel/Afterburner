# Afterburner

Codename for the 2026 redesign of **ryan-appel.com** — a single-page portfolio with a long-form blog, built with [Astro](https://astro.build).

## Quick start

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # static site -> dist/
npm run preview   # serve the built site locally
```

Requires Node 18.20+ (Node 20 or 22 recommended).

## What's where

```
src/
  data/site.ts                 ← projects, courses, stack — edit copy & data here
  pages/index.astro            ← the single-page home (hero, work, lab, teaching, stack, writing, contact)
  pages/archive/index.astro    ← blog index  (/archive/)
  pages/archive/[...slug].astro← blog post    (/archive/<file-name>/)
  content/blog/*.md            ← blog posts (markdown + front matter)
  content.config.ts            ← blog front-matter schema
  scripts/home.ts              ← home-page interactions (showcase, collision lab, tabs, form…)
  styles/global.css            ← all styles, palette tokens at the top
  layouts/Base.astro           ← <head>, header, footer, custom cursor
public/images/work/            ← project screenshots
```

## Blog posts

URLs match the old site: `src/content/blog/spatial-partitioning-part-1.md` → `/archive/spatial-partitioning-part-1/`.

**The two existing posts are placeholders** — paste your original markdown over the body of each file (keep the front matter). Every `##` heading becomes a numbered entry in the article's table of contents automatically, and a `> blockquote` renders as the big lime callout.

Front matter:

```yaml
title: "Spatial Partitioning in a Shmup — Part 1: The Broad Phase"   # text after the last ":" is highlighted
date: 2026-04-13
summary: "One or two sentences for cards and the index."
tag: "Game dev"        # used for the topic filter (shown once there are 2+ topics)
readTime: 10           # minutes, optional
series: "Spatial Partitioning in a Shmup"   # optional — enables the series card + "Next in series"
part: 1                # optional
diagram: true          # optional — shows the broad-phase grid diagram under the title
draft: false           # optional — hides the post
```

## Projects

Edit `src/data/site.ts`. Each project can have an `image` (`fit: 'cover'` for desktop screenshots, `'contain'` for tall/handheld captures); without one, a patterned placeholder screen is shown. Still to fill in: **Grade Assist** description and year, and screenshots for Home Hub, Grade Assist and ryan-appel.com.

## Contact form

The form posts to whatever URL is in `PUBLIC_CONTACT_ENDPOINT`. Any form backend that accepts a POST works (Formspree, Getform, Basin, a serverless function…). Create a `.env` file:

```
PUBLIC_CONTACT_ENDPOINT=https://formspree.io/f/your-form-id
```

Until that's set, submitting shows a "not connected yet" message instead of pretending to send.

## Motion

- Scroll-driven effects (section stacking, fly-ins, pinned "What I do" panels) use CSS scroll timelines — Chrome/Edge and recent Safari. Other browsers get the same layout fully visible, without the scroll animation.
- The Selected Work "freeze" showcase and the collision lab are driven by JavaScript and work everywhere.
- Everything respects `prefers-reduced-motion`.

## Palette

`--lime #D4FF3A` · `--blue #3A60FF` · `--ice #A8C2FF` on ink `#050505`, with paper `#F1EEE6` for the Writing section. Fonts: Archivo (display), Manrope (body), JetBrains Mono (labels), loaded from Google Fonts.
