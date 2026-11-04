import type { AnimName } from '../render/anims'
import type { Surface } from '../types'
import { planPath } from '../world/planner'
import { caps, goTo, hold, once, wait, walkTo, type Co } from './co'
import type { PetCtx } from './ctx'

export const weighted = <T>(items: [T, number][]): T => {
  const total = items.reduce((a, [, w]) => a + Math.max(0, w), 0)
  let r = Math.random() * total
  for (const [v, w] of items) {
    r -= Math.max(0, w)
    if (r <= 0) return v
  }
  return items[items.length - 1][0]
}

export function* idle(c: PetCtx, s: number): Co {
  c.body.stop()
  yield* hold(c, 'idle', s)
}

export function* wander(c: PetCtx): Co {
  const s = c.body.surface
  if (!s) return
  const dir = Math.random() < 0.5 ? -1 : 1
  const dist = c.u * (1.2 + Math.random() * 4)
  let x = c.body.x + dir * dist
  if (x < s.left || x > s.right) x = c.body.x - dir * dist
  yield* walkTo(c, x, Math.random() < 0.2)
}

export const pickSurface = (c: PetCtx, avoid: string[]): Surface | null => {
  const b = c.body
  const here = b.surface
  if (!here) return null
  const items: [Surface, number][] = []
  for (const s of c.world.surfaces) {
    if (s.id === here.id || (here.el && s.el === here.el) || avoid.includes(s.id)) continue
    if (s.right - s.left < c.u * 0.8) continue
    const cx = (s.left + s.right) / 2
    const d = Math.hypot(cx - b.x, s.top - b.y)
    const w = (1 / (1 + d / (c.u * 6))) * (s.id === 'floor' ? 0.35 : 1) * (s.top < b.y ? 1.3 : 1)
    items.push([s, w * (0.5 + Math.random())])
  }
  return items.length ? weighted(items) : null
}

export function* explore(c: PetCtx, visited: string[]): Co {
  const avoid = visited.slice(-2)
  for (let i = 0; i < 5; i++) {
    const t = pickSurface(c, avoid)
    const from = c.body.surface
    if (!t || !from) break
    avoid.push(t.id)
    if (!planPath(c.world.surfaces, from.id, c.body.x, t.id, caps(c))) continue
    const x = t.left + Math.random() * (t.right - t.left)
    if (yield* goTo(c, t.id, x)) {
      visited.push(t.id)
      if (visited.length > 6) visited.shift()
      if (Math.random() < 0.45) yield* once(c, 'look')
    }
    return
  }
  yield* wander(c)
}

const EXTRAS: [AnimName, number][] = [
  ['groom', 3],
  ['stretch', 2],
  ['yawn', 1.5],
  ['look', 3],
  ['sniff', 2],
  ['sit', 2.5],
]

export function* extra(c: PetCtx): Co {
  c.body.stop()
  const name = weighted(EXTRAS)
  if (name === 'sit') yield* hold(c, 'sit', 2.5 + Math.random() * 3)
  else if (name === 'sniff') yield* hold(c, 'sniff', 1.2 + Math.random())
  else yield* once(c, name)
}

export function* sleep(c: PetCtx, state: { sleeping: boolean; fatigue: number }): Co {
  c.body.stop()
  state.sleeping = true
  c.emit('sleep', {})
  try {
    yield* once(c, 'fallAsleep')
    c.anim.play('sleep')
    const dur = 20 + Math.random() * 30
    let t = 0
    let z = 1
    while (t < dur) {
      const dt = yield
      t += dt
      z += dt
      if (z > 1.5) {
        z = 0
        c.spawn('zzz', 0.35, -0.75)
      }
    }
    state.fatigue = 0
    yield* once(c, 'wake')
  } finally {
    state.sleeping = false
    c.emit('wake', {})
  }
}

export function* follow(c: PetCtx): Co {
  let still = 0
  const ph = c.cfg.physics
  for (;;) {
    const dt = yield
    const cur = c.cursor
    const b = c.body
    if (!b.grounded) return
    const s = b.surface!
    const d = Math.hypot(cur.x - b.x, cur.y - (b.y - c.u * 0.4))
    if (d > c.cfg.behavior.followRadius * 1.3 || performance.now() - cur.lastMove > 5000) return
    const dx = cur.x - b.x
    const want = Math.max(s.left, Math.min(s.right, cur.x - Math.sign(dx) * c.u * 0.75))
    if (Math.abs(want - b.x) > c.u * 0.45 && Math.abs(dx) > c.u * 0.6) {
      const run = Math.abs(want - b.x) > c.u * 3
      b.walk(want, (run ? ph.runSpeed : ph.walkSpeed * 1.5) * c.u)
      c.anim.play(run ? 'run' : 'walk')
      still = 0
      continue
    }
    b.stop()
    if (Math.abs(dx) > c.u * 0.3) b.face(dx)
    const was = c.anim.name
    const above = cur.y < b.y - c.u * (was === 'curious' ? 0.9 : 1.1)
    const below = cur.y > b.y + c.u * (was === 'curiousDown' ? 0 : 0.15)
    const near = d < c.u * (was === 'sniff' ? 1.1 : 0.9)
    c.anim.play(near ? 'sniff' : above ? 'curious' : below ? 'curiousDown' : 'idle')
    still += dt
    if (still > 1.4 && above) {
      still = 0
      const t = c.world.below(cur.x, cur.y)
      if (t && t.id !== s.id && t.top < b.y - c.u * 0.5) yield* goTo(c, t.id, cur.x)
    }
  }
}

export function* startle(c: PetCtx): Co {
  const b = c.body
  b.stop()
  b.face(c.cursor.x - b.x)
  c.spawn('bang', 0.3, -1)
  yield* once(c, 'startle')
  yield* walkTo(c, b.x - Math.sign(c.cursor.x - b.x || 1) * c.u * 3, true)
  yield* wait(0.2)
}
