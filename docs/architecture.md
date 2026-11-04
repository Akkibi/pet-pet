# Architecture

Yarn workspaces monorepo: the library in `packages/pet-pet` ([package](package.md)), the demo in `apps/demo` ([demo](demo.md)). Paths below are relative to `packages/pet-pet/src`.

`Pet.ts` owns every module and runs one `requestAnimationFrame` loop.

| module | role | doc |
| --- | --- | --- |
| `world/` | bounds, DOM scan → platform segments, jump planner | [world](world.md) |
| `physics/Body.ts` | kinematic walker/jumper used in normal mode | [physics](physics.md) |
| `physics/Ragdoll.ts` | Verlet ragdoll used while dragged/thrown | [physics](physics.md) |
| `brain/` | generator coroutines picking what to do | [brain](brain.md) |
| `render/` | layered Canvas2D drawing, baked strips, DOM view | [rendering](rendering.md), [animations](animations.md) |
| `fx/` | DOM particles (WAAPI), speech bubble, seeds | [rendering](rendering.md#fx) |
| `input/PointerInput.ts` | click / long press / drag / stroke / cursor tracking | [brain](brain.md#input) |
| `dom.ts` | `data-pet-*` click delegation, typing watch | [api](api.md#data-attributes) |
| `debug.ts` | surfaces overlay | [demo](demo.md) |
| `react.ts` | `usePet` / `HamsterPet` (separate `pet-pet/react` entry) | [package](package.md) |

## Frame order

1. Apply a pending resize (debounced 180 ms, skipped while ragdolling).
2. `world.update` (DOM reads: scan every 0.35 s when dirty, rect measure every 0.25 s or on scroll/resize/mutation).
3. Anim mode: `brain.update` → `body.update` → `anim.update`. Ragdoll mode: `ragdoll.step`, settle check.
4. Seeds, then view writes (CSS `transform` only, canvas redrawn only when the frame changes).

All reads happen before writes in a frame to avoid layout thrash.

## Units

`u` = body length in px, resolved from `size` (`10vh` by default). Physics, poses, FX offsets and planner caps are in `u`.

## Modes

- **anim**: `Body` moves, the canvas shows a baked strip frame, flipped with CSS `scaleX(-1)`.
- **ragdoll**: entered on drag, drawn live each frame, back to anim when resting 0.35 s; the brain then runs `afterRagdoll` (getup / getupBack / dizzy).
