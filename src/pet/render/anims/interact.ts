import { bump, easeOut, elastic, lerp, osc, osc01, seg } from '../pose'
import { HOP_BOX, paddle } from './kit'
import type { AnimDef } from './types'

const flip = (p: number, a: number, b: number) => {
  const t = seg(p, a, b)
  return { back: t > 0.5, sy: Math.max(0.12, Math.abs(1 - 2 * t)) }
}

export const interactions = {
  happy: {
    frames: 16,
    fps: 14,
    loop: false,
    box: HOP_BOX,
    pose: (p) => {
      const h = bump(p, 0, 0.45) + 0.6 * bump(p, 0.45, 0.8)
      return {
        by: -0.14 * h,
        float: Math.min(1, h * 2),
        sy: 1 + 0.06 * h - 0.08 * bump(p, 0.8, 1),
        ffy: -0.04 * h,
        nfy: -0.05 * h,
        eye: 'happy',
        mouth: 'smile',
        blush: 0.8,
        earN: 0.2 * h,
        earF: 0.15 * h,
        tail: osc(p, 3),
      }
    },
  },
  purr: {
    frames: 16,
    fps: 8,
    loop: true,
    pose: (p) => ({
      by: 0.04,
      sy: 0.97 + 0.02 * osc(p, 2),
      sx: 1 + 0.01 * osc(p, 2),
      tilt: 0.08 * osc(p),
      eye: 'happy',
      mouth: 'w',
      blush: 1,
      earDown: 0.4,
      tail: osc(p, 2),
    }),
  },
  roll: {
    frames: 18,
    fps: 14,
    loop: false,
    pose: (p) => {
      const a = seg(p, 0, 0.25)
      const b = seg(p, 0.75, 1)
      const back = a > 0.5 && b < 0.5
      const on = a >= 1 && b <= 0
      return {
        ...(back ? paddle(p, 0.06, 3) : {}),
        back,
        sy: p < 0.25 ? Math.max(0.12, Math.abs(1 - 2 * a)) : p > 0.75 ? Math.max(0.12, Math.abs(1 - 2 * b)) : 1,
        bx: on ? 0.04 * osc(p, 2) : 0,
        eye: 'happy',
        mouth: on ? 'open' : 'w',
        mouthOpen: 0.6,
        blush: 1,
        tail: osc(p, 4),
      }
    },
  },
  squish: {
    frames: 8,
    fps: 10,
    loop: true,
    pose: (p) => ({
      sy: 0.78 + 0.015 * osc(p),
      sx: 1.12 - 0.01 * osc(p),
      eye: 'closed',
      mouth: 'w',
      blush: 0.9,
      earDown: 0.8,
    }),
  },
  unsquish: {
    frames: 8,
    fps: 16,
    loop: false,
    pose: (p) => {
      const e = elastic(p)
      return { sy: lerp(0.78, 1, e), sx: lerp(1.12, 1, e), earDown: 0.8 * (1 - p), eye: p < 0.4 ? 'closed' : 'dot', blush: 0.6 }
    },
  },
  startle: {
    frames: 10,
    fps: 16,
    loop: false,
    box: HOP_BOX,
    pose: (p) => {
      const h = bump(p, 0, 0.6)
      return {
        by: -0.25 * h,
        float: Math.min(1, h * 2),
        sy: 1 + 0.08 * h - 0.1 * bump(p, 0.6, 1),
        fby: 0.04 * h,
        nby: 0.04 * h,
        ffy: -0.04 * h,
        nfy: -0.05 * h,
        eye: 'wide',
        mouth: 'o',
        mouthOpen: 0.8,
        earN: 0.3 * h,
        earF: 0.3 * h,
        tail: 1,
      }
    },
  },
  dizzy: {
    frames: 16,
    fps: 8,
    loop: true,
    pose: (p) => ({
      rot: 0.07 * osc(p),
      piv: osc(p) > 0 ? 1 : -1,
      bx: 0.03 * osc(p),
      tilt: 0.2 * osc(p, 1, 0.25),
      eye: 'spiral',
      mouth: 'flat',
      earDown: 0.4,
      phase: p,
    }),
  },
  dizzyBack: {
    frames: 16,
    fps: 8,
    loop: true,
    pose: (p) => ({
      ...paddle(p, 0.04, 1),
      back: true,
      bx: 0.02 * osc(p),
      tilt: 0.15 * osc(p, 1, 0.25),
      eye: 'spiral',
      mouth: 'w',
      phase: p,
    }),
  },
  getup: {
    frames: 12,
    fps: 14,
    loop: false,
    pose: (p) => {
      const e = easeOut(seg(p, 0, 0.6))
      return {
        rot: 0.45 * (1 - e),
        piv: 1,
        sy: 1 - 0.08 * bump(p, 0.5, 0.8),
        bx: 0.015 * osc(p, 3) * seg(p, 0.6, 1),
        eye: p < 0.5 ? 'squint' : 'dot',
        earN: 0.2 * osc(p, 3) * seg(p, 0.6, 1),
        earF: 0.2 * osc(p, 3, 0.3) * seg(p, 0.6, 1),
      }
    },
  },
  getupBack: {
    frames: 16,
    fps: 14,
    loop: false,
    pose: (p) => {
      const k = seg(p, 0, 0.4)
      const f = flip(p, 0.4, 0.6)
      const s = seg(p, 0.6, 1)
      return {
        ...(f.back ? paddle(p, 0.07 * (1 - k * 0.5), 3) : {}),
        back: f.back,
        sy: p < 0.4 ? 1 : p < 0.6 ? f.sy : lerp(0.12, 1, elastic(s)),
        by: p > 0.45 && p < 0.65 ? -0.08 : 0,
        eye: p < 0.6 ? 'squint' : 'dot',
        mouth: p < 0.6 ? 'flat' : 'w',
        earN: 0.2 * osc01(p, 3) * s,
        earF: 0.2 * osc01(p, 3, 0.3) * s,
      }
    },
  },
} satisfies Record<string, AnimDef>
