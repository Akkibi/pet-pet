import { Brain } from './brain/Brain'
import { headPoint, type PetCtx } from './brain/ctx'
import type { ReactOptions } from './brain/social'
import { DEFAULT_CONFIG, mergeConfig, type ConfigPatch, type PetConfig, type PetOptions } from './config'
import { DebugOverlay } from './debug'
import { Emitter, resolveReaction, type Listener } from './events'
import { bindDom } from './dom'
import { Bubble } from './fx/Bubble'
import { Fx } from './fx/Fx'
import { Seed } from './fx/Seed'
import { PointerInput } from './input/PointerInput'
import { Body } from './physics/Body'
import { BODY_CY, Ragdoll, type Impact } from './physics/Ragdoll'
import { AnimPlayer } from './render/AnimPlayer'
import { drawRagdoll, isOnBack } from './render/ragdoll'
import { SpriteBank } from './render/strips'
import { View } from './render/View'
import type { PetEventName, ReactionAlias, ReactionName } from './types'
import { resolveSize } from './world/bounds'
import { World } from './world/World'

export interface PetState {
  mode: 'anim' | 'ragdoll'
  task: string
  anim: string
  sleeping: boolean
  x: number
  y: number
  unit: number
}

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))

export class Pet {
  cfg: PetConfig
  private u: number
  private view: View
  private bank: SpriteBank
  private world: World
  private body: Body
  private anim = new AnimPlayer()
  private brain: Brain
  private fx: Fx
  private bubble: Bubble
  private input: PointerInput
  private ctx: PetCtx
  private rag: Ragdoll | null = null
  private seeds: Seed[] = []
  private debug: DebugOverlay | null = null
  private events = new Emitter()
  private unbind: () => void
  private raf = 0
  private last = 0
  private resizeAt = -1
  private maxImpact = 0
  private held = false
  private stateKey = ''
  private root: ParentNode

  constructor(o: PetOptions = {}) {
    this.cfg = mergeConfig(DEFAULT_CONFIG, o)
    this.root = o.root ?? document
    this.u = this.measureUnit()
    this.view = new View(this.cfg.zIndex)
    this.view.resize(this.u, this.dpr)
    this.bank = new SpriteBank(this.cfg.appearance, this.u, this.dpr)
    this.world = new World({
      container: o.container ?? null,
      root: this.root,
      layer: this.view.layer,
      platforms: () => this.cfg.platforms,
      unit: () => this.u,
    })
    this.fx = new Fx(this.view.layer, () => this.u)
    this.bubble = new Bubble(this.view.layer)
    this.body = new Body({
      land: (surface, height) => {
        this.ctx.landing = { kind: 'land', surface, height }
        this.emit('land', { surface, height })
      },
      ledge: (surface) => {
        this.ctx.landing = { kind: 'ledge', surface, height: 0 }
      },
      leave: () => {},
    })
    this.input = new PointerInput(this.view.hitbox, {
      press: () => {},
      click: (n) => !this.rag && this.brain.onClick(n),
      longPress: () => {
        if (this.rag) return
        this.held = true
        this.brain.onLongPress(() => this.held)
      },
      longRelease: () => {
        this.held = false
      },
      dragStart: (x, y) => this.grab(x, y),
      dragMove: (x, y) => this.rag?.moveGrab(x, y),
      dragEnd: () => this.release(),
      stroke: (a) => this.cfg.behavior.stroke && !this.rag && this.brain.onStroke(a),
    })
    this.ctx = {
      cfg: this.cfg,
      u: this.u,
      now: performance.now() / 1000,
      body: this.body,
      world: this.world,
      anim: this.anim,
      fx: this.fx,
      cursor: this.input.cursor,
      seeds: this.seeds,
      landing: null,
      emit: this.emit,
      say: (text, ms) => this.say(text, ms),
      spawn: (kind, dx = 0, dy = -1) => this.fx.spawn(kind, this.body.x + this.body.facing * dx * this.u, this.body.y + dy * this.u),
    }
    this.brain = new Brain(this.ctx)
    this.unbind = bindDom({
      container: o.container ?? null,
      ignore: () => this.cfg.platforms.ignore,
      react: (name, say) => void this.react(name as ReactionName, { say }),
      say: (text) => this.say(text),
      typing: (el) => !this.rag && this.brain.onTyping(el),
    })
    window.addEventListener('resize', this.onResize)
    const b = this.world.bounds
    this.body.place(o.spawn?.x ?? b.left + (b.right - b.left) * (0.25 + Math.random() * 0.5), o.spawn?.y ?? b.top + this.u, null)
    this.applyConfig()
    const idle = window.requestIdleCallback?.bind(window) ?? ((f: () => void) => window.setTimeout(f, 300))
    idle(() => this.bank.prewarm())
    this.raf = requestAnimationFrame(this.frame)
  }

