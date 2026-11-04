import type { Platforms } from '../config'
import type { Rect, Surface } from '../types'
import { containerRect } from './bounds'
import { scanCandidates, type Candidate } from './scanner'
import { computeSurfaces, crossing, surfaceBelow } from './segments'

export interface WorldOptions {
  container: HTMLElement | null
  root: ParentNode
  layer: Element
  platforms: () => Platforms
  unit: () => number
}

const MEASURE_EVERY = 0.25
const SCAN_DEBOUNCE = 0.35

export class World {
  bounds: Rect
  surfaces: Surface[] = []
  version = 0
  private o: WorldOptions
  private candidates: Candidate[] = []
  private scanDirty = true
  private scanTimer = 0
  private rectDirty = true
  private sinceMeasure = 0
  private measuredThisFrame = false
  private mo: MutationObserver | null = null
  private onScroll = () => {
    this.rectDirty = true
  }

  constructor(o: WorldOptions) {
    this.o = o
    this.bounds = containerRect(o.container)
    window.addEventListener('scroll', this.onScroll, { capture: true, passive: true })
    window.addEventListener('resize', this.onScroll, { passive: true })
    const target = o.root instanceof Document ? o.root.body : (o.root as Node)
    if (target && 'MutationObserver' in window) {
      this.mo = new MutationObserver((records) => {
        for (const r of records) {
          if (o.layer.contains(r.target)) continue
          this.scanDirty = true
          this.scanTimer = 0
          return
        }
      })
      this.mo.observe(target, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ['class', 'hidden', 'open', 'data-pet-platform', 'data-pet-ignore'],
      })
    }
  }

  invalidate(scan = false) {
    this.rectDirty = true
    if (scan) {
      this.scanDirty = true
      this.scanTimer = SCAN_DEBOUNCE
    }
  }

  update(dt: number) {
    this.measuredThisFrame = false
    this.sinceMeasure += dt
    if (this.scanDirty) {
      this.scanTimer += dt
      if (this.scanTimer >= SCAN_DEBOUNCE || !this.candidates.length) {
        this.candidates = scanCandidates(this.o.root, this.o.platforms())
        this.scanDirty = false
        this.scanTimer = 0
        this.rectDirty = true
      }
    }
    if (this.rectDirty || this.sinceMeasure >= MEASURE_EVERY) this.measure()
  }

  measure() {
    const u = this.o.unit()
    const p = this.o.platforms()
    this.bounds = containerRect(this.o.container)
    const boxes = []
    for (const c of this.candidates) {
      if (!c.el.isConnected) continue
      boxes.push({ id: c.id, el: c.el, rect: c.el.getBoundingClientRect(), ancestors: c.ancestors })
    }
    this.surfaces = computeSurfaces(boxes, {
      bounds: this.bounds,
      u,
      minWidth: p.minWidth * u,
      headroom: u * 0.85,
      pad: u * 0.3,
    })
    this.rectDirty = false
    this.sinceMeasure = 0
    this.measuredThisFrame = true
    this.version++
  }

  get floor(): Surface {
    return this.surfaces[0] ?? { id: 'floor', el: null, top: this.bounds.bottom, left: this.bounds.left, right: this.bounds.right, ex: this.bounds.left }
  }

  byId(id: string): Surface | null {
    for (const s of this.surfaces) if (s.id === id) return s
    return null
  }

  refresh(s: Surface, x: number): Surface | null {
    if (s.id === 'floor') return this.floor
    if (!s.el || !s.el.isConnected) return null
    if (this.measuredThisFrame) {
      const hit = this.byId(s.id)
      if (hit && x >= hit.left - 2 && x <= hit.right + 2) return hit
      let best: Surface | null = null
      for (const c of this.surfaces) {
        if (c.el !== s.el) continue
        if (x >= c.left - 2 && x <= c.right + 2) return c
        if (!best || Math.abs(c.left - x) < Math.abs(best.left - x)) best = c
      }
      return best && Math.abs(best.top - s.top) < 1 ? best : hit
    }
    const r = s.el.getBoundingClientRect()
    if (r.top === s.top && r.left === s.ex) return s
    const dx = r.left - s.ex
    this.rectDirty = true
    const moved = { ...s, top: r.top, left: s.left + dx, right: s.right + dx, ex: r.left }
    const i = this.surfaces.findIndex((c) => c.id === s.id)
    if (i >= 0) this.surfaces[i] = moved
    return moved
  }

  landing(x: number, y0: number, y1: number, margin = 0): Surface | null {
    return crossing(this.surfaces, x, y0, y1, margin)
  }

  below(x: number, y: number): Surface | null {
    return surfaceBelow(this.surfaces, x, y)
  }

  surfaceFor(el: Element): Surface | null {
    const own = this.surfaces.filter((s) => s.el === el)
    if (own.length) return own.reduce((a, b) => (b.right - b.left > a.right - a.left ? b : a))
    let best: Surface | null = null
    const r = el.getBoundingClientRect()
    for (const s of this.surfaces) {
      if (!s.el || !el.contains(s.el)) continue
      if (!best || s.top < best.top) best = s
    }
    if (best) return best
    for (const s of this.surfaces) {
      if (s.el && s.el.contains(el) && s.top <= r.top + 1) {
        if (!best || s.top > best.top) best = s
      }
    }
    return best
  }

  destroy() {
    window.removeEventListener('scroll', this.onScroll, { capture: true })
    window.removeEventListener('resize', this.onScroll)
    this.mo?.disconnect()
  }
}
