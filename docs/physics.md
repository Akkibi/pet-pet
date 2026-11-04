# Physics

All tunables live in `config.physics`, in `u` and seconds (`gravity` in u/s², speeds in u/s).

## Body (`physics/Body.ts`)

Kinematic, used in anim mode. Grounded: follows its surface (moves with the element via `world.refresh`), walks toward `walkTarget`, falls when the surface ends or disappears. Airborne: gravity, wall/ceiling clamps, landing on one-way platforms (`world.landing`), ledge grab when it reaches a target's top edge from below (± 0.45 u). Emits `land(surface, height, vy)`, `ledge(surface)`, `leave()`. Jumps come from `planner.ballistic` ([world](world.md#planner)).

## Ragdoll (`physics/Ragdoll.ts`)

Fixed-step (1/240 s) Verlet:

- Rigid rear→front segment (2 heavy particles, `HALF` = 0.3 u apart from center) + 4 light leg particles pulled to rest spots (`LEG_REST`) by `limbStiffness`; legs paddle while held.
- Grab: a spring from the cursor distributed along the axis (`dragStiffness`); grabbing sets `belly = −1` so the legs point up (held on its back).
- Collisions with bounds and one-way platform tops, with `bounce` restitution and `friction`; impacts above 7 u/s are reported (`impact` event, bonk FX).
- `restTime` grows when slow and not held; Pet settles after 0.35 s: legs up → `getupBack`, tilted → `getup`, impact over `dizzyImpact` → dizzy first.

`BODY_CY` (0.38 u) is the body-center height above the feet, used to hand over between Body and Ragdoll.
