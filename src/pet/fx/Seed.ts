import type { Surface } from '../types'
import type { World } from '../world/World'

const SEED_SVG =
  '<svg viewBox="0 0 24 24" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><g transform="rotate(30 12 12)"><ellipse cx="12" cy="12" rx="6" ry="10" fill="#4b4039"/><path d="M10 4.5v15M14 5v14" stroke="#efe6dc" stroke-width="1.3" stroke-linecap="round"/></g></svg>'

export class Seed {
  x: number
  y: number
  vy = 0
  surface: Surface | null = null
  age = 0
  eaten = false
  claimed = false
  private el: HTMLDivElement
  private size: number

  constructor(layer: HTMLElement, x: number, y: number, size: number) {
    this.x = x
    this.y = y
    this.size = size
    this.el = document.createElement('div')
    this.el.style.cssText = `position:absolute;left:0;top:0;width:${size}px;height:${size}px;will-change:transform`
    this.el.innerHTML = SEED_SVG
    layer.append(this.el)
    this.el.animate([{ opacity: 0, transform: this.tf(0.3) }, { opacity: 1, transform: this.tf(1) }], { duration: 180 })
  }

  private tf(scale = 1) {
    return `translate3d(${(this.x - this.size / 2).toFixed(1)}px,${(this.y - this.size).toFixed(1)}px,0) scale(${scale})`
  }

  update(dt: number, world: World, g: number) {
    this.age += dt
    if (this.surface) {
      const s = world.refresh(this.surface, this.x)
      if (!s) this.surface = null
      else {
        if (s.el && s.el === this.surface.el) this.x += s.ex - this.surface.ex
        this.surface = s
        this.y = s.top
      }
    } else {
      const y0 = this.y
      this.vy = Math.min(this.vy + g * dt, g)
      this.y += this.vy * dt
      const s = world.landing(this.x, y0, this.y)
      if (s) {
        this.surface = s
        this.y = s.top
        this.vy = 0
      } else if (this.y >= world.bounds.bottom) {
        this.surface = world.floor
        this.y = world.bounds.bottom
      }
    }
    this.el.style.transform = this.tf()
  }

  remove(eaten = false) {
    this.eaten = eaten
    const a = this.el.animate([{ opacity: 1 }, { opacity: 0, transform: this.tf(0.2) }], { duration: 220, fill: 'forwards' })
    a.onfinish = () => this.el.remove()
  }
}