  private get dpr() {
    return Math.min(this.cfg.maxDpr, window.devicePixelRatio || 1)
  }

  private measureUnit() {
    return Math.max(12, resolveSize(this.cfg.size, window.innerWidth, window.innerHeight))
  }

  private onResize = () => {
    this.resizeAt = performance.now()
  }

  private applySize() {
    this.resizeAt = -1
    this.u = this.ctx.u = this.measureUnit()
    this.view.resize(this.u, this.dpr)
    if (this.bank.configure(this.cfg.appearance, this.u, this.dpr)) this.view.invalidate()
    this.world.invalidate()
  }

  private frame = (t: number) => {
    this.raf = requestAnimationFrame(this.frame)
    const dt = this.last ? Math.min(0.05, (t - this.last) / 1000) : 1 / 60
    this.last = t
    this.ctx.now = t / 1000
    if (this.resizeAt >= 0 && t - this.resizeAt > 180 && !this.rag) this.applySize()
    this.world.update(dt)
    if (this.rag) this.stepRagdoll(dt)
    else {
      this.brain.update(dt)
      this.body.update(dt, this.world, this.u, this.cfg.physics)
      this.anim.update(dt)
    }
    this.updateSeeds(dt)
    this.render(t, dt)
  }

  private grab(x: number, y: number) {
    this.held = false
    this.maxImpact = 0
    if (!this.rag) {
      const b = this.body
      this.brain.pause(true)
      this.anim.snap()
      this.rag = new Ragdoll(this.u, b.x, b.y - BODY_CY * this.u, b.vx, b.vy, b.facing)
      b.place(b.x, b.y, null)
      this.view.setMode('ragdoll')
    }
    this.rag.startGrab(x, y)
    const lx = this.rag.toLocal(x, y).x
    this.emit('grab', { part: lx > 0.2 ? 'head' : lx < -0.2 ? 'bottom' : 'body' })
  }

  private release() {
    if (!this.rag) return
    this.rag.release()
    this.emit('throw', { speed: this.rag.speed / this.u })
  }

  private onImpact = (i: Impact) => {
    this.maxImpact = Math.max(this.maxImpact, i.speed)
    this.emit('impact', i)
    if (i.speed > 16) this.fx.spawn('bonk', i.x, i.y)
  }

  private stepRagdoll(dt: number) {
    const rag = this.rag!
    rag.step(dt, this.world, this.cfg.physics, this.onImpact)
    const c = rag.center
    this.body.x = c.x
    this.body.y = c.y + BODY_CY * this.u
    if (!rag.grab && rag.restTime > 0.35) this.settle(rag)
  }

  private settle(rag: Ragdoll) {
    const c = rag.center
    const s = this.world.below(c.x, c.y - this.u * 0.2) ?? this.world.floor
    const back = isOnBack(rag)
    const tilted = !back && Math.abs(rag.axis.y) > 0.45
    const dizzy = this.maxImpact > this.cfg.physics.dizzyImpact
    this.rag = null
    this.body.place(clamp(c.x, s.left + 1, s.right - 1), s.top, s)
    this.body.face(rag.axis.x || rag.facing)
    this.view.setMode('anim')
    this.brain.pause(false)
    this.brain.afterRagdoll({ back, dizzy, tilted })
  }

  private updateSeeds(dt: number) {
    const g = this.cfg.physics.gravity * this.u
    for (let i = this.seeds.length - 1; i >= 0; i--) {
      const s = this.seeds[i]
      if (s.eaten || (s.age > 45 && !s.claimed)) {
        if (!s.eaten) s.remove()
        this.seeds.splice(i, 1)
      } else s.update(dt, this.world, g)
    }
  }

  private placeShadow(x: number, y: number) {
    const s = !this.rag && this.body.grounded ? this.body.surface : this.world.below(x, y)
    const top = s?.top ?? this.world.bounds.bottom
    const k = clamp(1 - (top - y) / (this.u * 5), 0, 1)
    this.view.placeShadow(x, top, 0.45 + 0.55 * k, k)
  }

