import type { Appearance } from '../config'
import { drawFace } from './face'
import { GEO, TAU, bodyY, lerp, type Pose } from './pose'

type M = [number, number, number, number, number, number]
type P = { x: number; y: number }

const mul = (m: M, n: M): M => [
  m[0] * n[0] + m[2] * n[1],
  m[1] * n[0] + m[3] * n[1],
  m[0] * n[2] + m[2] * n[3],
  m[1] * n[2] + m[3] * n[3],
  m[0] * n[4] + m[2] * n[5] + m[4],
  m[1] * n[4] + m[3] * n[5] + m[5],
]
const tr = (x: number, y: number): M => [1, 0, 0, 1, x, y]
const ap = (m: M, x: number, y: number): P => ({ x: m[0] * x + m[2] * y + m[4], y: m[1] * x + m[3] * y + m[5] })
const mix = (a: P, b: P, t: number): P => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) })

const rgb = (c: string) => {
  const h = c.replace('#', '')
  const f = h.length === 3 ? h.replace(/./g, '$&$&') : h
  const n = parseInt(f.slice(0, 6), 16) || 0
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
const blend = (a: string, b: string, t: number) => {
  const x = rgb(a)
  const y = rgb(b)
  return `rgb(${x.map((v, i) => Math.round(lerp(v, y[i], t))).join(',')})`
}

const tones = new WeakMap<Appearance, { shade: string; stripe: string }>()
const toneOf = (look: Appearance) => {
  let t = tones.get(look)
  if (!t) {
    t = { shade: blend(look.fur, look.line, 0.12), stripe: blend(look.fur, look.line, 0.32) }
    tones.set(look, t)
  }
  return t
}

const bodyMatrix = (p: Pose, yb: number): M => {
  const px = p.piv * 0.45
  const c = Math.cos(p.rot)
  const s = Math.sin(p.rot)
  let m = tr(p.bx + px, p.by + yb)
  m = mul(m, [c, s, -s, c, 0, 0])
  m = mul(m, tr(-px, 0))
  m = mul(m, [p.sx, 0, -p.lean * p.sx, p.sy, 0, 0])
  return mul(m, tr(0, -yb))
}

const circle = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number, fill: string) => {
  ctx.beginPath()
  ctx.arc(x, y, r, 0, TAU)
  ctx.fillStyle = fill
  ctx.fill()
}

const drawLegs = (ctx: CanvasRenderingContext2D, p: Pose, look: Appearance, m: M, yb: number, near: boolean, color: string) => {
  const offs = [p.fbx, p.fby, p.ffx, p.ffy, p.nbx, p.nby, p.nfx, p.nfy]
  ctx.lineCap = 'round'
  ctx.lineWidth = GEO.legW
  for (const i of near ? [2, 3] : [0, 1]) {
    const hx = GEO.hips[i]
    const ox = offs[i * 2]
    const oy = offs[i * 2 + 1]
    const front = i % 2 === 1
    const hip = ap(m, hx, yb - 0.07)
    let foot: P
    if (p.feet) foot = { x: p.feet[i * 2], y: p.feet[i * 2 + 1] }
    else if (p.back) foot = ap(m, hx + ox, 0.06 + oy)
    else {
      foot = mix({ x: hx + ox, y: -GEO.cap + oy }, ap(m, hx + ox, -GEO.cap + oy), front ? p.float * (1 - p.grip) : p.float)
      if (front && p.arm > 0) foot = mix(foot, ap(m, hx + 0.08 + ox, yb + 0.02 + oy), p.arm)
    }
    ctx.beginPath()
    ctx.moveTo(hip.x, hip.y)
    ctx.lineTo(foot.x, foot.y + 1e-4)
    ctx.strokeStyle = color
    ctx.stroke()
    const dx = foot.x - hip.x
    const dy = foot.y - hip.y
    const l = Math.hypot(dx, dy) || 1
    ctx.beginPath()
    ctx.ellipse(foot.x + (dx / l) * 0.042, foot.y + (dy / l) * 0.042, 0.054, 0.021, Math.atan2(dy, dx) - Math.PI / 2, 0, TAU)
    ctx.fillStyle = look.paws
    ctx.fill()
  }
}

