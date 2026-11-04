# World

`world/World.ts` turns the DOM into walkable segments.

## Scan (`world/scanner.ts`)

TreeWalker over `root`, at most 2500 candidates. An element is a candidate when it matches `platforms.selector` (`[data-pet-platform]`) or, with `platforms.auto`, looks solid: solid tags (button, input, img, …) or a visible background, border or box-shadow. `platforms.ignore` subtrees and the pet layer are skipped. Rescan is debounced (0.35 s) after DOM mutations (style attribute changes are ignored).

## Segments (`world/segments.ts`)

Each frame window (0.25 s or on scroll/resize) re-measures rects and builds surfaces: the floor (bottom of bounds) first, then each box top inside bounds, wider than `platforms.minWidth` u, minus the parts covered by non-ancestor elements within the headroom band (0.85 u). Huge wrappers are skipped. Surface ids are stable per element (`id:k`), so the [body](physics.md#body) can follow moving elements.

## Planner (`world/planner.ts`)

- `edgeBetween(a, b, caps)`: can the pet hop from surface a to b (gaps, higher overlapping → take off beside, lower → step off the edge)? Caps come from `jumpHeight` / `jumpReach`.
- `planPath`: Dijkstra over those edges.
- `ballistic(dx, dy, g, clearance)`: launch velocity and flight time.

Tests: `world/planner.test.ts` (`yarn test`).
