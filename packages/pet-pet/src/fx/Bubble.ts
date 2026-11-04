import type { Rect } from '../types'

export class Bubble {
  private outer: HTMLDivElement
  private inner: HTMLDivElement
  private text: HTMLSpanElement
  private until = 0
  private visible = false
  private lastKey = ''
  private width = 0
  private height = 0

  constructor(layer: HTMLElement) {
    this.outer = document.createElement('div')
    this.outer.style.cssText = 'position:absolute;left:0;top:0;will-change:transform;display:none'
    this.inner = document.createElement('div')
    this.inner.style.cssText =
      'position:relative;transform-origin:50% 100%;background:#fff;color:#4a3426;border:1.5px solid #eadfd5;border-radius:14px;padding:5px 11px;font:600 13px/1.25 ui-rounded,system-ui,sans-serif;max-width:220px;box-shadow:0 3px 0 rgba(74,52,38,0.08);white-space:pre-wrap;text-align:center'
    this.text = document.createElement('span')
    const tail = document.createElement('div')
    tail.style.cssText =
      'position:absolute;left:50%;bottom:-6px;width:10px;height:10px;background:#fff;border-right:1.5px solid #eadfd5;border-bottom:1.5px solid #eadfd5;transform:translateX(-50%) rotate(45deg)'
    this.inner.append(this.text, tail)
    this.outer.append(this.inner)
    layer.append(this.outer)
  }

  say(text: string, ms: number, now: number) {
    this.text.textContent = text
    this.until = now + ms
    this.outer.style.display = 'block'
    this.width = this.inner.offsetWidth
    this.height = this.inner.offsetHeight
    this.lastKey = ''
    if (!this.visible) {
      this.inner.animate(
        [
          { transform: 'scale(0.4)', opacity: 0 },
          { transform: 'scale(1.06)', opacity: 1, offset: 0.7 },
          { transform: 'scale(1)', opacity: 1 },
        ],
        { duration: 220, easing: 'ease-out' },
      )
    }
    this.visible = true
  }

  hide() {
    if (!this.visible) return
    this.visible = false
    const a = this.inner.animate([{ opacity: 1 }, { opacity: 0, transform: 'scale(0.8)' }], { duration: 160, easing: 'ease-in' })
    a.onfinish = () => {
      if (!this.visible) this.outer.style.display = 'none'
    }
  }

  update(now: number, x: number, headY: number, bounds: Rect) {
    if (!this.visible) return
    if (now > this.until) return this.hide()
    const w = this.width
    const left = Math.max(bounds.left + 4, Math.min(bounds.right - w - 4, x - w / 2))
    const top = Math.max(bounds.top + 4, headY - this.height - 10)
    const key = `${left.toFixed(0)},${top.toFixed(0)}`
    if (key === this.lastKey) return
    this.lastKey = key
    this.outer.style.transform = `translate3d(${left.toFixed(0)}px,${top.toFixed(0)}px,0)`
  }

  get shown() {
    return this.visible
  }
}
