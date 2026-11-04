import { bump, easeOut, lerp, osc, osc01, seg } from '../pose'
import { blink, paddle, steps } from './kit'
import type { AnimDef } from './types'

export const locomotion = {
  idle: {
    frames: 24,
    fps: 8,
    loop: true,
    pose: (p, i) => ({
      sy: 1 + 0.02 * osc(p, 2),
      sx: 1 - 0.01 * osc(p, 2),
      eyeOpen: blink(i, 20),
      earN: i === 12 || i === 13 ? -0.3 : 0,
      tail: 0.4 * osc(p, 1),
    }),
  },
  walk: {
    ease: 0.14,
    frames: 8,
    fps: 12,
    loop: true,
    pose: (p) => ({
      ...steps(osc(p), osc(p, 1, 0.25), 0.06, 0.045),
      by: -0.018 * osc01(p, 2),
      rot: 0.015 * osc(p, 2),
      earN: 0.06 * osc(p, 2),
      earF: 0.06 * osc(p, 2, 0.2),
      tail: osc(p),
    }),
  },
  run: {
    ease: 0.14,
    frames: 6,
    fps: 16,
    loop: true,
    pose: (p) => {
      const s = osc(p)
      const c = osc(p, 1, 0.25)
      return {
        sx: 1 + 0.06 * s,
        sy: 1 - 0.05 * s,
        by: -0.06 * osc01(p),
        rot: 0.05 * c,
        lean: 0.08,
        float: 0.3,
        fbx: -0.1 * s,
        nbx: -0.12 * s,
        ffx: 0.1 * osc(p, 1, 0.5),
        nfx: 0.12 * osc(p, 1, 0.5),
        fby: -0.06 * Math.max(0, c),
        nby: -0.06 * Math.max(0, c),
        ffy: -0.06 * Math.max(0, -c),
        nfy: -0.06 * Math.max(0, -c),
        earDown: 0.5,
        tail: s,
      }
    },
  },
  crouch: {
    ease: 0,
    frames: 6,
    fps: 20,
    loop: false,
    pose: (p) => {
      const e = easeOut(p)
      return { sy: 1 - 0.16 * e, sx: 1 + 0.07 * e, lean: -0.05 * e, earDown: 0.35 * e, eyeOpen: 1 - 0.3 * e }
    },
  },
  jumpUp: {
    ease: 0,
    frames: 4,
    fps: 12,
    loop: false,
    box: { up: 1.2, down: 0.3 },
    pose: (p) => {
      const e = easeOut(p)
      return {
        sy: 1.08 - 0.06 * e,
        sx: 0.95 + 0.03 * e,
        rot: -0.16 * (1 - e * 0.5),
        float: 1,
        fbx: -0.08,
        fby: 0.06,
        nbx: -0.1,
        nby: 0.07,
        ffx: 0.08,
        ffy: -0.05,
        nfx: 0.1,
        nfy: -0.06,
        earDown: 0.6,
        tail: -1,
      }
    },
  },
  jumpDown: {
    ease: 0,
    frames: 4,
    fps: 12,
    loop: false,
    box: { up: 1.2, down: 0.3 },
    pose: (p) => {
      const e = easeOut(p)
      return {
        rot: 0.14 * e,
        float: 1,
        ffx: 0.06 + 0.04 * e,
        ffy: 0.05 * e,
        nfx: 0.08 + 0.04 * e,
        nfy: 0.05 * e,
        fbx: -0.08,
        fby: -0.03,
        nbx: -0.08,
        nby: -0.03,
        earN: -0.25 * e,
        earF: -0.2 * e,
        eye: 'wide',
        tail: 1,
      }
    },
  },
  fall: {
    ease: 0,
    frames: 4,
    fps: 10,
    loop: true,
    box: { up: 1.2, down: 0.3 },
    pose: (p) => ({
      ...paddle(p, 0.05, 1),
      float: 1,
      eye: 'wide',
      mouth: 'o',
      mouthOpen: 0.5,
      earN: 0.25 * osc(p),
      earF: 0.25 * osc(p, 1, 0.3),
      tail: osc(p),
    }),
  },
  land: {
    ease: 0,
    frames: 6,
    fps: 18,
    loop: false,
    pose: (p) => {
      const q = (1 - p) * (1 - p)
      return { sy: 1 - 0.15 * q, sx: 1 + 0.08 * q, earDown: 0.5 * q }
    },
  },
  landHard: {
    ease: 0,
    frames: 12,
    fps: 16,
    loop: false,
    pose: (p) => {
      const q = 1 - easeOut(seg(p, 0.3, 1))
      return {
        sy: 1 - 0.3 * q,
        sx: 1 + 0.16 * q,
        earDown: q,
        eye: p < 0.6 ? 'squint' : 'dot',
        mouth: p < 0.6 ? 'flat' : 'w',
        bx: 0.015 * osc(p, 4) * q,
      }
    },
  },
  climb: {
    ease: 0,
    frames: 10,
    fps: 14,
    loop: false,
    box: { down: 0.75 },
    pose: (p) => {
      const a = easeOut(seg(p, 0, 0.6))
      const b = easeOut(seg(p, 0.6, 1))
      return {
        ...paddle(p, 0.05, 2),
        ffx: 0.06,
        nfx: 0.08,
        ffy: 0,
        nfy: 0,
        by: lerp(lerp(0.55, 0.1, a), 0, b),
        rot: lerp(lerp(-0.7, -0.2, a), 0, b),
        float: 1 - b,
        grip: 1,
        eye: p < 0.6 ? 'squint' : 'dot',
        mouth: p < 0.6 ? 'flat' : 'w',
        earDown: 0.4 * (1 - b),
      }
    },
  },
  hang: {
    ease: 0,
    frames: 4,
    fps: 8,
    loop: true,
    box: { down: 0.75 },
    pose: (p) => ({
      ...paddle(p, 0.05, 1),
      ffx: 0.06,
      nfx: 0.08,
      ffy: 0,
      nfy: 0,
      by: 0.55 + 0.02 * bump(p, 0, 1),
      rot: -0.7,
      float: 1,
      grip: 1,
      eye: 'wide',
      mouth: 'o',
      mouthOpen: 0.4,
    }),
  },
} satisfies Record<string, AnimDef>
