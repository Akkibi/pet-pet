import { describe, expect, it } from 'vitest'
import { DEFAULT_CONFIG, PRESETS, SHAPES, mergeConfig } from './config'
import { resolveReaction } from './events'
import { ANIMS } from './render/anims'
import { boxOf } from './render/anims/types'
import { makePose } from './render/pose'
import { REACTION_NAMES } from './types'
import { resolveSize } from './world/bounds'

describe('config', () => {
  it('applies preset, shape, then explicit appearance', () => {
    const c = mergeConfig(DEFAULT_CONFIG, { preset: 'choco', shape: 'block', appearance: { eyeSize: 1.4 } })
    expect(c.appearance.fur).toBe(PRESETS.choco.fur)
    expect(c.appearance.roundness).toBe(SHAPES.block.roundness)
    expect(c.appearance.eyeSize).toBe(1.4)
    expect(DEFAULT_CONFIG.appearance.fur).toBe(PRESETS.golden.fur)
  })

  it('resolves viewport sizes', () => {
    expect(resolveSize('10vh', 1920, 1080)).toBe(108)
    expect(resolveSize('5vw', 1000, 800)).toBe(50)
    expect(resolveSize('10vmin', 1000, 800)).toBe(80)
    expect(resolveSize(64, 1, 1)).toBe(64)
    expect(resolveSize('48px', 1, 1)).toBe(48)
  })
})

describe('reactions', () => {
  it('resolves names and aliases', () => {
    expect(resolveReaction('hello')).toBe('wave')
    expect(resolveReaction('delete')).toBe('delete')
    expect(resolveReaction('nope')).toBeNull()
  })

  it('has an animation for every reaction', () => {
    for (const n of REACTION_NAMES) expect(ANIMS[n]).toBeDefined()
  })
})

describe('animations', () => {
  it('produce finite poses that fit the canvas box', () => {
    for (const [name, def] of Object.entries(ANIMS)) {
      const box = boxOf(def)
      expect(box.up, name).toBeLessThanOrEqual(1.68)
      expect(box.down, name).toBeLessThanOrEqual(0.77)
      for (let i = 0; i < def.frames; i++) {
        const p = makePose(def.pose(i / def.frames, i))
        for (const [k, v] of Object.entries(p)) if (typeof v === 'number') expect(Number.isFinite(v), `${name}.${k}`).toBe(true)
      }
    }
  })
})
