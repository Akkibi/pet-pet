# Demo

`src/App.tsx`: top bar with a page dropdown (synced to the URL hash), a scrollable stage `<main>` used as both `container` and `root` of the pet, and the Leva panel.

## Leva (`src/demo/controls.ts`)

Themed with the project palette (`LEVA_THEME`). Folders: Apparence (size in vh, fur preset, shape preset, colors, silhouette, face), Physique, Comportement, Transitions (blend multiplier, turn time), Réactions (one button each), Actions (feed, sleep, wake, say, rescan), Debug (surfaces overlay, task/anim label). Values are pushed with `pet.set`.

## Pages (`src/demo/pages/`)

Tailwind v4, theme tokens in `src/index.css` (`cream paper sand line ink muted honey blush mint sky lilac`). `PAGES` lists them; each gets `{ pet }` (`src/demo/types.ts`).

landing · dashboard · todo · form · blog · chat · gallery · playground. They use `data-pet-*` attributes and the [API](api.md) to trigger reactions.

## Deploy

`.github/workflows/deploy.yml` builds on push to `main` (tests + `vite build`, `base: './'`) and publishes `dist/` to GitHub Pages. `yarn build:lib` outputs the standalone library to `dist-lib/` (ES + UMD).
