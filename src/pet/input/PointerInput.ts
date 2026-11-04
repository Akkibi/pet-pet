export interface Cursor {
  x: number
  y: number
  vx: number
  vy: number
  speed: number
  lastMove: number
  known: boolean
}

export interface PointerHandlers {
  press: () => void
  click: (count: number) => void
  longPress: () => void
  longRelease: () => void
  dragStart: (x: number, y: number) => void
  dragMove: (x: number, y: number) => void
  dragEnd: (x: number, y: number) => void
  stroke: (amount: number) => void
}

const DRAG_PX = 6
const LONG_MS = 450
const CLICK_WINDOW = 1600

export class PointerInput {
  cursor: Cursor = { x: -9999, y: -9999, vx: 0, vy: 0, speed: 0, lastMove: 0, known: false }
  private h: PointerHandlers
  private target: HTMLElement
  private down: { id: number; x: number; y: number; t: number } | null = null
  private dragging = false
  private longFired = false
  private longTimer = 0
  private clicks: number[] = []
  private hover = false
  private lastHover = { x: 0, y: 0 }

  constructor(target: HTMLElement, h: PointerHandlers) {
    this.target = target
    this.h = h
    window.addEventListener('pointermove', this.onMove, { passive: true })
    target.addEventListener('pointerdown', this.onDown)
    target.addEventListener('pointermove', this.onTargetMove)
    target.addEventListener('pointerup', this.onUp)
    target.addEventListener('pointercancel', this.onCancel)
    target.addEventListener('pointerenter', this.onEnter)
    target.addEventListener('pointerleave', this.onLeave)
    target.addEventListener('contextmenu', this.onContext)
  }

  get isDragging() {
    return this.dragging
  }

  private onMove = (e: PointerEvent) => {
    const c = this.cursor
    const now = performance.now()
    const dt = Math.max(1, now - c.lastMove) / 1000
    if (c.known) {
      const k = Math.min(1, dt * 12)
      c.vx += ((e.clientX - c.x) / dt - c.vx) * k
      c.vy += ((e.clientY - c.y) / dt - c.vy) * k
      c.speed = Math.hypot(c.vx, c.vy)
    }
    c.x = e.clientX
    c.y = e.clientY
    c.lastMove = now
    c.known = true
  }

  private onDown = (e: PointerEvent) => {
    if (e.button !== 0 || this.down) return
    e.preventDefault()
    this.target.setPointerCapture(e.pointerId)
    this.down = { id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now() }
    this.dragging = false
    this.longFired = false
    this.target.style.cursor = 'grabbing'
    this.h.press()
    this.longTimer = window.setTimeout(() => {
      if (this.down && !this.dragging) {
        this.longFired = true
        this.h.longPress()
      }
    }, LONG_MS)
  }

  private onTargetMove = (e: PointerEvent) => {
    if (this.down && e.pointerId === this.down.id) {
      if (!this.dragging && Math.hypot(e.clientX - this.down.x, e.clientY - this.down.y) > DRAG_PX) {
        this.dragging = true
        clearTimeout(this.longTimer)
        if (this.longFired) this.h.longRelease()
        this.h.dragStart(e.clientX, e.clientY)
      }
      if (this.dragging) this.h.dragMove(e.clientX, e.clientY)
      return
    }
    if (this.hover && e.pointerType === 'mouse') {
      const d = Math.hypot(e.clientX - this.lastHover.x, e.clientY - this.lastHover.y)
      this.lastHover = { x: e.clientX, y: e.clientY }
      if (d > 0 && d < 80) this.h.stroke(d)
    }
  }

  private finish(e: PointerEvent, cancelled: boolean) {
    if (!this.down || e.pointerId !== this.down.id) return
    clearTimeout(this.longTimer)
    if (this.target.hasPointerCapture(e.pointerId)) this.target.releasePointerCapture(e.pointerId)
    this.target.style.cursor = 'grab'
    if (this.dragging) this.h.dragEnd(e.clientX, e.clientY)
    else if (this.longFired) this.h.longRelease()
    else if (!cancelled) {
      const now = performance.now()
      this.clicks = this.clicks.filter((t) => now - t < CLICK_WINDOW)
      this.clicks.push(now)
      this.h.click(this.clicks.length)
    }
    this.down = null
    this.dragging = false
    this.longFired = false
  }

  private onUp = (e: PointerEvent) => this.finish(e, false)
  private onCancel = (e: PointerEvent) => this.finish(e, true)
  private onEnter = (e: PointerEvent) => {
    this.hover = true
    this.lastHover = { x: e.clientX, y: e.clientY }
  }
  private onLeave = () => {
    this.hover = false
  }
  private onContext = (e: Event) => e.preventDefault()

  resetClicks() {
    this.clicks = []
  }

  destroy() {
    clearTimeout(this.longTimer)
    window.removeEventListener('pointermove', this.onMove)
    const t = this.target
    t.removeEventListener('pointerdown', this.onDown)
    t.removeEventListener('pointermove', this.onTargetMove)
    t.removeEventListener('pointerup', this.onUp)
    t.removeEventListener('pointercancel', this.onCancel)
    t.removeEventListener('pointerenter', this.onEnter)
    t.removeEventListener('pointerleave', this.onLeave)
    t.removeEventListener('contextmenu', this.onContext)
  }
}
