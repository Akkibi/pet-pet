import type { AnimDef } from './anims/types'
import { clamp, lerp, makePose, type Pose } from './pose'

export const DEFAULT_EASE = 0.24
const MIN_DIFF = 0.03
const FULL_DIFF = 0.3

type NumKey = Exclude<{ [K in keyof Pose]: Pose[K] extends number ? K : never }[keyof Pose], 'phase'>

const WEIGHT: Record<NumKey, number> = {
  bx: 1,
  by: 1,
  rot: 0.6,
  piv: 0,
  sx: 0.6,
  sy: 0.6,
  lean: 0.6,
  fbx: 1,
  fby: 1,
  ffx: 1,
  ffy: 1,
  nbx: 1,
  nby: 1,
  nfx: 1,
  nfy: 1,
  float: 0.3,
  grip: 0.3,
  arm: 0.3,
  fx: 1,
  fy: 1,
  tilt: 0.4,
  upright: 0,
  earF: 0.1,
  earN: 0.1,
  earDown: 0.1,
  eyeOpen: 0.05,
  lookX: 0.1,
  lookY: 0.1,
  mouthOpen: 0.05,
  cheek: 0.05,
  blush: 0.05,
  tail: 0.02,
}
const KEYS = Object.keys(WEIGHT) as NumKey[]

export const frameProgress = (def: AnimDef, i: number) =>
  def.loop ? i / def.frames : def.frames > 1 ? i / (def.frames - 1) : 1

export const framePose = (def: AnimDef, i: number): Pose => makePose(def.pose(frameProgress(def, i), i))

const faceAngle = (p: Pose) => p.tilt - p.rot * p.upright

export const poseDiff = (a: Pose, b: Pose) => {
  let d = Math.abs(faceAngle(a) - faceAngle(b)) * 0.4
  for (const k of KEYS) d = Math.max(d, Math.abs(a[k] - b[k]) * WEIGHT[k])
  return d
}

export const mixPose = (a: Pose, b: Pose, t: number): Pose => {
  const out = { ...(t < 0.5 ? a : b) }
  for (const k of KEYS) out[k] = lerp(a[k], b[k], t)
  return out
}

export const blendTime = (from: AnimDef, to: AnimDef, a: Pose, b: Pose) => {
  const ease = Math.min(from.ease ?? DEFAULT_EASE, to.ease ?? DEFAULT_EASE)
  if (ease <= 0 || a.back !== b.back || a.feet || b.feet) return 0
  const d = poseDiff(a, b)
  return d < MIN_DIFF ? 0 : ease * clamp(d / FULL_DIFF, 0.5, 1)
}
