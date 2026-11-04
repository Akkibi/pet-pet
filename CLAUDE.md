# pet-pet

A zero-dependency TypeScript "desktop pet" library: a flat golden hamster that roams a web page, hops onto UI elements, reacts to the page and can be petted, dragged and thrown (Verlet ragdoll), plus a React/Tailwind/Leva demo.

## Docs

- [docs/architecture.md](docs/architecture.md): module map, frame order, units, modes.
- [docs/api.md](docs/api.md): options, methods, events, `data-pet-*` attributes.
- [docs/rendering.md](docs/rendering.md): layered Canvas2D hamster, pose params, baked strips, view, FX.
- [docs/animations.md](docs/animations.md): anim format, list, reactions, how to add one.
- [docs/physics.md](docs/physics.md): kinematic body and ragdoll.
- [docs/world.md](docs/world.md): DOM scan, platform segments, jump planner.
- [docs/brain.md](docs/brain.md): coroutine tasks, priorities, sensing, input.
- [docs/demo.md](docs/demo.md): demo app, Leva panel, test pages, deploy.

## Commands (yarn)

- `yarn dev`: demo dev server.
- `yarn type-check` / `yarn lint` / `yarn test`.
- `yarn build`: demo to `dist/` (GitHub Pages). `yarn build:lib`: library to `dist-lib/`.

## Rules

- Library code (`src/pet`) stays dependency-free and DOM-write-light: transforms/opacity only, reads before writes.
- Files under ~300 lines, minimal comments, docs here instead.
