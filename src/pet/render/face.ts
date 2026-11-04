import type { Appearance, FaceStyle } from '../config'
import { TAU, clamp, type Pose } from './pose'

const TEAR = '#8fd3ff'
const TONGUE = '#ff8a9a'

const eye = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  side: -1 | 1,
  p: Pose,
  look: Appearance,
  sw: number,
) => {
  const ink = look.eyes
  ctx.fillStyle = ink
  ctx.strokeStyle = ink
  ctx.lineWidth = sw * 1.25
  const lx = p.lookX * r * 0.35
  const ly = p.lookY * r * 0.3
  const dot = (rr: number, open: number, shine: number) => {
    if (open < 0.22) {
      ctx.beginPath()
      ctx.moveTo(x - rr, y)
      ctx.lineTo(x + rr, y)
      ctx.stroke()
      return
    }
    ctx.beginPath()
    ctx.ellipse(x + lx, y + ly, rr, rr * open, 0, 0, TAU)
    ctx.fill()
    if (open > 0.5) {
      ctx.beginPath()
      ctx.arc(x + lx + rr * 0.36, y + ly - rr * 0.36 * open, rr * shine, 0, TAU)
      ctx.fillStyle = '#fff'
      ctx.fill()
      ctx.beginPath()
      ctx.arc(x + lx - rr * 0.32, y + ly + rr * 0.4 * open, rr * shine * 0.45, 0, TAU)
      ctx.globalAlpha = 0.8
      ctx.fill()
      ctx.globalAlpha = 1
      ctx.fillStyle = ink
    }
  }
  switch (p.eye) {
    case 'dot':
      dot(r, clamp(p.eyeOpen, 0, 1), 0.34)
      break
    case 'wide':
      dot(r * 1.3, 1, 0.4)
      ctx.beginPath()
      ctx.arc(x + lx - r * 0.45, y + ly + r * 0.45, r * 0.16, 0, TAU)
      ctx.fillStyle = '#fff'
      ctx.fill()
      break
    case 'teary':
      dot(r * 1.18, 1, 0.42)
      ctx.beginPath()
      ctx.arc(x + lx - r * 0.4, y + ly + r * 0.42, r * 0.2, 0, TAU)
      ctx.fillStyle = '#fff'
      ctx.fill()
      ctx.beginPath()
      ctx.ellipse(x + side * r * 0.5, y + r * (1.8 + p.phase * 1.2), r * 0.32, r * 0.45, 0, 0, TAU)
      ctx.fillStyle = TEAR
      ctx.fill()
      break
    case 'happy':
      ctx.beginPath()
      ctx.arc(x, y + r * 0.55, r * 0.95, Math.PI * 1.15, Math.PI * 1.85)
      ctx.stroke()
      break
    case 'closed':
      ctx.beginPath()
      ctx.arc(x, y - r * 0.45, r * 0.95, Math.PI * 0.15, Math.PI * 0.85)
      ctx.stroke()
      break
    case 'squint': {
      const d = side < 0 ? 1 : -1
      ctx.beginPath()
      ctx.moveTo(x - d * r, y - r * 0.85)
      ctx.lineTo(x + d * r * 0.75, y)
      ctx.lineTo(x - d * r, y + r * 0.85)
      ctx.stroke()
      break
    }
    case 'x':
      ctx.beginPath()
      ctx.moveTo(x - r * 0.85, y - r * 0.85)
      ctx.lineTo(x + r * 0.85, y + r * 0.85)
      ctx.moveTo(x + r * 0.85, y - r * 0.85)
      ctx.lineTo(x - r * 0.85, y + r * 0.85)
      ctx.stroke()
      break
    case 'spiral': {
      ctx.beginPath()
      const turns = 2.2
      for (let i = 0; i <= 40; i++) {
        const t = i / 40
        const a = t * turns * TAU + p.phase * TAU * side
        const rr = r * 1.15 * t
        const px = x + Math.cos(a) * rr
        const py = y + Math.sin(a) * rr
        if (i === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      }
      ctx.lineWidth = sw
      ctx.stroke()
      break
    }
    case 'star': {
      ctx.beginPath()
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * TAU - Math.PI / 2
        const rr = i % 2 ? r * 0.55 : r * 1.35
        ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr)
      }
      ctx.closePath()
      ctx.fill()
      break
    }
    case 'angry':
      dot(r, 1, 0.3)
      ctx.beginPath()
      ctx.moveTo(x - side * r * 1.25, y - r * 1.55)
      ctx.lineTo(x + side * r * 1.1, y - r * 0.95)
      ctx.lineWidth = sw * 1.2
      ctx.stroke()
      break
  }
}

