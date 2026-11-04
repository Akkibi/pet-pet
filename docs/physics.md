# Physics

All tunables live in `config.physics`, in `u` and seconds (`gravity` in u/s², speeds in u/s).

## Body (`physics/Body.ts`)

Kinematic, used in anim mode. Grounded: follows its surface (moves with the element via `world.refresh`), walks toward `walkTarget`, falls when the surface ends or disappears. Airborne: gravity, wall/ceiling clamps, landing on one-way platforms (`world.landing`), ledge grab when it reaches a target's top edge from below (± 0.45 u). Emits `land(surface, height, vy)`, `ledge(surface)`, `leave()`. Jumps come from `planner.ballistic` ([world](world.md#planner)).

## Ragdoll (`physics/Ragdoll.ts`)

Fixed-step (1/240 s) Verlet:

- Rigid rear→front segment (2 heavy particles, `HALF` = 0.3 u apart from center) + 4 light leg particles pulled to rest spots (`LEG_REST`) by `limbStiffness`; legs paddle while held.
- Every force on the segment goes through `impulse(point, j)`: linear part split on both ends, torque `r × j` turned into opposite perpendicular moves (rod inertia `2mL²`). Leg springs push back on the body with the equal and opposite impulse, so they can't create a net spin.
- Grab: a point constraint solved with the 2×2 effective-mass matrix at the grab point (`dragStiffness`), so an off-axis grab swings like a pendulum instead of spinning; grabbing sets `belly = −1` so the legs point up (held on its back).
- Collisions with bounds and one-way platform tops, with `bounce` restitution and `friction`; impacts above 7 u/s are reported (`impact` event, bonk FX).
- `restTime` grows when slow and not held; Pet settles after 0.35 s: legs up → `getupBack`, tilted → `getup`, impact over `dizzyImpact` → dizzy first.

`BODY_CY` (0.38 u) is the body-center height above the feet, used to hand over between Body and Ragdoll.

Tests: `physics/ragdoll.test.ts` (held 20 s with a wiggling cursor from several grab points must not spin up; a throw must come to rest).
