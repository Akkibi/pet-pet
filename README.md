# pet-pet 🐹

A tiny hamster that lives on your web page. It roams inside the space you give it, picks UI containers and hops onto them, follows your cursor, naps, eats seeds, watches you type, and reacts to what happens on the page (`approve`, `delete`, `error`, `success`…). Click to pet it, hold to squish it, drag it around and throw it at the walls: it becomes a ragdoll.

**Demo:** https://akkibi.github.io/pet-pet/ (the "Installer" page walks through setup).

- Zero dependencies, vanilla TypeScript, Canvas2D, with an optional React hook.
- Frame-by-frame animations baked into image strips from layered drawing; the ragdoll is drawn live.
- Sized in viewport units (`10vh` by default).

## Install

```sh
yarn add pet-pet
```

```ts
import { createPet } from 'pet-pet'

const pet = createPet({ container: document.querySelector('main') })
pet.react('success', { say: 'Saved!' })
```

```html
<button data-pet-react="delete">Delete</button>
<button data-pet-react="approve" data-pet-say="Nice!">Save</button>
<aside data-pet-ignore>…</aside>
```

React, script tag and bundles: [packages/pet-pet/README.md](packages/pet-pet/README.md). Every option, method, event and attribute: [docs/api.md](docs/api.md).

## Repository

Yarn workspaces monorepo:

- `packages/pet-pet`: the library published to npm.
- `apps/demo`: the React + Tailwind + Leva demo deployed to GitHub Pages.

```sh
yarn
yarn dev         # demo with test pages and a Leva tweak panel
yarn test        # library unit tests
yarn build:lib   # packages/pet-pet/dist (ESM, UMD, IIFE, React entry, .d.ts)
yarn build       # library, then the demo to apps/demo/dist
```

Releasing: [docs/package.md](docs/package.md). License: MIT.
