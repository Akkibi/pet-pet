# pet-pet 🐹

A tiny hamster that lives on your web page. It roams inside the space you give it, picks UI containers and hops onto them, follows your cursor, naps, eats seeds, watches you type, and reacts to what happens on the page (`approve`, `delete`, `error`, `success`…). Click to pet it, hold to squish it, drag it around and throw it at the walls: it becomes a ragdoll.

**Demo:** https://akkibi.github.io/pet-pet/

- Zero dependencies, ~vanilla TypeScript, Canvas2D.
- Frame-by-frame animations baked into image strips from layered drawing; the ragdoll is drawn live.
- Sized in viewport units (`10vh` by default).

```ts
import { createPet } from './src/pet'

const pet = createPet({ container: document.querySelector('main') })
pet.react('success', { say: 'Saved!' })
```

```html
<button data-pet-react="delete">Delete</button>
<button data-pet-react="approve" data-pet-say="Nice!">Save</button>
<aside data-pet-ignore>…</aside>
```

See [docs/api.md](docs/api.md) for every option, method, event and attribute.

## Develop

```sh
yarn
yarn dev        # demo with test pages and a Leva tweak panel
yarn test       # planner / surfaces unit tests
yarn build:lib  # dist-lib/pet-pet.js (ES) + .umd.cjs
```
