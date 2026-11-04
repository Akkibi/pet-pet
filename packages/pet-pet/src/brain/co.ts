import type { AnimName } from '../render/anims'
import { ballistic, planPath, type Caps, type Step } from '../world/planner'
import type { PetCtx } from './ctx'

export type Co<R = void> = Generator<void, R, number>

export function* wait(s: number): Co {
  let t = 0
  while (t < s) t += yield
}

export function* once(c: PetCtx, name: AnimName, speed = 1): Co {
  c.anim.play(name, true, speed)
  while (!c.anim.done) yield
}

export function* hold(c: PetCtx, name: AnimName, s: number): Co {
  c.anim.play(name, true)
  yield* wait(s)
}

export const caps = (c: PetCtx): Caps => ({
  u: c.u,
  maxUp: c.cfg.physics.jumpHeight * c.u * 0.92,
  maxReach: c.cfg.physics.jumpReach * c.u,
})

export function* walkTo(c: PetCtx, x: number, run = false): Co<boolean> {
  const b = c.body
  if (!b.grounded) return false
  const s = b.surface!
  const tx = Math.max(s.left, Math.min(s.right, x))
  if (Math.abs(tx - b.x) < 1) return Math.abs(tx - x) < 2
  const ph = c.cfg.physics
  b.walk(tx, (run ? ph.runSpeed : ph.walkSpeed) * c.u)
  c.anim.play(run ? 'run' : 'walk')
  while (!b.arrived) {
    if (!b.grounded) return false
    yield
  }
  return Math.abs(tx - x) < 2
}

export function* landAnim(c: PetCtx): Co {
  const l = c.landing
  c.landing = null
  if (l?.kind === 'ledge') yield* once(c, 'climb')
  else if ((l?.height ?? 0) > c.u * 3.5) yield* once(c, 'landHard')
  else yield* once(c, 'land')
}

export function* recover(c: PetCtx): Co {
  while (!c.body.grounded) {
    c.anim.play('fall')
    yield
  }
  yield* landAnim(c)
}

export function* jumpTo(c: PetCtx, step: Step): Co<boolean> {
  const b = c.body
  b.face(step.land - b.x)
  yield* once(c, 'crouch')
  if (!b.grounded) return false
  const t = c.world.byId(step.to.id)
  if (!t) return false
  const landX = Math.max(t.left, Math.min(t.right, step.land + (t.ex - step.to.ex)))
  const dx = landX - b.x
  const dy = t.top - b.y
  const g = c.cfg.physics.gravity * c.u
  const clear = c.u * (0.3 + Math.min(0.7, Math.abs(dx) / (c.u * 7)))
  let { vx, vy } = ballistic(dx, dy, g, clear)
  if (Math.random() < c.cfg.behavior.clumsiness) {
    vx *= 0.86
    vy *= 0.92
  }
  b.launch(vx, vy, t)
  while (!b.grounded) {
    c.anim.play(b.vy < 0 ? 'jumpUp' : 'jumpDown')
    yield
  }
  yield* landAnim(c)
  const s = b.surface
  return !!s && (s.id === t.id || (s.el !== null && s.el === t.el))
}

export function* followPlan(c: PetCtx, steps: Step[]): Co<boolean> {
  for (const st of steps) {
    const from = c.body.surface
    if (!from) return false
    const takeoff = st.takeoff + (from.el === st.from.el ? from.ex - st.from.ex : 0)
    const far = Math.abs(takeoff - c.body.x) > c.u * 4
    if (!(yield* walkTo(c, takeoff, far))) {
      if (!c.body.grounded) return false
    }
    if (!(yield* jumpTo(c, st))) return false
  }
  return true
}

export function* goTo(c: PetCtx, targetId: string, x: number | null, run = false): Co<boolean> {
  for (let attempt = 0; attempt < 3; attempt++) {
    if (!c.body.grounded) yield* recover(c)
    const from = c.body.surface
    if (!from) return false
    if (from.id !== targetId) {
      const steps = planPath(c.world.surfaces, from.id, c.body.x, targetId, caps(c))
      if (!steps) return false
      if (!(yield* followPlan(c, steps))) continue
    }
    const here = c.body.surface
    if (!here || here.id !== targetId) {
      if (here && c.world.byId(targetId)?.el === here.el) return true
      continue
    }
    if (x !== null) yield* walkTo(c, x, run)
    return true
  }
  return false
}
