import type { Appearance } from '../config'

export type EyeStyle = 'dot' | 'wide' | 'teary' | 'happy' | 'closed' | 'squint' | 'x' | 'spiral' | 'star' | 'angry'
export type MouthStyle = 'w' | 'tongue' | 'smile' | 'o' | 'open' | 'flat' | 'frown' | 'none'
export type Prop = 'none' | 'seed'

export interface Pose {
  bx: number
  by: number
  rot: number
  piv: number
  sx: number
  sy: number
  lean: number
  fbx: number
  fby: number
  ffx: number
  ffy: number
  nbx: number
  nby: number
  nfx: number
  nfy: number
  float: number
  grip: number
  arm: number
  back: boolean
  feet: number[] | null
  fx: number
  fy: number
  tilt: number
  upright: number
  earF: number
  earN: number
  earDown: number
  eye: EyeStyle
  eyeOpen: number
  lookX: number
  lookY: number
  mouth: MouthStyle
  mouthOpen: number
  cheek: number
  blush: number
  tail: number
  phase: number
  prop: Prop
}

export const GEO = {
  hips: [-0.3, 0.33, -0.38, 0.2],
  legW: 0.12,
  cap: 0.06,
  bodyH: 0.58,
  gap: 0.1,
  halfW: 0.5,
}

export const bodyY = (look: Appearance) => {
  const yb = -GEO.gap * look.legLength
  const yt = yb - GEO.bodyH * look.chubby
  return { yb, yt, h: yb - yt, cy: (yb + yt) / 2 }
}

export const basePose = (): Pose => ({
  bx: 0,
  by: 0,
  rot: 0,
  piv: 0,
  sx: 1,
  sy: 1,
  lean: 0,
  fbx: 0,
  fby: 0,
  ffx: 0,
  ffy: 0,
  nbx: 0,
  nby: 0,
  nfx: 0,
  nfy: 0,
  float: 0,
  grip: 0,
  arm: 0,
  back: false,
  feet: null,
  fx: 0,
  fy: 0,
  tilt: 0,
  upright: 0,
  earF: 0,
  earN: 0,
  earDown: 0,
  eye: 'dot',
  eyeOpen: 1,
  lookX: 0,
  lookY: 0,
  mouth: 'w',
  mouthOpen: 0,
  cheek: 0,
  blush: 0,
  tail: 0,
  phase: 0,
  prop: 'none',
})

export const makePose = (over: Partial<Pose>): Pose => ({ ...basePose(), ...over })

export const TAU = Math.PI * 2
export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
export const osc = (p: number, cycles = 1, offset = 0) => Math.sin((p * cycles + offset) * TAU)
export const osc01 = (p: number, cycles = 1, offset = 0) => 0.5 - 0.5 * Math.cos((p * cycles + offset) * TAU)
export const easeOut = (t: number) => 1 - (1 - t) * (1 - t)
export const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2)
export const seg = (p: number, a: number, b: number) => clamp((p - a) / (b - a), 0, 1)
export const bump = (p: number, a: number, b: number) => Math.sin(seg(p, a, b) * Math.PI)
export const elastic = (t: number) =>
  t <= 0 ? 0 : t >= 1 ? 1 : 2 ** (-8 * t) * Math.sin((t * 6 - 0.75) * ((2 * Math.PI) / 3)) + 1
