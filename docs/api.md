# Public API

Entry: `packages/pet-pet/src/index.ts`. Zero dependencies, works in any page. Install and bundles: [package](package.md).

```ts
import { createPet } from 'pet-pet'
const pet = createPet({ container: document.querySelector('main'), size: '10vh' })
```

## Options (`PetOptions`)

| key | default | notes |
| --- | --- | --- |
| `container` | viewport | Bounds the pet lives in (client box ∩ viewport). |
| `root` | `document` | Subtree scanned for platforms. Use the container to skip overlays. |
| `size` | `'10vh'` | Body length. `number` (px) or `'Npx' / 'Nvh' / 'Nvw' / 'Nvmin'`, re-resolved on resize. |
| `preset` | `golden` | Palette: `golden grey cream choco` (see [rendering](rendering.md)). |
| `shape` | `soft` | Silhouette preset: `soft loaf head stripe block`. |
| `appearance / physics / behavior / platforms / debug` | see `config.ts` | Partial overrides. |
| `motion` | `{ blend: 1, turnTime: 0.18 }` | Transition duration multiplier (0 = off), left/right turn in seconds ([animations](animations.md#transitions)). |
| `spawn` | random x, top | `{ x, y }` in viewport px; the pet falls in. |

## Methods

- `react(name, { say?, hold?, duration? }) → Promise<boolean>`: plays a [reaction](animations.md#reactions). Aliases: `hello→wave celebrate→success loading→thinking ok→approve no→cancel`. `hold` loops until another task replaces it.
- `say(text, ms?)`: speech bubble.
- `goTo(elementOrSelector) → Promise<boolean>`: path-plans to that element's top ([world](world.md)).
- `feed(x?)`: drops a seed; the pet goes and eats it.
- `sleep()` / `wake()`, `refresh()` (rescan platforms), `set(patch)` (live config), `state`, `destroy()`.
- `on(event, fn) → off`, `off(event, fn)`.

## Events

`pet {count}` · `grab {part}` · `throw {speed}` · `impact {speed,x,y}` · `land {surface,height}` · `state {task,anim}` · `react {name}` · `eat {x,y}` · `sleep` · `wake`. Speeds are in body lengths per second.

## Data attributes

- `data-pet-react="approve"` (+ `data-pet-say="…"`): click triggers a reaction.
- `data-pet-say="…"`: click shows a bubble.
- `data-pet-platform`: force an element to be a platform.
- `data-pet-ignore`: exclude an element and its subtree from platforms and typing watch.

Typing in `input` / `textarea` / `contenteditable` inside the container makes the pet come and watch ([brain](brain.md)).