const drawEar = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number, rot: number, look: Appearance) => {
  ctx.save()
  ctx.translate(x, y + r * 0.6)
  ctx.rotate(rot)
  circle(ctx, 0, -r * 0.6, r, look.fur)
  circle(ctx, 0, -r * 0.6 + 0.01, r * 0.5, look.inner)
  ctx.restore()
}

const paths = new WeakMap<Appearance, Path2D>()
const bodyPath = (look: Appearance, yt: number, yb: number) => {
  let path = paths.get(look)
  if (!path) {
    const h = yb - yt
    path = new Path2D()
    path.roundRect(-GEO.halfW, yt, GEO.halfW * 2, h, Math.min(h / 2, look.roundness * h))
    paths.set(look, path)
  }
  return path
}

const drawBody = (ctx: CanvasRenderingContext2D, p: Pose, look: Appearance, yt: number, yb: number) => {
  const tone = toneOf(look)
  const w = GEO.halfW
  const h = yb - yt
  const k = h / GEO.bodyH
  const hb = look.headBump
  if (!p.back) {
    const lift = hb * 0.1
    drawEar(ctx, 0.36, yt - 0.005 - lift, 0.075 * look.earSize, p.earF - p.earDown * 0.8, look)
    drawEar(ctx, 0.1 + hb * 0.06, yt + 0.02 - lift * 0.7, 0.085 * look.earSize, p.earN - p.earDown * 0.8, look)
  }
  ctx.beginPath()
  ctx.ellipse(-0.53, yt + 0.34 * k + p.tail * 0.02, 0.045, 0.04, 0, 0, TAU)
  ctx.fillStyle = look.fur
  ctx.fill()
  if (hb > 0.01) circle(ctx, 0.28, yt + 0.24 - 0.06 * hb, 0.2 + 0.08 * hb, look.fur)
  const shape = bodyPath(look, yt, yb)
  ctx.fillStyle = look.fur
  ctx.fill(shape)
  if (look.bellyStyle !== 'none') {
    ctx.save()
    ctx.clip(shape)
    ctx.fillStyle = look.belly
    if (look.bellyStyle === 'band') ctx.fillRect(-w - 0.1, yt + h * 0.655, w * 2 + 0.2, h)
    else {
      ctx.beginPath()
      ctx.ellipse(0.02, yb + 0.02, look.bellyWidth, 0.2 * k, 0, 0, TAU)
      ctx.fill()
    }
    ctx.restore()
  }
  if (look.stripe) {
    ctx.beginPath()
    ctx.moveTo(-0.44, yt + 0.07)
    ctx.quadraticCurveTo(-0.08, yt - 0.03, 0.26 - hb * 0.06, yt + 0.05)
    ctx.lineWidth = 0.035
    ctx.lineCap = 'round'
    ctx.strokeStyle = tone.stripe
    ctx.stroke()
  }
  ctx.beginPath()
  ctx.ellipse(-0.2, yt + 0.12, 0.2, 0.06, 0, 0, TAU)
  ctx.globalAlpha = 0.18
  ctx.fillStyle = '#fff'
  ctx.fill()
  ctx.globalAlpha = 1
}

export const drawHamster = (ctx: CanvasRenderingContext2D, p: Pose, look: Appearance, u: number) => {
  const { yb, yt } = bodyY(look)
  const tone = toneOf(look)
  const m = bodyMatrix(p, yb)
  const body = p.back ? mul(m, [1, 0, 0, -1, 0, yt]) : m
  ctx.save()
  ctx.scale(u, u)
  drawLegs(ctx, p, look, body, yb, false, tone.shade)
  ctx.save()
  ctx.transform(...body)
  drawBody(ctx, p, look, yt, yb)
  ctx.restore()
  ctx.save()
  ctx.transform(...(p.back ? mul(m, tr(0, -yb + 0.06)) : m))
  drawFace(ctx, p, look, yt, p.rot, p.back ? null : bodyPath(look, yt, yb))
  ctx.restore()
  drawLegs(ctx, p, look, body, yb, true, look.fur)
  ctx.restore()
}
