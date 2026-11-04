import { bump, easeInOut, easeOut, lerp, osc, osc01, seg } from '../pose'
import { SIT_BOX, blink, sitUp } from './kit'
import type { AnimDef } from './types'

const LOAF = { by: 0.07, sy: 0.96 }

export const idleExtras = {
  sit: {
    frames: 16,
    fps: 6,
    loop: true,
    pose: (p, i) => ({
      ...LOAF,
      sy: 0.96 + 0.02 * osc(p),
      eyeOpen: i >= 8 && i < 12 ? 0.45 : blink(i, 14),
      tail: 0.3 * osc(p),
    }),
  },
  groom: {
    frames: 20,
    fps: 10,
    loop: false,
    box: SIT_BOX,
    pose: (p) => {
      const t = bump(p, 0, 1) ** 0.5
      const r = osc(p, 4)
      return {
        ...sitUp(0.8 * t),
        nfx: (0.05 + 0.04 * r) * t,
        nfy: (-0.1 - 0.05 * osc(p, 4, 0.25)) * t,
        ffx: (0.04 - 0.03 * r) * t,
        ffy: -0.08 * t,
        tilt: 0.08 * r * t,
        eye: t > 0.5 ? 'happy' : 'dot',
        earDown: 0.3 * t,
      }
    },
  },
  stretch: {
    frames: 16,
    fps: 8,
    loop: false,
    pose: (p) => {
      const a = bump(p, 0, 0.55)
      const b = bump(p, 0.45, 1)
      return {
        sx: 1 + 0.12 * a + 0.06 * b,
        sy: 1 - 0.1 * a,
        rot: 0.14 * a - 0.08 * b,
        piv: a > b ? -1 : 1,
        ffx: 0.14 * a,
        nfx: 0.16 * a,
        fbx: -0.1 * b,
        nbx: -0.12 * b,
        eye: a + b > 0.4 ? 'closed' : 'dot',
        mouth: a > 0.5 ? 'o' : 'w',
        mouthOpen: a,
        earDown: 0.5 * (a + b),
      }
    },
  },
  yawn: {
    frames: 16,
    fps: 10,
    loop: false,
    box: SIT_BOX,
    pose: (p) => {
      const t = bump(p, 0.05, 0.95)
      return {
        ...sitUp(0.3 * t),
        mouth: t > 0.25 ? 'open' : 'w',
        mouthOpen: t,
        eye: t > 0.3 ? 'closed' : 'dot',
        earDown: 0.5 * t,
        sy: 1 + 0.04 * t,
      }
    },
  },
  look: {
    frames: 20,
    fps: 8,
    loop: false,
    pose: (p, i) => {
      const l = seg(p, 0.1, 0.35) - seg(p, 0.55, 0.8) * 2 + seg(p, 0.85, 1)
      return { lookX: l, fx: 0.02 * l, tilt: 0.08 * l, earF: -0.15 * l, eyeOpen: blink(i, 9) }
    },
  },
  sniff: {
    frames: 16,
    fps: 12,
    loop: false,
    pose: (p, i) => {
      const t = bump(p, 0, 1) ** 0.6
      return {
        rot: 0.1 * t,
        piv: -1,
        ffx: 0.04 * t,
        nfx: 0.05 * t,
        fy: 0.006 * osc(p, 8) * t,
        lookY: 0.5 * t,
        mouth: i % 4 < 2 ? 'w' : 'o',
        mouthOpen: 0.2,
        earN: 0.08 * osc(p, 4),
      }
    },
  },
  curious: {
    frames: 12,
    fps: 8,
    loop: true,
    box: SIT_BOX,
    pose: (p) => ({
      ...sitUp(0.55),
      lookY: -0.6,
      lookX: 0.2,
      tilt: -0.12 + 0.08 * osc(p),
      earN: 0.15,
      earF: 0.1 * osc(p, 2),
      nfy: -0.02 * osc01(p, 2),
    }),
  },
  curiousDown: {
    frames: 12,
    fps: 8,
    loop: true,
    pose: (p) => ({
      rot: 0.18,
      piv: 1,
      lean: 0.06,
      ffx: 0.06,
      nfx: 0.08,
      lookY: 0.6,
      lookX: 0.3,
      tilt: 0.14 + 0.06 * osc(p),
      earN: 0.12 * osc(p, 2),
    }),
  },
  sleep: {
    frames: 16,
    fps: 4,
    loop: true,
    pose: (p) => ({
      ...LOAF,
      sy: 0.94 + 0.03 * osc(p),
      sx: 1 + 0.015 * osc(p),
      eye: 'closed',
      mouth: 'w',
      earDown: 0.55,
      blush: 0.3,
      phase: p,
    }),
  },
  fallAsleep: {
    frames: 12,
    fps: 8,
    loop: false,
    pose: (p, i) => {
      const e = easeInOut(p)
      return {
        by: LOAF.by * e,
        sy: lerp(1, 0.94, e),
        eyeOpen: i < 4 ? 1 - 0.15 * i : i < 6 ? 0.9 : 0.2,
        eye: p > 0.85 ? 'closed' : 'dot',
        earDown: 0.55 * e,
      }
    },
  },
  wake: {
    frames: 12,
    fps: 10,
    loop: false,
    box: SIT_BOX,
    pose: (p) => {
      const t = bump(p, 0.1, 0.8)
      return {
        by: LOAF.by * (1 - easeOut(seg(p, 0, 0.3))),
        ...sitUp(0.35 * t),
        eye: p < 0.5 ? 'closed' : 'dot',
        mouth: t > 0.4 ? 'open' : 'w',
        mouthOpen: t,
        earN: 0.2 * osc(p, 3) * seg(p, 0.6, 1),
        earF: 0.2 * osc(p, 3, 0.2) * seg(p, 0.6, 1),
      }
    },
  },
  eat: {
    frames: 24,
    fps: 12,
    loop: false,
    box: SIT_BOX,
    pose: (p, i) => {
      const t = easeOut(seg(p, 0, 0.15)) * (1 - easeOut(seg(p, 0.85, 1)))
      const munch = i % 4 < 2
      return {
        ...sitUp(0.7 * t),
        nfx: 0.06 * t,
        nfy: -0.12 * t,
        ffx: 0.05 * t,
        ffy: -0.1 * t,
        prop: p > 0.08 && p < 0.7 ? 'seed' : 'none',
        cheek: easeOut(seg(p, 0.15, 0.7)),
        mouth: munch ? 'w' : 'o',
        mouthOpen: 0.3,
        fy: munch ? 0.006 : -0.004,
        eye: p > 0.7 ? 'happy' : 'dot',
        blush: 0.4,
      }
    },
  },
} satisfies Record<string, AnimDef>
