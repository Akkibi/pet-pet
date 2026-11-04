import { describe, expect, it } from 'vitest'
import { AnimPlayer } from './AnimPlayer'
import { ANIMS, type AnimName } from './anims'
import { blendTime, framePose, mixPose } from './blend'
import { makePose } from './pose'

const time = (a: AnimName, b: AnimName, i = 0) => blendTime(ANIMS[a], ANIMS[b], framePose(ANIMS[a], i), framePose(ANIMS[b], 0))

describe('pose blending', () => {
  it('mixes numbers and switches discrete fields at half way', () => {
    const a = makePose({ rot: 0, eye: 'dot' })
    const b = makePose({ rot: -0.5, eye: 'happy' })
    expect(mixPose(a, b, 0)).toEqual(a)
    expect(mixPose(a, b, 1)).toEqual(b)
    expect(mixPose(a, b, 0.25).rot).toBeCloseTo(-0.125)
    expect(mixPose(a, b, 0.25).eye).toBe('dot')
    expect(mixPose(a, b, 0.75).eye).toBe('happy')
  })

  it('blends abrupt pose changes only', () => {
    expect(time('idle', 'curious')).toBeGreaterThan(0.15)
    expect(time('curious', 'idle')).toBeGreaterThan(0.15)
    expect(time('curious', 'curiousDown')).toBeGreaterThan(0.15)
    expect(time('idle', 'thinking')).toBeGreaterThan(0)
    expect(time('idle', 'groom')).toBe(0)
    expect(time('idle', 'approve')).toBe(0)
  })

  it('keeps fast and physics-driven anims snappy', () => {
    expect(time('walk', 'crouch')).toBe(0)
    expect(time('idle', 'startle')).toBe(0)
    expect(time('jumpDown', 'land')).toBe(0)
    expect(time('curious', 'surprised')).toBe(0)
    expect(time('roll', 'idle', 9)).toBe(0)
  })

  it('player blends from what is on screen and snaps after a cut', () => {
    const p = new AnimPlayer()
    p.play('idle')
    p.play('curious')
    expect(p.blending).toBe(false)
    p.play('idle')
    expect(p.blending).toBe(true)
    p.update(0.1)
    const mid = p.pose()
    expect(mid.rot).toBeLessThan(0)
    expect(mid.rot).toBeGreaterThan(framePose(ANIMS.curious, 0).rot)
    p.update(1)
    expect(p.blending).toBe(false)
    p.snap()
    p.play('curious')
    expect(p.blending).toBe(false)
  })
})
