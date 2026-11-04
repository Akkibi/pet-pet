import { describe, expect, it } from 'vitest'
import type { Surface } from '../types'
import { ballistic, edgeBetween, planPath } from './planner'
import { computeSurfaces, crossing } from './segments'

const u = 60
const caps = { u, maxUp: 4 * u, maxReach: 5 * u }
const s = (id: string, top: number, left: number, right: number): Surface => ({ id, el: null, top, left, right, ex: left })

describe('ballistic', () => {
  it('lands exactly on the target point', () => {
    const g = 2000
    const { vx, vy, time } = ballistic(200, -120, g, 30)
    const x = vx * time
    const y = vy * time + 0.5 * g * time * time
    expect(x).toBeCloseTo(200, 5)
    expect(y).toBeCloseTo(-120, 5)
  })

  it('rises above the higher of start and target', () => {
    const g = 2000
    const { vy } = ballistic(50, -100, g, 40)
    expect((vy * vy) / (2 * g)).toBeCloseTo(140, 5)
  })
})

describe('edgeBetween', () => {
  it('jumps onto a higher box from beside it', () => {
    const e = edgeBetween(s('floor', 800, 0, 1000), s('b', 650, 400, 600), caps, 100)
    expect(e).not.toBeNull()
    expect(e!.takeoff).toBeLessThan(400)
    expect(e!.land).toBeGreaterThanOrEqual(400)
  })

  it('refuses a box higher than the jump height', () => {
    expect(edgeBetween(s('floor', 800, 0, 1000), s('b', 300, 400, 600), caps)).toBeNull()
  })

  it('refuses a gap wider than the reach', () => {
    expect(edgeBetween(s('a', 500, 0, 100), s('b', 500, 600, 700), caps)).toBeNull()
  })

  it('steps off the edge to reach a lower, wider box', () => {
    const e = edgeBetween(s('a', 400, 300, 500), s('b', 600, 100, 900), caps, 450)
    expect(e).not.toBeNull()
    expect(e!.land > 500 || e!.land < 300).toBe(true)
  })
})

describe('planPath', () => {
  it('chains jumps to reach a box too high for one jump', () => {
    const floor = s('floor', 1000, 0, 1200)
    const mid = s('mid', 800, 300, 500)
    const high = s('high', 560, 600, 800)
    const steps = planPath([floor, mid, high], 'floor', 100, 'high', caps)
    expect(steps).not.toBeNull()
    expect(steps!.map((st) => st.to.id)).toEqual(['mid', 'high'])
  })

  it('returns null when the goal is unreachable', () => {
    const floor = s('floor', 1000, 0, 1200)
    const sky = s('sky', 100, 300, 500)
    expect(planPath([floor, sky], 'floor', 100, 'sky', caps)).toBeNull()
  })

  it('returns an empty plan when already there', () => {
    expect(planPath([s('floor', 1000, 0, 1200)], 'floor', 100, 'floor', caps)).toEqual([])
  })
})

describe('computeSurfaces', () => {
  const bounds = { left: 0, top: 0, right: 1200, bottom: 1000 }
  const opts = { bounds, u, minWidth: 54, headroom: 51, pad: 18 }

  it('always includes the floor', () => {
    const out = computeSurfaces([], opts)
    expect(out[0].id).toBe('floor')
    expect(out[0].top).toBe(1000)
  })

  it('cuts the part of a top edge covered by another box', () => {
    const card = { id: 1, el: null, rect: { left: 100, top: 500, right: 700, bottom: 700 }, ancestors: new Set<number>() }
    const badge = { id: 2, el: null, rect: { left: 300, top: 460, right: 400, bottom: 520 }, ancestors: new Set<number>() }
    const out = computeSurfaces([card, badge], opts).filter((x) => x.top === 500)
    expect(out.length).toBe(2)
    expect(out[0].right).toBeLessThan(300)
    expect(out[1].left).toBeGreaterThan(400)
  })

  it('ignores a parent covering its child', () => {
    const section = { id: 1, el: null, rect: { left: 0, top: 200, right: 1200, bottom: 900 }, ancestors: new Set<number>() }
    const card = { id: 2, el: null, rect: { left: 100, top: 400, right: 500, bottom: 600 }, ancestors: new Set([1]) }
    const out = computeSurfaces([section, card], opts)
    expect(out.some((x) => x.top === 400 && x.right - x.left > 300)).toBe(true)
  })
})

describe('crossing', () => {
  it('finds the first surface crossed while falling', () => {
    const list = [s('floor', 1000, 0, 1200), s('a', 500, 100, 300), s('b', 600, 100, 300)]
    expect(crossing(list, 200, 450, 700)?.id).toBe('a')
    expect(crossing(list, 500, 450, 1100)?.id).toBe('floor')
  })
})
