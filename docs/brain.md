# Brain

`brain/Brain.ts` runs one task at a time; a task is a generator coroutine (`Co`, `brain/co.ts`) that receives `dt` on each `next`.

## Priorities

`auto 0` (idle, wander, explore, extra, sleep) < `follow 1` < `page 2` (reactions, goTo, eat, watch typing, purr) < `user 3` (pet, squish, startle, wake, recover) < `fall 4`. A job only replaces a lower or equal priority one; non-air jobs requested mid-air are queued until landing. Cooldowns throttle startle / follow / eat / watch.

## Sensing (each frame)

Falling → recover. Fast cursor close by → startle. Stroke level (hovering back and forth) > 1 → purr. Unclaimed seed → eat. Cursor recently moved within `followRadius` → follow. Otherwise `choose()` picks weighted by `activity`, `explore` and fatigue (grows with `sleepiness`).

## Building blocks (`co.ts`)

`wait`, `once(anim)`, `hold(anim, s)`, `walkTo`, `jumpTo(step)` (crouch → ballistic launch with `clumsiness` error → landing anim), `goTo(surface, x)` (plans with the [planner](world.md#planner), replans up to 3 times), `recover`.

## Tasks

- `tasks.ts`: idle, wander, explore (surface picked by distance/height, avoiding recent ones), extra idle anims, sleep, follow (walk to cursor, look up/down, jump to the surface under a still cursor), startle (run away).
- `social.ts`: react (+ FX cues), petted (roll after 4 quick clicks), wakeUp, squish (long press), purr, eat, watch (typing), afterRagdoll.

## Input

`input/PointerInput.ts` on the hitbox: click (counts within 1.6 s), long press (450 ms), drag past 6 px → ragdoll, hover strokes. It also tracks the global cursor (position, speed) for follow/startle.
