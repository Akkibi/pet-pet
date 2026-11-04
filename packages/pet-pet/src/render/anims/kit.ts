import type { Pose } from '../pose'

export const SIT = -0.85

export const sitUp = (t: number): Partial<Pose> => ({
  rot: SIT * t,
  piv: -1,
  arm: Math.min(1, t * 1.6),
  upright: 0.85,
  fbx: 0.03 * t,
  nbx: 0.05 * t,
})

export const blink = (i: number, at: number) => (i === at ? 0.1 : i === at + 1 ? 0.55 : 1)

export const steps = (s: number, c: number, reach: number, lift: number): Partial<Pose> => ({
  nfx: reach * s,
  fbx: reach * s,
  ffx: -reach * s,
  nbx: -reach * s,
  nfy: -lift * Math.max(0, c),
  fby: -lift * Math.max(0, c),
  ffy: -lift * Math.max(0, -c),
  nby: -lift * Math.max(0, -c),
})

export const paddle = (p: number, amp: number, cycles = 2): Partial<Pose> => {
  const o = (k: number) => Math.sin((p * cycles + k) * Math.PI * 2) * amp
  return { fbx: o(0), fby: o(0.25), ffx: o(0.5), ffy: o(0.75), nbx: o(0.33), nby: o(0.58), nfx: o(0.83), nfy: o(0.08) }
}

export const SIT_BOX = { w: 1.7, up: 1.4 }
export const HOP_BOX = { up: 1.5 }
