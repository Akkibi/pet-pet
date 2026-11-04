import type { Physics } from '../config'
import type { Facing, Surface } from '../types'
import type { World } from '../world/World'

export interface BodyEvents {
  land: (s: Surface, height: number, vy: number) => void
  ledge: (s: Surface) => void
  leave: () => void
}

export class Body {
  x = 0
  y = 0
  vx = 0
  vy = 0
  facing: Facing = 1
  surface: Surface | null = null
  jumping = false
  target: Surface | null = null
  walkTarget: number | null = null
  speed = 0
  apexY = 0
  airTime = 0
  private ev: BodyEvents

  constructor(ev: BodyEvents) {
    this.ev = ev
  }

  get grounded() {
    return this.surface !== null
  }

  get arrived() {
    return this.walkTarget === null
  }

  place(x: number, y: number, s: Surface | null) {
    this.x = x
    this.y = y
    this.vx = 0
    this.vy = 0
    this.surface = s
    this.jumping = false
    this.target = null
    this.walkTarget = null
    this.apexY = y
  }

  walk(x: number, speed: number) {
    this.walkTarget = x
    this.speed = speed
    if (Math.abs(x - this.x) > 0.5) this.facing = x > this.x ? 1 : -1
  }

  stop() {
    this.walkTarget = null
  }

  face(dir: number) {
    if (dir !== 0) this.facing = dir > 0 ? 1 : -1
  }

  launch(vx: number, vy: number, target: Surface | null) {
    this.surface = null
    this.jumping = true
    this.target = target
    this.walkTarget = null
    this.vx = vx
    this.vy = vy
    this.apexY = this.y
    this.airTime = 0
    if (Math.abs(vx) > 1) this.facing = vx > 0 ? 1 : -1
  }

  drop(vx = 0, vy = 0) {
    this.surface = null
    this.jumping = false
    this.target = null
    this.walkTarget = null
    this.vx = vx
    this.vy = vy
    this.apexY = this.y
    this.airTime = 0
  }

  update(dt: number, world: World, u: number, ph: Physics) {
    if (this.surface) this.ground(dt, world, u)
    else this.air(dt, world, u, ph)
  }

  private ground(dt: number, world: World, u: number) {
    const prev = this.surface!
    const s = world.refresh(prev, this.x)
    if (!s) {
      this.drop()
      this.ev.leave()
      return
    }
    if (s.el && s.el === prev.el) this.x += s.ex - prev.ex
    this.surface = s
    this.y = s.top
    if (this.walkTarget !== null) {
      const dx = this.walkTarget - this.x
      const step = this.speed * dt
      if (Math.abs(dx) <= step) {
        this.x = this.walkTarget
        this.walkTarget = null
      } else {
        this.x += Math.sign(dx) * step
        this.facing = dx > 0 ? 1 : -1
      }
    }
    const b = world.bounds
    this.x = Math.max(b.left + u * 0.5, Math.min(b.right - u * 0.5, this.x))
    if (this.x < s.left - u * 0.35 || this.x > s.right + u * 0.35) {
      this.drop(this.walkTarget !== null ? this.facing * this.speed : 0)
      this.ev.leave()
    } else if (this.x < s.left || this.x > s.right) {
      this.x = Math.max(s.left, Math.min(s.right, this.x))
      if (this.walkTarget !== null && (this.walkTarget < s.left || this.walkTarget > s.right)) this.walkTarget = null
    }
  }

  private air(dt: number, world: World, u: number, ph: Physics) {
    const g = ph.gravity * u
    const prevY = this.y
    this.airTime += dt
    this.vy = Math.min(this.vy + g * dt, u * 30)
    this.vx *= 1 - Math.min(1, ph.airDrag * dt)
    this.x += this.vx * dt
    this.y += this.vy * dt
    this.apexY = Math.min(this.apexY, this.y)
    const b = world.bounds
    if (this.x < b.left + u * 0.5) {
      this.x = b.left + u * 0.5
      this.vx = Math.abs(this.vx) * 0.3
    } else if (this.x > b.right - u * 0.5) {
      this.x = b.right - u * 0.5
      this.vx = -Math.abs(this.vx) * 0.3
    }
    if (this.y - u * 0.8 < b.top) {
      this.y = b.top + u * 0.8
      this.vy = Math.max(this.vy, 0)
    }
    if (this.vy >= 0) {
      const s = world.landing(this.x, prevY, this.y)
      if (s) return this.land(s)
      if (this.y >= b.bottom) return this.land(world.floor)
    }
    const t = this.target
    if (t && this.vy > -u * 3) {
      const fresh = world.byId(t.id) ?? t
      const straddle = this.y > fresh.top + 2 && this.y - u * 0.6 <= fresh.top
      const near = this.x >= fresh.left - u * 0.45 && this.x <= fresh.right + u * 0.45
      if (straddle && near) {
        this.place(Math.max(fresh.left + u * 0.1, Math.min(fresh.right - u * 0.1, this.x)), fresh.top, fresh)
        this.ev.ledge(fresh)
      }
    }
  }

  private land(s: Surface) {
    const height = s.top - this.apexY
    const vy = this.vy
    this.place(this.x, s.top, s)
    this.ev.land(s, height, vy)
  }
}
