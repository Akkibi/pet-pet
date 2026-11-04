import { describe, expect, it } from 'vitest'
import { DEFAULT_CONFIG } from '../config'
import { Ragdoll } from './Ragdoll'

const U = 100
const PH = DEFAULT_CONFIG.physics
const world = (bottom = 4000) => ({ bounds: { left: 0, top: 0, right: 4000, bottom }, surfaces: [] })

const hold = (lx: number, ly: number, wiggle: number) => {
  const r = new Ragdoll(U, 2000, 1500, 0, 0, 1)
  const x0 = 2000 + lx * U
  const y0 = 1500 + ly * U
  r.startGrab(x0, y0)
  let prev = r.angle
  let turns = 0
  let last = 0
  for (let f = 0; f < 60 * 20; f++) {
    const t = f / 60
    r.moveGrab(x0 + Math.sin(t * 9) * wiggle * U, y0 + Math.cos(t * 7) * wiggle * U)
    r.step(1 / 60, world(), PH, () => {})
    const d = Math.atan2(Math.sin(r.angle - prev), Math.cos(r.angle - prev))
    prev = r.angle
    turns += d / (2 * Math.PI)
    last = Math.abs(d * 60)
  }
  return { turns: Math.abs(turns), last }
}

describe('ragdoll', () => {
  it('does not spin up by itself while held', () => {
    for (const [lx, ly] of [[0.3, 0], [-0.3, 0], [0.4, -0.2], [-0.4, 0.25], [0, 0.3]]) {
      const { turns, last } = hold(lx, ly, 0.3)
      expect(turns, `${lx},${ly}`).toBeLessThan(6)
      expect(last, `${lx},${ly}`).toBeLessThan(20)
    }
  })

  it('comes to rest after a drop', () => {
    const r = new Ragdoll(U, 2000, 600, 300, 0, 1)
    let t = 0
    while (r.restTime < 0.35 && t < 6) {
      r.step(1 / 60, world(1000), PH, () => {})
      t += 1 / 60
    }
    expect(t).toBeLessThan(6)
  })
})
