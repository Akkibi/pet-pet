import type { Appearance } from '../config'
import type { Facing } from '../types'
import { drawHamster } from './layers'
import type { Pose } from './pose'
import type { Strip } from './strips'

export const CANVAS = { w: 2, h: 2.45, ax: 1, ay: 1.68, cy: 1.22 }
const TURN_HOP = 0.05
const TURN_MIN = 0.14

const css = (el: HTMLElement, s: Partial<CSSStyleDeclaration>) => Object.assign(el.style, s)

export type ViewMode = 'anim' | 'ragdoll'

export class View {
  layer: HTMLDivElement
  wrap: HTMLDivElement
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  hitbox: HTMLDivElement
  shadow: HTMLDivElement
  label: HTMLDivElement | null = null
  u = 64
  dpr = 1
  mode: ViewMode = 'anim'
  turnTime = 0.18
  private turn = 0
  private snapTurn = true
  private turnKey = ''
  private lastKey = ''
  private lastPos = ''
  private lastShadow = ''

  constructor(zIndex: number) {
    this.layer = document.createElement('div')
    this.layer.setAttribute('data-pet-layer', '')
    this.layer.setAttribute('data-pet-ignore', '')
    this.layer.setAttribute('aria-hidden', 'true')
    css(this.layer, {
      position: 'fixed',
      left: '0',
      top: '0',
      width: '0',
      height: '0',
      zIndex: String(zIndex),
      pointerEvents: 'none',
    })
    this.shadow = document.createElement('div')
    css(this.shadow, {
      position: 'absolute',
      left: '0',
      top: '0',
      borderRadius: '50%',
      background: 'radial-gradient(closest-side, rgba(70,45,30,0.22), rgba(70,45,30,0))',
      willChange: 'transform, opacity',
    })
    this.wrap = document.createElement('div')
    css(this.wrap, { position: 'absolute', left: '0', top: '0', willChange: 'transform' })
    this.canvas = document.createElement('canvas')
    css(this.canvas, { position: 'absolute', display: 'block' })
    const ctx = this.canvas.getContext('2d')
    if (!ctx) throw new Error('pet-pet: 2d context unavailable')
    this.ctx = ctx
    this.hitbox = document.createElement('div')
    css(this.hitbox, {
      position: 'absolute',
      borderRadius: '40%',
      pointerEvents: 'auto',
      cursor: 'grab',
      touchAction: 'none',
      userSelect: 'none',
      webkitUserSelect: 'none',
    })
    this.wrap.append(this.canvas, this.hitbox)
    this.layer.append(this.shadow, this.wrap)
    document.body.append(this.layer)
  }

  resize(u: number, dpr: number) {
    if (u === this.u && dpr === this.dpr && this.canvas.width) return
    this.u = u
    this.dpr = dpr
    this.canvas.width = Math.ceil(CANVAS.w * u * dpr)
    this.canvas.height = Math.ceil(CANVAS.h * u * dpr)
    css(this.canvas, { width: `${CANVAS.w * u}px`, height: `${CANVAS.h * u}px` })
    css(this.shadow, { width: `${u * 1.05}px`, height: `${u * 0.16}px` })
    css(this.hitbox, { width: `${u * 1.05}px`, height: `${u * 0.72}px` })
    this.setMode(this.mode, true)
    this.lastKey = ''
  }

  setMode(mode: ViewMode, force = false) {
    if (mode === this.mode && !force) return
    if (mode !== this.mode) this.snapTurn = true
    this.mode = mode
    const u = this.u
    const top = mode === 'anim' ? CANVAS.ay : CANVAS.cy
    css(this.canvas, {
      left: `${-CANVAS.ax * u}px`,
      top: `${-top * u}px`,
      transformOrigin: `${CANVAS.ax * u}px ${top * u}px`,
    })
    const hy = mode === 'anim' ? -0.74 : -0.36
    css(this.hitbox, { left: `${-0.525 * u}px`, top: `${hy * u}px` })
    this.turnKey = ''
    this.applyTurn()
    this.lastKey = ''
  }