const mouth = (ctx: CanvasRenderingContext2D, mx: number, my: number, p: Pose, look: Appearance, sw: number) => {
  ctx.strokeStyle = look.eyes
  ctx.fillStyle = look.eyes
  ctx.lineWidth = sw
  const w = 0.048
  const o = clamp(p.mouthOpen, 0, 1)
  switch (p.mouth) {
    case 'w':
    case 'tongue':
      if (p.mouth === 'tongue') {
        ctx.beginPath()
        ctx.ellipse(mx, my + 0.024, 0.02, 0.022, 0, 0, TAU)
        ctx.fillStyle = TONGUE
        ctx.fill()
      }
      ctx.beginPath()
      ctx.moveTo(mx - w, my)
      ctx.quadraticCurveTo(mx - w / 2, my + 0.032, mx, my)
      ctx.quadraticCurveTo(mx + w / 2, my + 0.032, mx + w, my)
      ctx.stroke()
      break
    case 'smile':
      ctx.beginPath()
      ctx.arc(mx, my - 0.012, 0.042, Math.PI * 0.18, Math.PI * 0.82)
      ctx.stroke()
      break
    case 'o':
      ctx.beginPath()
      ctx.ellipse(mx, my + 0.024, 0.016 + 0.014 * o, 0.018 + 0.018 * o, 0, 0, TAU)
      ctx.fill()
      break
    case 'open': {
      const h = 0.03 + 0.03 * o
      ctx.beginPath()
      ctx.moveTo(mx - 0.045, my)
      ctx.ellipse(mx, my, 0.045, h, 0, 0, Math.PI)
      ctx.closePath()
      ctx.fill()
      ctx.beginPath()
      ctx.ellipse(mx, my + h * 0.72, 0.022, h * 0.32, 0, 0, TAU)
      ctx.fillStyle = TONGUE
      ctx.fill()
      break
    }
    case 'flat':
      ctx.beginPath()
      ctx.moveTo(mx - 0.032, my + 0.014)
      ctx.lineTo(mx + 0.032, my + 0.014)
      ctx.stroke()
      break
    case 'frown':
      ctx.beginPath()
      ctx.arc(mx, my + 0.055, 0.036, Math.PI * 1.22, Math.PI * 1.78)
      ctx.stroke()
      break
    case 'none':
      break
  }
}

type O = { x: number; y: number; rx: number; ry: number }

interface FaceGeo {
  muzzle: O
  pouch: boolean
  blush: O
  eyeN: O
  eyeF: O
  nose: O
  mouth: { x: number; y: number; s: number }
}

const FACES: Record<FaceStyle, FaceGeo> = {
  mochi: {
    muzzle: { x: 0.43, y: 0.32, rx: 0.085, ry: 0.062 },
    pouch: false,
    blush: { x: 0.16, y: 0.325, rx: 0.055, ry: 0.03 },
    eyeN: { x: 0.23, y: 0.24, rx: 0.046, ry: 0.058 },
    eyeF: { x: 0.43, y: 0.235, rx: 0.032, ry: 0.052 },
    nose: { x: 0.478, y: 0.295, rx: 0.021, ry: 0.015 },
    mouth: { x: 0.462, y: 0.33, s: 0.52 },
  },
  classic: {
    muzzle: { x: 0.34, y: 0.33, rx: 0.17, ry: 0.13 },
    pouch: false,
    blush: { x: 0.14, y: 0.31, rx: 0.06, ry: 0.035 },
    eyeN: { x: 0.2, y: 0.21, rx: 0.045, ry: 0.045 },
    eyeF: { x: 0.42, y: 0.205, rx: 0.032, ry: 0.037 },
    nose: { x: 0.475, y: 0.29, rx: 0.026, ry: 0.019 },
    mouth: { x: 0.445, y: 0.33, s: 0.62 },
  },
  pouch: {
    muzzle: { x: 0.36, y: 0.37, rx: 0.17, ry: 0.15 },
    pouch: true,
    blush: { x: 0.27, y: 0.35, rx: 0.05, ry: 0.03 },
    eyeN: { x: 0.22, y: 0.18, rx: 0.04, ry: 0.044 },
    eyeF: { x: 0.43, y: 0.175, rx: 0.03, ry: 0.04 },
    nose: { x: 0.49, y: 0.25, rx: 0.024, ry: 0.018 },
    mouth: { x: 0.465, y: 0.29, s: 0.52 },
  },
}

