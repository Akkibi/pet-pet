# Package

Workspace `packages/pet-pet`, published to npm as `pet-pet` (MIT). Its `README.md` is the npm page; `LICENSE` is a copy of the root one.

## Entries

| import | source | build |
| --- | --- | --- |
| `pet-pet` | `src/index.ts` | `dist/pet-pet.js` (ESM), `pet-pet.umd.cjs` (UMD, `require`), `pet-pet.iife.js` (global `PetPet`, `unpkg`/`jsdelivr` field) |
| `pet-pet/react` | `src/react.ts` | `dist/react.js`, `react.cjs`; `react` and `pet-pet` stay external so the engine isn't duplicated |

`src/react.ts` imports the library by its own name (`'pet-pet'`), resolved by the `paths` entry in `tsconfig.json` during type-check and by the package `exports` for consumers. `usePet(options)` creates the [Pet](api.md) in an effect (container/root accept an element or a ref), destroys it on unmount, recreates it when `container`/`root` change and calls `pet.set` when the rest of the options change (compared as JSON). `HamsterPet` wraps it with an `onReady` callback. React ≥ 17 is an optional peer dependency.

## Build

`yarn build:lib` (root) runs, in `packages/pet-pet`:

1. `vite build`: core lib in three formats (`vite.config.ts`, default mode).
2. `vite build --mode react`: the React entry, without emptying `dist`.
3. `tsc -p tsconfig.build.json`: `.d.ts` files only (tests excluded).
4. `node scripts/dts-ext.mjs`: adds `.js` / `/index.js` to relative imports in the `.d.ts` files so types also resolve under `moduleResolution: nodenext`.

`prepack` runs the build, so `npm pack` / `npm publish` always ship a fresh `dist`.

## Release

`.github/workflows/release.yml`, on a pushed `v*` tag: type-check, lint, tests, checks the tag equals `package.json` version, `npm pack`, `npm publish --provenance --access public` (only when the `NPM_TOKEN` repo secret exists), then a GitHub Release with the `.tgz` attached.

```sh
# bump packages/pet-pet/package.json version (and VERSION in apps/demo/src/demo/install/snippets.ts)
git tag v0.2.0 && git push origin v0.2.0
```

The demo's install page ([demo](demo.md)) reads its version and npm/GitHub switch from `snippets.ts`.
