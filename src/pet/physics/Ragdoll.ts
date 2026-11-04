import type { Physics } from '../config'
import type { Facing, Rect, Surface } from '../types'

export interface Particle {
  x: number
  y: number
  px: number
  py: number
  r: number
  im: number
}

export const LEG_REST = [
  { x: -0.3, y: 0.36, attach: 0 },
  { x: 0.31, y: 0.36, attach: 1 },
  { x: -0.37, y: 0.38, attach: 0 },
  { x: 0.2, y: 0.38, attach: 1 },
] as const

const HALF = 0.3
const STEP = 1 / 240
export const BODY_CY = 0.38

export interface RagdollWorld {
  bounds: Rect
  surfaces: Surface[]
}

export interface Impact {
  speed: number
  x: number
  y: number
}

export class Ragdoll {
  p: Particle[]
  facing: Facing
  belly = 1
  grab: { t: number; n: number; x: number; y: number } | null = null
  squash = 0
  restTime = 0
  time = 0
  private u: number
  private acc = 0
  private impactCd = 0

  constructor(u: number, cx: number, cy: number, vx: number, vy: number, facing: Facing) {
    this.u = u
    this.facing = facing
    const mk = (x: number, y: number, r: number, im: number): Particle => ({
      x,
      y,
      px: x - vx * STEP,
      py: y - vy * STEP,
      r,
      im,
    })
    this.p = [
      mk(cx - facing * HALF * u, cy, 0.27 * u, 1 / 3),
      mk(cx + facing * HALF * u, cy, 0.27 * u, 1 / 3),
      ...LEG_REST.map((l) => mk(cx + facing * l.x * u, cy + l.y * u, 0.06 * u, 1 / 0.4)),
    ]
  }

  get center() {
    return { x: (this.p[0].x + this.p[1].x) / 2, y: (this.p[0].y + this.p[1].y) / 2 }
  }

  get axis() {
    const dx = this.p[1].x - this.p[0].x
    const dy = this.p[1].y - this.p[0].y
    const l = Math.hypot(dx, dy) || 1
    return { x: dx / l, y: dy / l }
  }

  get normal() {
    const a = this.axis
    return { x: -a.y * this.facing, y: a.x * this.facing }
  }

  get angle() {
    const a = this.axis
    return Math.atan2(a.y, a.x)
  }

  get speed() {
    let m = 0
    for (const q of this.p) m = Math.max(m, Math.hypot(q.x - q.px, q.y - q.py) / STEP)
    return m
  }

  toLocal(x: number, y: number) {
    const c = this.center
    const a = this.axis
    const n = this.normal
    const dx = x - c.x
    const dy = y - c.y
    return { x: (dx * a.x + dy * a.y) / this.u, y: (dx * n.x + dy * n.y) / this.u }
  }

  legTarget(i: number) {
    const c = this.center
    const a = this.axis
    const n = this.normal
    const l = LEG_REST[i]
    const paddle = this.grab ? Math.sin(this.time * 14 + i * 1.7) * 0.07 : 0
    const ly = (l.y + paddle) * this.belly
    const lx = l.x + (this.grab ? Math.cos(this.time * 14 + i * 1.7) * 0.04 : 0)
    return { x: c.x + (a.x * lx + n.x * ly) * this.u, y: c.y + (a.y * lx + n.y * ly) * this.u }
  }

  startGrab(x: number, y: number) {
    const l = this.toLocal(x, y)
    this.grab = { t: Math.max(-0.5, Math.min(0.5, l.x)), n: Math.max(-0.3, Math.min(0.3, l.y)), x, y }
    this.belly = -1
  }

  moveGrab(x: number, y: number) {
    if (this.grab) {
      this.grab.x = x
      this.grab.y = y
    }
  }

  release() {
    this.grab = null
  }

  step(dt: number, w: RagdollWorld, ph: Physics, onImpact: (i: Impact) => void) {
    this.acc = Math.min(this.acc + dt, STEP * 10)
    while (this.acc >= STEP) {
      this.acc -= STEP
      this.sub(w, ph, onImpact)
    }
    this.squash = Math.max(0, this.squash - dt * 4)
    this.impactCd = Math.max(0, this.impactCd - dt)
    this.restTime = this.grab || this.speed > this.u * 0.6 ? 0 : this.restTime + dt
  }