  setFacing(f: Facing, dt: number) {
    const goal = f > 0 ? 0 : Math.PI
    if (this.snapTurn || this.turnTime <= 0) this.turn = goal
    else if (this.turn !== goal) {
      const step = (Math.PI * dt) / this.turnTime
      const d = goal - this.turn
      this.turn = Math.abs(d) <= step ? goal : this.turn + Math.sign(d) * step
    }
    this.snapTurn = false
    this.applyTurn()
  }

  private applyTurn() {
    let tf = 'none'
    if (this.mode === 'anim') {
      const c = Math.cos(this.turn)
      const s = Math.sin(this.turn)
      if (s > 0.01) {
        const sx = (c < 0 ? -1 : 1) * Math.max(TURN_MIN, Math.abs(c))
        tf = `translateY(${(-TURN_HOP * s * this.u).toFixed(2)}px) scaleX(${sx.toFixed(3)})`
      } else if (c < 0) tf = 'scaleX(-1)'
    }
    if (tf === this.turnKey) return
    this.turnKey = tf
    this.canvas.style.transform = tf
  }

  place(x: number, y: number) {
    const key = `${x.toFixed(1)},${y.toFixed(1)}`
    if (key === this.lastPos) return
    this.lastPos = key
    this.wrap.style.transform = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0)`
    if (this.label) this.label.style.transform = `translate3d(${x.toFixed(1)}px,${(y - this.u * 1.35).toFixed(1)}px,0) translateX(-50%)`
  }

  placeShadow(x: number, y: number, scale: number, alpha: number) {
    const key = `${x.toFixed(1)},${y.toFixed(1)},${scale.toFixed(2)},${alpha.toFixed(2)}`
    if (key === this.lastShadow) return
    this.lastShadow = key
    const w = this.u * 1.05
    const h = this.u * 0.16
    this.shadow.style.transform = `translate3d(${(x - w / 2).toFixed(1)}px,${(y - h / 2).toFixed(1)}px,0) scale(${scale.toFixed(3)})`
    this.shadow.style.opacity = alpha.toFixed(2)
  }

  invalidate() {
    this.lastKey = ''
  }

  drawStrip(strip: Strip, frame: number) {
    const key = `${strip.name}:${frame}:${strip.fw}`
    if (key === this.lastKey) return
    this.lastKey = key
    const { ctx } = this
    const dx = Math.round(CANVAS.ax * this.u * this.dpr - strip.ax)
    const dy = Math.round(CANVAS.ay * this.u * this.dpr - strip.ay)
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    ctx.drawImage(strip.canvas, frame * strip.fw, 0, strip.fw, strip.fh, dx, dy, strip.fw, strip.fh)
  }

  drawLive(draw: (ctx: CanvasRenderingContext2D) => void) {
    this.paint(CANVAS.cy, draw)
  }

  drawPose(pose: Pose, look: Appearance) {
    this.paint(CANVAS.ay, (ctx) => drawHamster(ctx, pose, look, this.u))
  }

  private paint(ay: number, draw: (ctx: CanvasRenderingContext2D) => void) {
    this.lastKey = ''
    const { ctx, u, dpr } = this
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    ctx.setTransform(dpr, 0, 0, dpr, Math.round(CANVAS.ax * u * dpr), Math.round(ay * u * dpr))
    draw(ctx)
  }

  setLabel(text: string | null) {
    if (text === null) {
      this.label?.remove()
      this.label = null
      return
    }
    if (!this.label) {
      this.label = document.createElement('div')
      css(this.label, {
        position: 'absolute',
        left: '0',
        top: '0',
        font: '11px ui-monospace, monospace',
        padding: '1px 6px',
        borderRadius: '6px',
        background: 'rgba(30,20,15,0.75)',
        color: '#fff',
        whiteSpace: 'nowrap',
      })
      this.layer.append(this.label)
    }
    if (this.label.textContent !== text) this.label.textContent = text
  }

  destroy() {
    this.layer.remove()
  }
}