  private render(t: number, dt: number) {
    const v = this.view
    const u = this.u
    const b = this.body
    if (this.rag) {
      const rag = this.rag
      const c = rag.center
      v.place(c.x, c.y)
      v.drawLive((ctx) => drawRagdoll(ctx, rag, this.cfg.appearance, u))
      this.placeShadow(c.x, c.y + u * BODY_CY)
      this.bubble.update(t, c.x, c.y - u * 0.55, this.world.bounds)
    } else {
      v.setFacing(b.facing, dt)
      v.place(b.x, b.y)
      const strip = this.bank.get(this.anim.name)
      if (this.anim.blending) v.drawPose(this.anim.pose(), this.cfg.appearance)
      else v.drawStrip(strip, this.anim.frame)
      this.placeShadow(b.x, b.y)
      const h = headPoint(this.ctx)
      this.bubble.update(t, h.x, h.y, this.world.bounds)
    }
    const task = this.brain.task
    const anim = this.rag ? 'ragdoll' : this.anim.name
    const key = `${task}|${anim}`
    if (key !== this.stateKey) {
      this.stateKey = key
      this.emit('state', { task, anim })
    }
    if (this.cfg.debug.state) v.setLabel(`${task} · ${anim}`)
    this.debug?.draw(this.world.version, this.world.surfaces, this.world.bounds, b.surface?.id ?? null)
  }

  private applyConfig() {
    this.anim.blendScale = this.cfg.motion.blend
    this.view.turnTime = this.cfg.motion.turnTime
    const on = this.cfg.debug.surfaces
    if (on && !this.debug) this.debug = new DebugOverlay(this.view.layer)
    else if (!on && this.debug) {
      this.debug.destroy()
      this.debug = null
    }
    if (!this.cfg.debug.state) this.view.setLabel(null)
  }

  private emit = this.events.emit

  on<K extends PetEventName>(name: K, fn: Listener<K>) {
    return this.events.on(name, fn)
  }

  off<K extends PetEventName>(name: K, fn: Listener<K>) {
    this.events.off(name, fn)
  }

  react(name: ReactionName | ReactionAlias, o: ReactOptions = {}): Promise<boolean> {
    const n = resolveReaction(name)
    if (!n || this.rag) return Promise.resolve(false)
    return new Promise((res) => this.brain.react(n, o, res))
  }

  say(text: string, ms?: number) {
    this.bubble.say(text, ms ?? Math.max(1800, text.length * 70), performance.now())
  }

  goTo(target: Element | string): Promise<boolean> {
    const el = typeof target === 'string' ? this.root.querySelector(target) : target
    const s = el && this.world.surfaceFor(el)
    if (!el || !s || this.rag) return Promise.resolve(false)
    const r = el.getBoundingClientRect()
    return new Promise((res) => this.brain.goTo(s.id, clamp((r.left + r.right) / 2, s.left, s.right), res))
  }

  feed(x?: number) {
    if (this.seeds.length >= 6) return
    const b = this.world.bounds
    const px = x ?? b.left + this.u + Math.random() * Math.max(0, b.right - b.left - 2 * this.u)
    this.seeds.push(new Seed(this.view.layer, clamp(px, b.left, b.right), b.top + this.u * 0.3, this.u * 0.26))
  }

  sleep() {
    if (!this.rag) this.brain.sleepNow()
  }

  wake() {
    this.brain.wake()
  }

  set(patch: ConfigPatch) {
    const prev = this.cfg
    this.cfg = this.ctx.cfg = mergeConfig(prev, patch)
    if (this.cfg.zIndex !== prev.zIndex) this.view.layer.style.zIndex = String(this.cfg.zIndex)
    if (this.cfg.size !== prev.size || this.cfg.maxDpr !== prev.maxDpr) this.resizeAt = 0
    else if (this.bank.configure(this.cfg.appearance, this.u, this.dpr)) this.view.invalidate()
    if (patch.platforms) this.world.invalidate(true)
    this.applyConfig()
  }

  refresh() {
    this.world.invalidate(true)
  }

  get state(): PetState {
    return {
      mode: this.rag ? 'ragdoll' : 'anim',
      task: this.brain.task,
      anim: this.rag ? 'ragdoll' : this.anim.name,
      sleeping: this.brain.sleeping,
      x: this.body.x,
      y: this.body.y,
      unit: this.u,
    }
  }

  destroy() {
    cancelAnimationFrame(this.raf)
    window.removeEventListener('resize', this.onResize)
    this.unbind()
    this.brain.stop()
    this.input.destroy()
    this.world.destroy()
    for (const s of this.seeds) s.remove()
    this.seeds.length = 0
    this.bank.clear()
    this.debug?.destroy()
    this.view.destroy()
    this.events.clear()
  }
}
