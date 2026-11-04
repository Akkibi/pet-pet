import type { FxKind } from '../fx/icons'
import type { Seed } from '../fx/Seed'
import { ANIMS } from '../render/anims'
import type { ReactionName } from '../types'
import { goTo, hold, once, recover, wait, walkTo, type Co } from './co'
import type { PetCtx } from './ctx'

type Cue = [at: number, kind: FxKind, dx: number, dy: number]

const CUES: Record<ReactionName, Cue[]> = {
  approve: [[0.45, 'check', 0.15, -1.05], [0.5, 'sparkle', 0.55, -0.7]],
  cancel: [[0.05, 'cross', 0.15, -1.05]],
  delete: [[0.3, 'poof', 0.85, -0.3]],
  error: [[0.05, 'sweat', 0.05, -0.85], [0.12, 'cross', 0.15, -1.1]],
  success: [[0.42, 'confetti', 0, -1.3], [0.45, 'star', 0.1, -1.4]],
  warning: [[0.1, 'bang', 0.15, -1.1]],
  thinking: [[0.02, 'dots', 0.35, -1.05]],
  love: [[0.15, 'heart', 0.2, -0.9], [0.35, 'heart', 0.45, -0.8], [0.55, 'heart', -0.05, -0.85]],
  wave: [[0.25, 'sparkle', 0.6, -0.95]],
  surprised: [[0.05, 'bang', 0.15, -1.1]],
  confused: [[0.15, 'question', 0.15, -1.1]],
  sad: [[0.2, 'sweat', 0.1, -0.8]],
}

export interface ReactOptions {
  say?: string
  hold?: boolean
  duration?: number
}

export function* react(c: PetCtx, name: ReactionName, o: ReactOptions): Co {
  c.body.stop()
  if (o.say) c.say(o.say, Math.max(1800, o.say.length * 70))
  const cues = CUES[name]
  c.anim.play(name, true)
  if (ANIMS[name].loop) {
    const end = o.hold ? Infinity : (o.duration ?? 2.6)
    let t = 0
    let k = -1
    while (t < end) {
      if (c.anim.loops !== k) {
        k = c.anim.loops
        for (const [, kind, dx, dy] of cues) c.spawn(kind, dx, dy)
      }
      t += yield
    }
  } else {
    const fired = new Set<number>()
    while (!c.anim.done) {
      const p = c.anim.progress
      cues.forEach(([at, kind, dx, dy], i) => {
        if (p >= at && !fired.has(i)) {
          fired.add(i)
          c.spawn(kind, dx, dy)
        }
      })
      yield
    }
  }
  c.emit('react', { name })
}

export function* petted(c: PetCtx, count: number): Co {
  c.body.stop()
  c.emit('pet', { count })
  c.spawn('heart', 0.25, -0.95)
  if (count >= 4) {
    yield* once(c, 'roll')
    for (const dx of [-0.1, 0.25, 0.6]) c.spawn('heart', dx, -0.9)
  }
  yield* once(c, 'happy')
}

export function* wakeUp(c: PetCtx): Co {
  c.body.stop()
  yield* once(c, 'wake')
  c.spawn('heart', 0.25, -0.95)
  yield* once(c, 'happy')
}

export function* squish(c: PetCtx, held: () => boolean): Co {
  c.body.stop()
  c.anim.play('squish', true)
  while (held()) yield
  yield* once(c, 'unsquish')
  c.spawn('heart', 0.25, -0.95)
  yield* once(c, 'happy')
}

export function* purr(c: PetCtx, level: () => number): Co {
  c.body.stop()
  c.anim.play('purr', true)
  let h = 0
  while (level() > 0.2) {
    h += yield
    if (h > 0.75) {
      h = 0
      c.spawn('heart', 0.1 + Math.random() * 0.4, -0.85)
    }
  }
  yield* once(c, 'happy')
}

export function* eat(c: PetCtx, seed: Seed): Co {
  seed.claimed = true
  try {
    let t = 0
    while (!seed.surface && t < 3) t += yield
    if (!seed.surface || seed.eaten) return
    const side = Math.sign(seed.x - c.body.x) || 1
    const ok = yield* goTo(c, seed.surface.id, seed.x - side * c.u * 0.62, Math.abs(seed.x - c.body.x) > c.u * 4)
    if (!ok || seed.eaten || !seed.surface) return
    if (Math.abs(seed.x - c.body.x) > c.u * 1.2) {
      if (!(yield* walkTo(c, seed.x - side * c.u * 0.62))) return
    }
    c.body.face(seed.x - c.body.x)
    c.anim.play('eat', true)
    while (!c.anim.done) {
      if (c.anim.progress > 0.12 && !seed.eaten) {
        seed.remove(true)
        c.emit('eat', { x: seed.x, y: seed.y })
      }
      yield
    }
    c.spawn('heart', 0.25, -0.95)
    yield* once(c, 'happy')
  } finally {
    seed.claimed = false
  }
}

export function* watch(c: PetCtx, el: Element, typing: () => boolean): Co {
  const r = el.getBoundingClientRect()
  const cx = (r.left + r.right) / 2
  const s = c.world.surfaceFor(el)
  const reached = s ? yield* goTo(c, s.id, Math.max(s.left, Math.min(s.right, cx - c.u * 0.6))) : false
  if (!reached) yield* walkTo(c, cx - c.u * 0.8)
  c.body.face(cx - c.body.x)
  c.anim.play(reached ? 'curiousDown' : 'curious', true)
  yield* wait(1.2)
  while (typing()) yield
  yield* hold(c, 'idle', 0.6)
}

export interface Aftermath {
  back: boolean
  dizzy: boolean
  tilted: boolean
}

export function* afterRagdoll(c: PetCtx, a: Aftermath): Co {
  if (!c.body.grounded) yield* recover(c)
  if (a.dizzy) {
    c.anim.play(a.back ? 'dizzyBack' : 'dizzy', true)
    let t = 0
    let k = 0
    while (t < 2) {
      const dt = yield
      t += dt
      k += dt
      if (k > 0.5) {
        k = 0
        c.spawn('star', (Math.random() - 0.5) * 0.6, a.back ? -0.6 : -1)
      }
    }
  }
  if (a.back) yield* once(c, 'getupBack')
  else if (a.tilted) yield* once(c, 'getup')
  else yield* once(c, 'land')
}
