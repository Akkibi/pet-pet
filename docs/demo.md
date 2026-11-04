# Demo

Workspace `apps/demo` (`pet-pet-demo`, private). It imports `pet-pet` from source through a Vite alias and a TS `paths` entry, so library edits hot-reload without a build.

`src/App.tsx`: top bar with a page dropdown (synced to the URL hash), an "Installer" button, a scrollable stage `<main>` used as both `container` and `root` of the pet, and the Leva panel.

## Leva (`src/demo/controls.ts`)

Themed with the project palette (`LEVA_THEME`). Folders: Apparence (size in vh, fur preset, shape preset, colors, silhouette, face), Physique, Comportement, Transitions (blend multiplier, turn time), Réactions (one button each), Actions (feed, sleep, wake, say, rescan), Debug (surfaces overlay, task/anim label). Values are pushed with `pet.set`.

## Pages (`src/demo/pages/`)

Tailwind v4, theme tokens in `src/index.css` (`cream paper sand line ink muted honey blush mint sky lilac`). `PAGES` lists them; each gets `{ pet }` (`src/demo/types.ts`).

landing · dashboard · todo · form · blog · chat · gallery · playground · install. They use `data-pet-*` attributes and the [API](api.md) to trigger reactions.

`install`: how to add the [package](package.md) to a project (yarn/npm/pnpm tabs, vanilla, React, script tag), reaction chips that drive the live pet, options and methods. Snippets and the distribution switch (`DIST`, `VERSION`) live in `src/demo/install/snippets.ts`; `Code.tsx` is the copyable code block.

## Deploy

`.github/workflows/deploy.yml` runs on push to `main`: type-check, lint, tests, `yarn build` (library then demo, `base: './'`), and publishes `apps/demo/dist` to GitHub Pages.
