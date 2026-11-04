# pet-pet 🐹

A tiny hamster that lives on your web page. It roams inside the space you give it, hops onto cards and buttons, follows your cursor, naps, eats seeds, watches you type and reacts to what happens on the page. Click to pet it, hold to squish it, drag and throw it: it turns into a ragdoll.

**Demo:** https://akkibi.github.io/pet-pet/ · zero dependencies · TypeScript types included · MIT

## Install

```sh
yarn add pet-pet      # or: npm install pet-pet / pnpm add pet-pet
```

## Use

```ts
import { createPet } from 'pet-pet'

const pet = createPet({
  container: document.querySelector('main'), // optional, defaults to the viewport
  size: '10vh',
})

pet.react('success', { say: 'Saved!' })
```

Any clickable element can trigger a reaction, no JS needed:

```html
<button data-pet-react="approve" data-pet-say="Nice!">Save</button>
<button data-pet-react="delete">Delete</button>
<section data-pet-platform>always a platform</section>
<aside data-pet-ignore>never a platform</aside>
```

### React

`pet-pet/react` ships a hook and a component. React is an optional peer dependency (17+); projects without React load none of it.

```tsx
import { useRef } from 'react'
import { usePet } from 'pet-pet/react'

export function App() {
  const main = useRef<HTMLElement>(null)
  const pet = usePet({ container: main, preset: 'golden' })
  return (
    <main ref={main}>
      <button onClick={() => pet?.react('approve')}>Save</button>
    </main>
  )
}
```

`usePet(options)` creates the pet on mount, destroys it on unmount, recreates it if `container` / `root` change and pushes other option changes with `pet.set`. `<HamsterPet {...options} onReady={(pet) => …} />` does the same and renders nothing.

### Script tag

```html
<script src="https://unpkg.com/pet-pet@0.1"></script>
<script>
  const pet = PetPet.createPet({ size: '10vh' })
</script>
```

## API

- **Options:** `container`, `root`, `size`, `preset` (`golden grey cream choco`), `shape` (`soft loaf head stripe block`), `appearance`, `physics`, `behavior`, `motion`, `platforms`, `spawn`.
- **Methods:** `react(name, { say })`, `say(text)`, `goTo(el)`, `feed()`, `sleep()`, `wake()`, `set(patch)`, `on(event, fn)`, `refresh()`, `destroy()`.
- **Events:** `pet`, `grab`, `throw`, `impact`, `land`, `state`, `react`, `eat`, `sleep`, `wake`.
- **Reactions:** `REACTION_NAMES` lists them (`approve cancel delete error success wave thinking…`).

Full reference: [docs/api.md](https://github.com/Akkibi/pet-pet/blob/main/docs/api.md).

## Bundles

| file | format |
| --- | --- |
| `dist/pet-pet.js` | ESM (`import`) |
| `dist/pet-pet.umd.cjs` | UMD (`require`) |
| `dist/pet-pet.iife.js` | IIFE, global `PetPet` (unpkg / jsDelivr) |
| `dist/react.js` · `dist/react.cjs` | `pet-pet/react` |
