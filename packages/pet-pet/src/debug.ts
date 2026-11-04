import type { Rect, Surface } from './types'

export class DebugOverlay {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private key = ''

  constructor(layer: HTMLElement) {
    this.canvas = document.createElement('canvas')
    this.canvas.style.cssText = 'position:absolute;left:0;top:0;pointer-events:none'
    this.ctx = this.canvas.getContext('2d')!
    layer.prepend(this.canvas)
  }

  draw(version: number, surfaces: Surface[], bounds: Rect, currentId: string | null) {
    const key = `${version}|${currentId}|${window.innerWidth}x${window.innerHeight}`
    if (key === this.key) return
    this.key = key
    const w = window.innerWidth
    const h = window.innerHeight
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    if (this.canvas.width !== w * dpr || this.canvas.height !== h * dpr) {
      this.canvas.width = w * dpr
      this.canvas.height = h * dpr
      this.canvas.style.width = `${w}px`
      this.canvas.style.height = `${h}px`
    }
    const c = this.ctx
    c.setTransform(dpr, 0, 0, dpr, 0, 0)
    c.clearRect(0, 0, w, h)
    c.setLineDash([6, 4])
    c.strokeStyle = 'rgba(124,140,255,0.8)'
    c.lineWidth = 1
    c.strokeRect(bounds.left + 0.5, bounds.top + 0.5, bounds.right - bounds.left - 1, bounds.bottom - bounds.top - 1)
    c.setLineDash([])
    for (const s of surfaces) {
      const cur = s.id === currentId
      c.strokeStyle = cur ? '#ff7a93' : s.id === 'floor' ? 'rgba(76,195,138,0.5)' : '#4cc38a'
      c.lineWidth = cur ? 4 : 2.5
      c.beginPath()
      c.moveTo(s.left, s.top)
      c.lineTo(s.right, s.top)
      c.stroke()
    }
  }

  destroy() {
    this.canvas.remove()
  }
}