const PIVOT = { x: 0.32, y: 0.3 }

const oval = (ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, fill: string) => {
  ctx.beginPath()
  ctx.ellipse(x, y, rx, ry, 0, 0, TAU)
  ctx.fillStyle = fill
  ctx.fill()
}

export const drawSeed = (ctx: CanvasRenderingContext2D, x: number, y: number, s = 1) => {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(0.5)
  ctx.scale(s, s)
  oval(ctx, 0, 0, 0.042, 0.07, '#4b4039')
  ctx.beginPath()
  ctx.moveTo(-0.014, -0.05)
  ctx.lineTo(-0.014, 0.05)
  ctx.moveTo(0.016, -0.045)
  ctx.lineTo(0.016, 0.045)
  ctx.lineWidth = 0.008
  ctx.strokeStyle = '#efe6dc'
  ctx.stroke()
  ctx.restore()
}

const drawEye = (ctx: CanvasRenderingContext2D, e: O, k: number, side: -1 | 1, p: Pose, look: Appearance, sw: number) => {
  ctx.save()
  ctx.translate(e.x, e.y)
  ctx.scale(1, e.ry / e.rx)
  eye(ctx, 0, 0, e.rx * k, side, p, look, (sw * e.rx) / e.ry)
  ctx.restore()
}

export const drawFace = (
  ctx: CanvasRenderingContext2D,
  p: Pose,
  look: Appearance,
  yt: number,
  rot: number,
  clip: Path2D | null,
) => {
  const g = FACES[look.face] ?? FACES.mochi
  const sw = 0.016
  const t = p.tilt - rot * p.upright
  const enter = () => {
    ctx.translate(p.fx, yt + p.fy)
    if (t) {
      ctx.translate(PIVOT.x, PIVOT.y)
      ctx.rotate(t)
      ctx.translate(-PIVOT.x, -PIVOT.y)
    }
  }
  const m = g.muzzle
  const k = 1 + p.cheek * 0.28
  ctx.save()
  if (g.pouch && clip) ctx.clip(clip)
  enter()
  oval(ctx, m.x - p.cheek * 0.02, m.y + p.cheek * 0.015, m.rx * k, m.ry * k, look.belly)
  ctx.restore()

  ctx.save()
  enter()
  const b = g.blush
  const cs = look.cheekSize * (1 + 0.3 * p.blush)
  ctx.globalAlpha = clamp(0.5 + p.blush * 0.5, 0, 1)
  oval(ctx, b.x - p.cheek * 0.03, b.y, b.rx * cs, b.ry * cs, look.blush)
  ctx.globalAlpha = 1

  drawEye(ctx, g.eyeN, look.eyeSize, -1, p, look, sw)
  drawEye(ctx, g.eyeF, look.eyeSize, 1, p, look, sw)
  oval(ctx, g.nose.x, g.nose.y, g.nose.rx, g.nose.ry, look.nose)

  ctx.save()
  ctx.translate(g.mouth.x, g.mouth.y)
  ctx.scale(g.mouth.s, g.mouth.s)
  mouth(ctx, 0, 0, p, look, sw / g.mouth.s)
  ctx.restore()

  if (look.whiskers) {
    const wx = g.nose.x - 0.01
    ctx.beginPath()
    ctx.moveTo(wx, g.mouth.y - 0.02)
    ctx.lineTo(wx + 0.14, g.mouth.y - 0.05)
    ctx.moveTo(wx, g.mouth.y + 0.01)
    ctx.lineTo(wx + 0.14, g.mouth.y + 0.02)
    ctx.lineWidth = sw * 0.6
    ctx.strokeStyle = look.line
    ctx.globalAlpha = 0.45
    ctx.stroke()
    ctx.globalAlpha = 1
  }
  if (p.prop === 'seed') drawSeed(ctx, 0.5, m.y + 0.1, 1.1)
  ctx.restore()
}
