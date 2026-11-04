# pet-pet

A zero-dependency TypeScript "desktop pet" library: a flat golden hamster that roams a web page, hops onto UI elements, reacts to the page and can be petted, dragged and thrown (Verlet ragdoll), plus a React/Tailwind/Leva demo. Yarn workspaces monorepo: `packages/pet-pet` (npm package), `apps/demo` (GitHub Pages).

## Docs

- [docs/architecture.md](docs/architecture.md): repo layout, module map, frame order, units, modes.
- [docs/package.md](docs/package.md): entries (core, `pet-pet/react`), build steps, release flow.
- [docs/api.md](docs/api.md): options, methods, events, `data-pet-*` attributes.
- [docs/rendering.md](docs/rendering.md): layered Canvas2D hamster, pose params, baked strips, view, FX.
- [docs/animations.md](docs/animations.md): anim format, list, reactions, transitions, how to add one.
- [docs/physics.md](docs/physics.md): kinematic body and ragdoll.
- [docs/world.md](docs/world.md): DOM scan, platform segments, jump planner.
- [docs/brain.md](docs/brain.md): coroutine tasks, priorities, sensing, input.
- [docs/demo.md](docs/demo.md): demo app, Leva panel, test pages, install page, deploy.

## Commands (yarn, from the root)

- `yarn dev`: demo dev server (imports the library from source).
- `yarn type-check` / `yarn lint` / `yarn test`.
- `yarn build:lib`: library to `packages/pet-pet/dist`. `yarn build`: library, then demo to `apps/demo/dist`.

## Rules

- Library code (`packages/pet-pet/src`) stays dependency-free (React only in `react.ts`, as an optional peer) and DOM-write-light: transforms/opacity only, reads before writes.
- Files under ~300 lines, minimal comments, docs here instead.
