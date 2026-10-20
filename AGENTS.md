# Prototype Instructions

## Design Context

The user selected the workbench concept: powder blue desk, cream paper, navy lettering, orange accent, natural light, and tactile materials. They want polished, smooth, convincing interaction. This prototype is deliberately scoped to one project sheet that lifts, opens into readable content, and returns. Generated project content is illustrative, not a claim of real client work.

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

## Decisions (2026-09-23 polish pass)

- The page is now a full scrolling desk: hero, three service sheets (Websites / Software / Automation), a process notebook, a contact letter, and a footer. It follows the user's two reference boards.
- The props (plant, mug, dish, pencil, ruler) are transparent cutouts in `public/assets/props/`, matted from `desk.webp` with their shadows kept. The desk surface itself is CSS. Paper shadows fall down-left to match the lighting in the photo.
- Type: Fraunces (SOFT/WONK axes) for display, DM Sans for body, Caveat for handwritten notes. Motion stays moderate; the user has pushed back on too much animation before.
- Honesty: the Tide & Timber case study is labelled "Unsolicited concept · not client work". Don't add invented stats or client claims. The contact form opens a mailto (there's no backend).

## 2026-09-23 Tide & Timber rebrand

- The whole site was rebranded from a studio homepage into a fictional client concept: **"Tide & Timber"**, a slow-travel journal from "the western shore" (an invented coastline, no real place names). It is labelled everywhere as "Concept site · not a real business" (footer + a fixed bottom-left pill on every page), with no studio or author name, so the same build ships to every domain, and the copy never claims to be a real business.
- Content lives in `src/stories.js` (five stories: featured/cove/harbour/rockpools/path) and is rendered by the generalized `Story` component in `src/App.jsx` (was `CaseStudy`). The morph-open/close and view-transition logic is unchanged in shape, just parameterized by story id and source element.
- Asset pipeline for the 19 new photos (originals dropped in `~/Downloads`):
  - Originals were copied into `assets-src/raw/` (outside `public/`, gitignored) so Vite never ships the ~45MB of source PNGs.
  - **Prop cutouts** (plant, mug, dish, pencil, ruler, compass, camera, map*, pebbles, postcards) are matted from their blue-desk photos with `scripts/matte-props.py` — a per-image adaptation of an exploratory matting script. It fits a quadratic surface to the blue background, keeps dark/deviating pixels as opaque object, turns the rest into semi-transparent navy shadow, auto-crops to the alpha bbox with a 24px pad and a 40px edge feather (skipped on sides touching the image border), and exports WebP with alpha via `cwebp -q 86 -alpha_q 90`. Run it again with `python3 scripts/matte-props.py <in.png> <out.webp>` if a prop photo is replaced.
    - *Exception: the folded map (`public/assets/props/map.webp`) is **not** matted — matting stripped the map's own blue sea colour and made it look washed out. It's a plain tight crop of the raw photo (opaque, own paper shadow via CSS), not alpha-cut.
  - **Photos** (coast, cove, harbour, rockpool, pine, path, terrace) are exported as WebP q80 at native width and an 800w variant, in `public/assets/photos/`, and always rendered through the `Photo` component (`srcSet`/`sizes`/explicit width+height/lazy except the hero image).
  - Paper texture (`public/assets/paper.webp`) and the hero desk background (`public/assets/desk.webp`) come from the same photo set; `--desk` is the median colour of the desk photo (`#9cc2df`). The hero section uses the desk photo as a `cover` background that fades into the flat `--desk` colour via a mask gradient; every other section keeps the old CSS noise texture.
  - Old `desk.webp`/`desk-mobile.webp`/`coast.webp` prototype assets were deleted once nothing referenced them.
- Field guides panel is a CSS "booklet" (two rotated paper covers + a pine image band), not a real product — clicking "Add to bag" shows a hand-written "demo only, nothing to buy" note that fades after 2.5s.
- Handwritten notes placed directly on the blue desk (margin notes, scroll cue, hand-title headings) use `--navy` for contrast, not `--ink-soft`/`--ink`; notes on paper keep the warmer `--ink`.
- The concept pill (bottom-left, fixed) is always visible on desktop/tablet; on mobile it only appears after scrolling past the hero, and is positioned to never sit over the letter form's submit button.
