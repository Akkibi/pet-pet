import { CONFETTI_COLORS, ICONS, type FxKind } from './icons'

export interface FxOptions {
  size?: number
  dx?: number
  count?: number
  duration?: number
}

const MAX_NODES = 60

export class Fx {
  private layer: HTMLElement
  private unit: () => number
  private live = 0

  constructor(layer: HTMLElement, unit: () => number) {
    this.layer = layer
    this.unit = unit
  }

  spawn(kind: FxKind, x: number, y: number, o: FxOptions = {}) {
    if (kind === 'confetti') return this.confetti(x, y, o.count ?? 16)
    if (kind === 'poof') return this.poof(x, y, o.size ?? this.unit() * 0.45)
    const u = this.unit()
    const size = o.size ?? u * (kind === 'dots' ? 0.42 : kind === 'zzz' ? 0.22 : 0.3)
    const el = this.node(size)
    if (!el) return
    el.innerHTML = ICONS[kind]
    const dx = o.dx ?? (Math.random() - 0.5) * u * 0.5
    const t = (px: number, py: number, s: number, r = 0) =>
      `translate3d(${(x + px - size / 2).toFixed(1)}px,${(y + py - size / 2).toFixed(1)}px,0) scale(${s}) rotate(${r}deg)`
    let frames: Keyframe[]
    let duration = o.duration ?? 1100
    switch (kind) {
      case 'bonk':
        frames = [
          { transform: t(0, 0, 0.3, 0), opacity: 1 },
          { transform: t(0, 0, 1.25, 25), opacity: 1, offset: 0.35 },
          { transform: t(0, 0, 0.2, 60), opacity: 0 },
        ]
        duration = o.duration ?? 420
        break
      case 'sweat':
        frames = [
          { transform: t(0, 0, 0.4), opacity: 0 },
          { transform: t(0, 0, 1), opacity: 1, offset: 0.2 },
          { transform: t(dx * 0.2, u * 0.25, 0.9), opacity: 0 },
        ]
        duration = o.duration ?? 900
        break
      case 'zzz':
        frames = [
          { transform: t(0, 0, 0.4, -10), opacity: 0 },
          { transform: t(u * 0.12, -u * 0.2, 0.9, 5), opacity: 1, offset: 0.3 },
          { transform: t(u * 0.35, -u * 0.6, 1.3, -8), opacity: 0 },
        ]
        duration = o.duration ?? 1800
        break
      case 'dots':
      case 'check':
      case 'cross':
      case 'bang':
      case 'question':
        frames = [
          { transform: t(0, 0, 0.2), opacity: 0 },
          { transform: t(0, -u * 0.15, 1.15), opacity: 1, offset: 0.18 },
          { transform: t(0, -u * 0.18, 1), opacity: 1, offset: 0.3 },
          { transform: t(0, -u * 0.22, 1), opacity: 1, offset: 0.8 },
          { transform: t(0, -u * 0.35, 0.8), opacity: 0 },
        ]
        duration = o.duration ?? 1300
        break
      default:
        frames = [
          { transform: t(0, 0, 0.3), opacity: 0 },
          { transform: t(dx * 0.3, -u * 0.2, 1), opacity: 1, offset: 0.25 },
          { transform: t(dx, -u * 0.75, 0.85), opacity: 0 },
        ]
    }
    this.play(el, frames, duration, kind === 'bonk' ? 'cubic-bezier(.2,.9,.3,1)' : 'ease-out')
  }

  private node(size: number) {
    if (this.live >= MAX_NODES) return null
    const el = document.createElement('div')
    el.style.cssText = `position:absolute;left:0;top:0;width:${size}px;height:${size}px;will-change:transform,opacity;opacity:0`
    this.layer.append(el)
    this.live++
    return el
  }

  private play(el: HTMLElement, frames: Keyframe[], duration: number, easing: string, delay = 0) {
    const anim = el.animate(frames, { duration, easing, delay, fill: 'both' })
    anim.onfinish = anim.oncancel = () => {
      el.remove()
      this.live--
    }
  }

  private poof(x: number, y: number, size: number) {
    for (let i = 0; i < 6; i++) {
      const s = size * (0.5 + Math.random() * 0.4)
      const el = this.node(s)
      if (!el) return
      el.style.borderRadius = '50%'
      el.style.background = i % 2 ? '#f3eee9' : '#ffffff'
      el.style.boxShadow = 'inset 0 -3px 0 rgba(0,0,0,0.06)'
      const a = (i / 6) * Math.PI * 2 + Math.random()
      const r = size * 0.9
      const t = (k: number, sc: number) =>
        `translate3d(${(x + Math.cos(a) * r * k - s / 2).toFixed(1)}px,${(y + Math.sin(a) * r * k * 0.6 - s / 2).toFixed(1)}px,0) scale(${sc})`
      this.play(el, [
        { transform: t(0, 0.3), opacity: 1 },
        { transform: t(0.7, 1.1), opacity: 1, offset: 0.4 },
        { transform: t(1, 0.4), opacity: 0 },
      ], 650, 'ease-out')
    }
  }

  private confetti(x: number, y: number, count: number) {
    const u = this.unit()
    for (let i = 0; i < count; i++) {
      const w = u * (0.06 + Math.random() * 0.05)
      const el = this.node(w)
      if (!el) return
      el.style.height = `${w * 0.55}px`
      el.style.borderRadius = '2px'
      el.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length]
      const vx = (Math.random() - 0.5) * u * 3
      const up = u * (1 + Math.random() * 1.2)
      const rot = (Math.random() - 0.5) * 900
      const frames: Keyframe[] = []
      for (let k = 0; k <= 6; k++) {
        const t = k / 6
        const py = -up * 4 * t * (1 - t) + u * 1.2 * t * t
        frames.push({
          transform: `translate3d(${(x + vx * t).toFixed(1)}px,${(y + py).toFixed(1)}px,0) rotate(${(rot * t).toFixed(0)}deg)`,
          opacity: t > 0.8 ? (1 - t) * 5 : 1,
        })
      }
      this.play(el, frames, 1200 + Math.random() * 400, 'linear', Math.random() * 80)
    }
  }
}
