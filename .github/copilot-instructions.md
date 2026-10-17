# Afterburner Copilot Instructions

## Commands

Requires Node.js 18.20+; Node 20 or 22 is recommended.

```bash
npm install          # install dependencies for local development
npm run dev          # Astro dev server at http://localhost:4321
npm run build        # production static-site build to dist/
npm run preview      # serve the already-built dist/ output
```

This repository has no configured test runner, test files, linter, or single-test command. Use `npm run build` as the available project validation command.

## Architecture

- This is an Astro 5 static portfolio and blog. `src/layouts/Base.astro` supplies global styles, metadata, header/footer, and the custom cursor around every page.
- `src/pages/index.astro` is the composed one-page portfolio. Its editable project, course, and stack content comes from `src/data/site.ts`; keep presentation logic in the page and content records in that data module.
- `src/scripts/home.ts` implements all home-page interactivity, including project filters/showcase, collision lab, course rail, stack tabs, and contact form. It is progressive enhancement: the HTML/CSS layout must remain usable without JavaScript.
- `src/styles/global.css` owns the shared design tokens and component/route styles. Much of the page geometry is intentionally kept as inline Astro `style` attributes, while reusable class styling and responsive behavior belong in this stylesheet.
- Blog posts are Markdown/MDX files in `src/content/blog/`. `src/content.config.ts` validates their front matter and derives each route from the filename. `src/pages/archive/index.astro` builds the filtered/sorted index; `src/pages/archive/[...slug].astro` statically renders post pages, a depth-2 heading TOC, optional diagrams, and series navigation.

## Repository Conventions

- Keep home data, markup, and script selectors synchronized. `home.ts` queries `data-*` hooks emitted by `index.astro` (for example `data-filter`, `data-show`, `data-lab`, and `data-tab`); rename or remove a hook only when updating both sides.
- Preserve the motion fallback model. JavaScript effects must honor `prefers-reduced-motion` where applicable, and CSS scroll-timeline/pinned effects must still yield readable stacked content in browsers without those capabilities.
- Add or modify blog front matter according to the schema: `title`, `date`, and `summary` are required; `tag`, `readTime`, `series`, `part`, `diagram`, and `draft` drive archive filtering and article presentation. Set `draft: true` to hide a post from the home page, archive, and generated post routes.
- Blog URLs use the content entry ID, which is normally the Markdown filename: `src/content/blog/example.md` becomes `/archive/example/`. Every `##` heading becomes a numbered TOC entry; `> blockquote` is styled as the article callout.
- When changing a series, keep `series` identical across entries and assign consecutive `part` values; article navigation determines the next post from those values.
- Use `src/data/site.ts` for portfolio copy, project screenshots, course lists, and stack categories. Project image paths are root-relative references to files under `public/`; set image `fit` to `cover` for desktop captures and `contain` for tall/handheld captures.
- Reuse the CSS custom properties defined on `.site` (`--lime`, `--blue`, `--ice`, `--ink`, etc.) and established utility classes such as `.x`, `.mono`, and `.wrap` instead of introducing one-off visual tokens.
- The contact form endpoint is intentionally supplied at build time through `PUBLIC_CONTACT_ENDPOINT`. Do not hard-code a form service URL; with no endpoint, the client displays its not-connected status.

