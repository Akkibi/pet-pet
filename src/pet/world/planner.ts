import type { Surface } from '../types'

export interface Caps {
  u: number
  maxUp: number
  maxReach: number
}

export interface Step {
  from: Surface
  to: Surface
  takeoff: number
  land: number
}

interface Edge {
  to: number
  takeoff: number
  land: number
  cost: number
}

const clampX = (s: Surface, x: number) => Math.max(s.left, Math.min(s.right, x))

export const edgeBetween = (a: Surface, b: Surface, caps: Caps, fromX?: number): Omit<Edge, 'to'> | null => {
  const { u } = caps
  const rise = a.top - b.top
  if (rise > caps.maxUp) return null
  const reach = rise >= 0 ? caps.maxReach : caps.maxReach * (1 + Math.min(1, -rise / (4 * u)) * 0.6)
  const inset = Math.min(u * 0.45, (b.right - b.left) / 2)
  const x = fromX ?? (a.left + a.right) / 2
  let takeoff: number
  let land: number
  if (b.left >= a.right) {
    takeoff = a.right - u * 0.15
    land = b.left + inset
  } else if (b.right <= a.left) {
    takeoff = a.left + u * 0.15
    land = b.right - inset
  } else if (rise > u * 0.3) {
    const leftRoom = b.left - a.left
    const rightRoom = a.right - b.right
    const preferLeft = Math.abs(x - b.left) <= Math.abs(x - b.right)
    if (leftRoom > u * 0.8 && (preferLeft || rightRoom <= u * 0.8)) {
      takeoff = b.left - u * 0.55
      land = b.left + inset
    } else if (rightRoom > u * 0.8) {
      takeoff = b.right + u * 0.55
      land = b.right - inset
    } else {
      takeoff = Math.max(b.left + inset, Math.min(b.right - inset, x))
      land = takeoff
    }
  } else if (rise < -u * 0.3) {
    if (b.left < a.left - u * 0.5 && (x - a.left < a.right - x || b.right <= a.right + u * 0.5)) {
      takeoff = a.left + u * 0.15
      land = Math.max(b.left + inset, a.left - u * 0.6)
    } else if (b.right > a.right + u * 0.5) {
      takeoff = a.right - u * 0.15
      land = Math.min(b.right - inset, a.right + u * 0.6)
    } else return null
  } else {
    takeoff = Math.max(Math.max(a.left, b.left), Math.min(Math.min(a.right, b.right), x))
    land = takeoff
  }
  takeoff = clampX(a, takeoff)
  land = clampX(b, land)
  const dx = Math.abs(land - takeoff)
  if (dx > reach) return null
  return { takeoff, land, cost: dx + Math.abs(rise) * 0.6 + u * 2 }
}

export const planPath = (
  surfaces: Surface[],
  fromId: string,
  x: number,
  toId: string,
  caps: Caps,
  maxNodes = 160,
): Step[] | null => {
  const list = surfaces.slice(0, maxNodes)
  const start = list.findIndex((s) => s.id === fromId)
  const goal = list.findIndex((s) => s.id === toId)
  if (start < 0 || goal < 0) return null
  if (start === goal) return []
  const n = list.length
  const dist = new Array<number>(n).fill(Infinity)
  const prev = new Array<{ node: number; edge: Edge } | null>(n).fill(null)
  const posX = new Array<number>(n).fill(0)
  const done = new Array<boolean>(n).fill(false)
  dist[start] = 0
  posX[start] = x
  for (;;) {
    let cur = -1
    for (let i = 0; i < n; i++) if (!done[i] && dist[i] < Infinity && (cur < 0 || dist[i] < dist[cur])) cur = i
    if (cur < 0 || cur === goal) break
    done[cur] = true
    const a = list[cur]
    for (let j = 0; j < n; j++) {
      if (j === cur || done[j]) continue
      const e = edgeBetween(a, list[j], caps, posX[cur])
      if (!e) continue
      const d = dist[cur] + Math.abs(e.takeoff - posX[cur]) * 0.5 + e.cost
      if (d < dist[j]) {
        dist[j] = d
        posX[j] = e.land
        prev[j] = { node: cur, edge: { to: j, ...e } }
      }
    }
  }
  if (dist[goal] === Infinity) return null
  const steps: Step[] = []
  for (let k = goal; k !== start; ) {
    const p = prev[k]
    if (!p) return null
    steps.unshift({ from: list[p.node], to: list[k], takeoff: p.edge.takeoff, land: p.edge.land })
    k = p.node
  }
  return steps
}

export interface Launch {
  vx: number
  vy: number
  time: number
}

export const ballistic = (dx: number, dy: number, g: number, clearance: number): Launch => {
  const apex = Math.max(0, -dy) + clearance
  const vy = -Math.sqrt(2 * g * apex)
  const tUp = -vy / g
  const fall = Math.max(apex + dy, 0.01)
  const tDown = Math.sqrt((2 * fall) / g)
  const time = tUp + tDown
  return { vx: dx / time, vy, time }
}
