import type { Rect } from '../types'

export type SizeSpec = number | `${number}px` | `${number}vh` | `${number}vw` | `${number}vmin`

export const resolveSize = (size: SizeSpec, viewW: number, viewH: number): number => {
  if (typeof size === 'number') return size
  const m = /^(-?\d*\.?\d+)(px|vh|vw|vmin)$/.exec(size.trim())
  if (!m) return 64
  const v = parseFloat(m[1])
  switch (m[2]) {
    case 'vh':
      return (v / 100) * viewH
    case 'vw':
      return (v / 100) * viewW
    case 'vmin':
      return (v / 100) * Math.min(viewW, viewH)
    default:
      return v
  }
}

export const viewportRect = (): Rect => ({
  left: 0,
  top: 0,
  right: document.documentElement.clientWidth || window.innerWidth,
  bottom: window.innerHeight,
})

export const containerRect = (el: HTMLElement | null): Rect => {
  const vp = viewportRect()
  if (!el) return vp
  const r = el.getBoundingClientRect()
  const left = r.left + el.clientLeft
  const top = r.top + el.clientTop
  return {
    left: Math.max(vp.left, left),
    top: Math.max(vp.top, top),
    right: Math.min(vp.right, left + el.clientWidth),
    bottom: Math.min(vp.bottom, top + el.clientHeight),
  }
}

export const sameRect = (a: Rect, b: Rect) =>
  a.left === b.left && a.top === b.top && a.right === b.right && a.bottom === b.bottom