  private sub(w: RagdollWorld, ph: Physics, onImpact: (i: Impact) => void) {
    const u = this.u
    const g = ph.gravity * u
    this.time += STEP
    const damp = 1 - Math.min(0.5, ph.airDrag * STEP * 4)
    for (const q of this.p) {
      const vx = (q.x - q.px) * damp
      const vy = (q.y - q.py) * damp
      q.px = q.x
      q.py = q.y
      q.x += vx
      q.y += vy + g * STEP * STEP
    }
    if (this.grab) this.pullGrab(ph)
    const k = Math.min(0.6, ph.limbStiffness * 0.25)
    for (let i = 0; i < 4; i++) {
      const leg = this.p[i + 2]
      const t = this.legTarget(i)
      const dx = (t.x - leg.x) * k
      const dy = (t.y - leg.y) * k
      const body = this.p[LEG_REST[i].attach]
      const wl = leg.im / (leg.im + body.im)
      leg.x += dx * wl
      leg.y += dy * wl
      body.x -= dx * (1 - wl)
      body.y -= dy * (1 - wl)
    }
    for (let it = 0; it < 3; it++) {
      this.link(0, 1, HALF * 2 * u, HALF * 2 * u)
      for (let i = 0; i < 4; i++) {
        const l = LEG_REST[i]
        const rest = Math.hypot((l.x - (l.attach ? HALF : -HALF)) * u, l.y * u)
        this.link(l.attach, i + 2, rest * 0.75, rest * 1.25)
      }
    }
    for (let i = 0; i < this.p.length; i++) this.collide(this.p[i], i < 2, w, ph, onImpact)
  }

  private pullGrab(ph: Physics) {
    const g = this.grab!
    const a = this.axis
    const n = this.normal
    const c = this.center
    const gx = c.x + (a.x * g.t + n.x * g.n) * this.u
    const gy = c.y + (a.y * g.t + n.y * g.n) * this.u
    const s = Math.min(0.5, 0.05 + ph.dragStiffness * 0.3)
    const dx = (g.x - gx) * s
    const dy = (g.y - gy) * s
    const wf = Math.max(0, Math.min(1, 0.5 + g.t / (HALF * 2)))
    const [r, f] = this.p
    r.x += dx * (1 - wf) * 1.6
    r.y += dy * (1 - wf) * 1.6
    f.x += dx * wf * 1.6
    f.y += dy * wf * 1.6
    if (Math.abs(g.t) < 0.25) {
      const my = (r.y + f.y) / 2
      r.y += (my - r.y) * 0.03
      f.y += (my - f.y) * 0.03
    }
  }

  private link(i: number, j: number, min: number, max: number) {
    const a = this.p[i]
    const b = this.p[j]
    const dx = b.x - a.x
    const dy = b.y - a.y
    const d = Math.hypot(dx, dy) || 0.0001
    const target = d < min ? min : d > max ? max : d
    if (target === d) return
    const diff = (d - target) / d / (a.im + b.im)
    a.x += dx * diff * a.im
    a.y += dy * diff * a.im
    b.x -= dx * diff * b.im
    b.y -= dy * diff * b.im
  }

  private collide(q: Particle, heavy: boolean, w: RagdollWorld, ph: Physics, onImpact: (i: Impact) => void) {
    const b = w.bounds
    const e = ph.bounce
    const fr = ph.friction
    let hit = 0
    let hx = q.x
    let hy = q.y
    const vx = q.x - q.px
    const vy = q.y - q.py
    if (q.x - q.r < b.left && vx < 0) {
      q.x = b.left + q.r
      q.px = q.x + vx * e
      q.py = q.y - vy * (1 - fr)
      hit = Math.abs(vx)
      hx = b.left
    } else if (q.x + q.r > b.right && vx > 0) {
      q.x = b.right - q.r
      q.px = q.x + vx * e
      q.py = q.y - vy * (1 - fr)
      hit = Math.abs(vx)
      hx = b.right
    }
    if (q.y - q.r < b.top && vy < 0) {
      q.y = b.top + q.r
      q.py = q.y + vy * e
      hit = Math.max(hit, Math.abs(vy))
      hy = b.top
    } else if (vy >= 0) {
      let top = q.y + q.r > b.bottom ? b.bottom : Infinity
      for (const s of w.surfaces) {
        if (s.id === 'floor' || q.x < s.left - q.r * 0.5 || q.x > s.right + q.r * 0.5) continue
        if (q.py + q.r <= s.top + 1 && q.y + q.r > s.top && s.top < top) top = s.top
      }
      if (top !== Infinity) {
        q.y = top - q.r
        q.py = q.y + vy * e
        q.px = q.x - vx * (1 - fr)
        if (vy > Math.abs(vx) * 0.2 || hit) {
          hit = Math.max(hit, vy)
          hy = top
        }
      }
    }
    if (heavy && hit > 0) {
      const speed = hit / STEP
      if (speed > this.u * 7 && this.impactCd <= 0) {
        this.impactCd = 0.12
        this.squash = Math.min(1, speed / (this.u * 30))
        onImpact({ speed: speed / this.u, x: hx, y: hy })
      }
    }
  }
}
