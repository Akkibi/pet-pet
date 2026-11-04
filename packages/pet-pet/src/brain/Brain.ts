import type { ReactionName } from '../types'
import { goTo, recover, type Co } from './co'
import type { PetCtx } from './ctx'
import { afterRagdoll, eat, petted, purr, react, squish, wakeUp, watch, type Aftermath, type ReactOptions } from './social'
import { explore, extra, follow, idle, sleep, startle, wander, weighted } from './tasks'

export const PRIO = { auto: 0, follow: 1, page: 2, user: 3, fall: 4 } as const

interface Job {
  name: string
  make: () => Co<unknown>
  prio: number
  air: boolean
  done?: (ok: boolean) => void
}

interface Running extends Job {
  co: Co<unknown>
}

export class Brain {
  cur: Running | null = null
  state = { sleeping: false, fatigue: 0 }
  stroke = 0
  squishing = false
  private c: PetCtx
  private queue: Job[] = []
  private cool = new Map<string, number>()
  private visited: string[] = []
  private lastTyping = 0
  private paused = false

  constructor(c: PetCtx) {
    this.c = c
  }

  get task() {
    return this.cur?.name ?? 'none'
  }

  get sleeping() {
    return this.state.sleeping
  }

  pause(on: boolean) {
    this.paused = on
    if (on) this.stop()
  }

  run(job: Job): boolean {
    if (this.cur && this.cur.prio > job.prio) {
      job.done?.(false)
      return false
    }
    if (!this.c.body.grounded && !job.air) {
      this.queue = this.queue.filter((q) => q.name !== job.name)
      this.queue.push(job)
      return true
    }
    this.start(job)
    return true
  }

  stop() {
    const cur = this.cur
    this.cur = null
    if (cur) {
      cur.co.return(undefined)
      cur.done?.(false)
    }
    this.c.body.stop()
  }

  private start(job: Job) {
    this.stop()
    this.cur = { ...job, co: job.make() }
  }

  private ready(name: string, s: number) {
    const t = this.cool.get(name) ?? 0
    if (this.c.now < t) return false
    this.cool.set(name, this.c.now + s)
    return true
  }

  update(dt: number) {
    if (this.paused) return
    const c = this.c
    this.state.fatigue = Math.min(1, this.state.fatigue + (dt * c.cfg.behavior.sleepiness) / 150)
    this.stroke = Math.max(0, this.stroke - dt * 1.4)
    this.sense()
    if (!this.cur) {
      const i = this.queue.findIndex((q) => q.air || c.body.grounded)
      if (i >= 0) this.start(this.queue.splice(i, 1)[0])
      else if (c.body.grounded) this.start(this.choose())
      else this.start({ name: 'fall', make: () => recover(c), prio: PRIO.fall, air: true })
    }
    const cur = this.cur!
    const r = cur.co.next(dt)
    if (r.done && this.cur === cur) {
      this.cur = null
      cur.done?.(r.value !== false)
    }
  }

  private sense() {
    const c = this.c
    const b = c.body
    const prio = this.cur?.prio ?? -1
    if (!b.grounded && !this.cur?.air) {
      this.start({ name: 'fall', make: () => recover(c), prio: PRIO.fall, air: true })
      return
    }
    if (!b.grounded || this.squishing) return
    const beh = c.cfg.behavior
    const cur = c.cursor
    const dist = Math.hypot(cur.x - b.x, cur.y - (b.y - c.u * 0.4))
    if (beh.startle && cur.speed > c.u * 40 && dist < c.u * 1.8 && prio < PRIO.user && this.ready('startle', 4)) {
      this.run({ name: 'startle', make: () => startle(c), prio: PRIO.user, air: false })
      return
    }
    if (this.state.sleeping) return
    if (beh.stroke && this.stroke > 1 && prio < PRIO.page) {
      this.run({ name: 'purr', make: () => purr(c, () => this.stroke), prio: PRIO.page, air: false })
      return
    }
    const seed = c.seeds.find((s) => !s.claimed && !s.eaten)
    if (seed && prio < PRIO.page && this.ready('eat', 1)) {
      this.run({ name: 'eat', make: () => eat(c, seed), prio: PRIO.page, air: false })
      return
    }
    const recent = performance.now() - cur.lastMove < 1200
    if (beh.followCursor && recent && dist < beh.followRadius && prio < PRIO.follow && this.ready('follow', 1.5)) {
      this.run({ name: 'follow', make: () => follow(c), prio: PRIO.follow, air: false })
    }
  }

  private choose(): Job {
    const c = this.c
    const a = c.cfg.behavior.activity
    const f = this.state.fatigue
    const pick = weighted<string>([
      ['idle', 2.2 * (1.3 - a)],
      ['wander', 2.5 * a],
      ['explore', 4 * a * c.cfg.behavior.explore],
      ['extra', 2],
      ['sleep', f > 0.45 ? f * f * 10 : 0],
    ])
    const auto = (name: string, make: () => Co<unknown>): Job => ({ name, make, prio: PRIO.auto, air: false })
    switch (pick) {
      case 'wander':
        return auto('wander', () => wander(c))
      case 'explore':
        return auto('explore', () => explore(c, this.visited))
      case 'extra':
        return auto('extra', () => extra(c))
      case 'sleep':
        return auto('sleep', () => sleep(c, this.state))
      default:
        return auto('idle', () => idle(c, (1.2 + Math.random() * 3) * (1.6 - a)))
    }
  }

  onClick(count: number) {
    const c = this.c
    if (!c.cfg.behavior.petting || !c.body.grounded) return
    if (this.state.sleeping) {
      this.run({ name: 'wake', make: () => wakeUp(c), prio: PRIO.user, air: false })
      return
    }
    this.run({ name: 'pet', make: () => petted(c, count), prio: PRIO.user, air: false })
  }

  onLongPress(held: () => boolean) {
    const c = this.c
    if (!c.cfg.behavior.petting || !c.body.grounded) return
    this.squishing = true
    this.run({
      name: 'squish',
      make: () => squish(c, held),
      prio: PRIO.user,
      air: false,
      done: () => {
        this.squishing = false
      },
    })
  }

  onStroke(amount: number) {
    this.stroke = Math.min(3, this.stroke + amount / (this.c.u * 5))
  }

  onTyping(el: Element) {
    this.lastTyping = performance.now()
    const c = this.c
    if (!c.cfg.behavior.watchTyping || this.state.sleeping) return
    if ((this.cur?.prio ?? -1) >= PRIO.page || !this.ready('watch', 8)) return
    this.run({ name: 'watch', make: () => watch(c, el, () => performance.now() - this.lastTyping < 2500), prio: PRIO.page, air: false })
  }

  react(name: ReactionName, o: ReactOptions, done?: (ok: boolean) => void) {
    this.run({ name: `react:${name}`, make: () => react(this.c, name, o), prio: PRIO.page, air: false, done })
  }

  goTo(targetId: string, x: number | null, done?: (ok: boolean) => void) {
    this.run({ name: 'goto', make: () => goTo(this.c, targetId, x, true), prio: PRIO.page, air: false, done })
  }

  afterRagdoll(a: Aftermath) {
    this.start({ name: 'recover', make: () => afterRagdoll(this.c, a), prio: PRIO.user, air: true })
  }

  sleepNow() {
    this.run({ name: 'sleep', make: () => sleep(this.c, this.state), prio: PRIO.page, air: false })
  }

  wake() {
    if (this.state.sleeping) this.run({ name: 'wake', make: () => wakeUp(this.c), prio: PRIO.user, air: false })
  }
}
