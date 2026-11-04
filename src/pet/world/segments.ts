import type { Rect, Surface } from '../types'

export interface Box {
  id: number
  el: Element | null
  rect: Rect
  ancestors: ReadonlySet<number>
}

export interface SegmentOptions {
  bounds: Rect
  u: number
  minWidth: number
  headroom: number
  pad: number
}

const subtract = (ranges: [number, number][], a: number, b: number): [number, number][] => {
  const out: [number, number][] = []
  for (const [l, r] of ranges) {
    if (b <= l || a >= r) out.push([l, r])
    else {
      if (a > l) out.push([l, a])
      if (b < r) out.push([b, r])
    }
  }
  return out
}

export const computeSurfaces = (boxes: Box[], o: SegmentOptions): Surface[] => {
  const { bounds, u } = o
  const out: Surface[] = [
    { id: 'floor', el: null, top: bounds.bottom, left: bounds.left + o.pad, right: bounds.right - o.pad, ex: bounds.left },
  ]
  const bw = bounds.right - bounds.left
  const bh = bounds.bottom - bounds.top
  for (const b of boxes) {
    const r = b.rect
    const w = r.right - r.left
    if (w < o.minWidth || r.bottom - r.top < 4) continue
    if (r.top < bounds.top + o.headroom || r.top > bounds.bottom - 2) continue
    if (r.right < bounds.left || r.left > bounds.right) continue
    if (w > bw * 0.92 && r.bottom - r.top > bh * 0.7) continue
    let ranges: [number, number][] = [[Math.max(r.left, bounds.left) + o.pad, Math.min(r.right, bounds.right) - o.pad]]
    const bandTop = r.top - o.headroom
    const bandBottom = r.top - 1
    for (const c of boxes) {
      if (c === b || b.ancestors.has(c.id)) continue
      const q = c.rect
      if (q.bottom <= bandTop || q.top >= bandBottom) continue
      ranges = subtract(ranges, q.left - u * 0.25, q.right + u * 0.25)
      if (!ranges.length) break
    }
    let k = 0
    for (const [l, rr] of ranges) {
      if (rr - l < u * 0.5) continue
      out.push({ id: `${b.id}:${k++}`, el: b.el, top: r.top, left: l, right: rr, ex: r.left })
    }
  }
  return out
}

export const surfaceAt = (surfaces: Surface[], x: number, y: number, tol = 2): Surface | null => {
  let best: Surface | null = null
  for (const s of surfaces) {
    if (x < s.left || x > s.right) continue
    if (Math.abs(s.top - y) > tol) continue
    if (!best || s.top < best.top) best = s
  }
  return best
}

export const surfaceBelow = (surfaces: Surface[], x: number, y: number): Surface | null => {
  let best: Surface | null = null
  for (const s of surfaces) {
    if (x < s.left || x > s.right || s.top < y - 1) continue
    if (!best || s.top < best.top) best = s
  }
  return best
}

export const crossing = (surfaces: Surface[], x: number, y0: number, y1: number, margin = 0): Surface | null => {
  let best: Surface | null = null
  for (const s of surfaces) {
    if (x < s.left - margin || x > s.right + margin) continue
    if (s.top < y0 - 1 || s.top > y1) continue
    if (!best || s.top < best.top) best = s
  }
  return best
}
