import { bump, easeOut, osc, osc01, seg } from '../pose'
import { HOP_BOX, SIT_BOX, blink, sitUp } from './kit'
import type { AnimDef } from './types'

const BIG = { w: 1.8, up: 1.6 }

export const reactions = {
  approve: {
    frames: 16,
    fps: 14,
    loop: false,
    box: SIT_BOX,
    pose: (p) => {
      const t = easeOut(seg(p, 0, 0.25)) * (1 - easeOut(seg(p, 0.85, 1)))
      const nod = bump(p, 0.3, 0.5) + bump(p, 0.5, 0.7)
      return {
        ...sitUp(0.6 * t),
        tilt: 0.18 * nod,
        fy: 0.02 * nod,
        nfx: 0.1 * t,
        nfy: -0.2 * bump(p, 0.35, 0.95),
        eye: 'happy',
        mouth: 'smile',
        blush: 0.5,
        tail: osc(p, 2),
      }
    },
  },
  cancel: {
    frames: 16,
    fps: 14,
    loop: false,
    pose: (p) => {
      const s = osc(p, 3) * bump(p, 0.05, 0.9)
      return {
        tilt: 0.14 * s,
        fx: 0.025 * s,
        lookX: -s,
        eye: 'squint',
        mouth: 'flat',
        earDown: 0.5,
        earN: 0.1 * s,
      }
    },
  },
  delete: {
    frames: 18,
    fps: 16,
    loop: false,
    box: { ...SIT_BOX, w: 2 },
    pose: (p) => {
      const t = easeOut(seg(p, 0, 0.2)) * (1 - easeOut(seg(p, 0.8, 1)))
      const shove = bump(p, 0.2, 0.45)
      return {
        ...sitUp(0.4 * t),
        nfx: 0.06 * t + 0.22 * shove,
        ffx: 0.05 * t + 0.2 * shove,
        nfy: -0.06 * t,
        ffy: -0.05 * t,
        lean: 0.1 * shove,
        eye: p < 0.45 ? 'squint' : 'happy',
        mouth: p < 0.45 ? 'flat' : 'smile',
      }
    },
  },
  error: {
    frames: 16,
    fps: 12,
    loop: false,
    pose: (p) => {
      const hit = bump(p, 0, 0.3)
      return {
        sy: 1 - 0.1 * hit,
        sx: 1 + 0.05 * hit,
        bx: -0.04 * hit + 0.012 * osc(p, 5) * seg(p, 0.2, 1),
        earDown: 1,
        eye: p < 0.5 ? 'x' : 'teary',
        mouth: 'frown',
        phase: p,
      }
    },
  },
  success: {
    frames: 20,
    fps: 14,
    loop: false,
    box: BIG,
    pose: (p) => {
      const h = bump(p, 0.15, 0.65)
      const t = easeOut(seg(p, 0, 0.2)) * (1 - easeOut(seg(p, 0.75, 1)))
      return {
        ...sitUp(0.75 * t),
        by: -0.32 * h,
        sy: 1 - 0.1 * bump(p, 0, 0.15) - 0.08 * bump(p, 0.65, 0.8),
        float: Math.min(1, h * 2),
        nfx: 0.1 * t,
        nfy: -0.3 * t,
        ffx: 0.02 * t,
        ffy: -0.28 * t,
        eye: 'happy',
        mouth: 'open',
        mouthOpen: 0.8,
        blush: 0.7,
        tail: osc(p, 3),
      }
    },
  },
  warning: {
    frames: 16,
    fps: 12,
    loop: false,
    box: SIT_BOX,
    pose: (p) => {
      const t = easeOut(seg(p, 0, 0.2)) * (1 - easeOut(seg(p, 0.85, 1)))
      return {
        ...sitUp(0.7 * t),
        bx: 0.006 * osc(p, 8) * t,
        nfx: 0.12 * t,
        nfy: -0.28 * t,
        eye: 'wide',
        mouth: 'o',
        mouthOpen: 0.5,
        earN: 0.25 * t,
        earF: 0.25 * t,
      }
    },
  },
  thinking: {
    frames: 24,
    fps: 6,
    loop: true,
    box: SIT_BOX,
    pose: (p, i) => ({
      ...sitUp(0.5),
      nfx: 0.12,
      nfy: -0.17 + 0.01 * osc(p, 2),
      ffy: -0.04,
      lookY: -0.5,
      lookX: 0.3 + 0.2 * osc(p),
      tilt: 0.12,
      eyeOpen: blink(i, 16),
      mouth: 'flat',
      earF: 0.08 * osc(p, 2),
    }),
  },
  love: {
    frames: 24,
    fps: 10,
    loop: true,
    box: SIT_BOX,
    pose: (p) => ({
      ...sitUp(0.6),
      nfx: 0.12,
      ffx: 0.1,
      nfy: -0.06,
      ffy: -0.06,
      tilt: 0.1 * osc(p, 2),
      sy: 1 + 0.03 * osc01(p, 2),
      eye: 'happy',
      mouth: 'w',
      blush: 1,
      tail: osc(p, 3),
    }),
  },
  wave: {
    frames: 16,
    fps: 12,
    loop: true,
    box: SIT_BOX,
    pose: (p) => ({
      ...sitUp(0.65),
      nfx: 0.05 + 0.07 * osc(p, 2),
      nfy: -0.32,
      tilt: 0.06 * osc(p, 2),
      eye: osc(p, 2) > 0.4 ? 'happy' : 'dot',
      mouth: 'smile',
      blush: 0.4,
      tail: osc(p, 2),
    }),
  },
  surprised: {
    ease: 0,
    frames: 12,
    fps: 14,
    loop: false,
    box: HOP_BOX,
    pose: (p) => {
      const h = bump(p, 0, 0.5)
      const e = easeOut(seg(p, 0, 0.5))
      return {
        bx: -0.1 * e,
        by: -0.14 * h,
        float: Math.min(1, h * 2),
        sy: 1 + 0.1 * h - 0.06 * bump(p, 0.5, 0.75),
        rot: -0.1 * h,
        eye: 'wide',
        mouth: 'o',
        mouthOpen: 1,
        earN: 0.3 * e,
        earF: 0.3 * e,
      }
    },
  },
  confused: {
    frames: 20,
    fps: 8,
    loop: true,
    pose: (p, i) => {
      const s = p < 0.5 ? 1 : -1
      return {
        tilt: 0.24 * s * bump(p < 0.5 ? p * 2 : p * 2 - 1, 0, 1) ** 0.4,
        lookX: 0.6 * s,
        lookY: -0.3,
        eyeOpen: blink(i, 8),
        mouth: 'flat',
        earN: -0.3 * s,
        earF: 0.2 * s,
      }
    },
  },
  sad: {
    frames: 24,
    fps: 6,
    loop: true,
    pose: (p) => ({
      by: 0.05,
      sy: 0.95 + 0.015 * osc(p),
      earDown: 1,
      eye: 'teary',
      mouth: 'frown',
      lookY: 0.4,
      phase: p,
    }),
  },
} satisfies Record<string, AnimDef>

export const REACTION_ALIASES = {
  hello: 'wave',
  celebrate: 'success',
  loading: 'thinking',
  ok: 'approve',
  no: 'cancel',
} as const
