import type { Appearance } from '../config'
import type { Ragdoll } from '../physics/Ragdoll'
import { drawHamster } from './layers'
import { bodyY, makePose } from './pose'

const memo = new WeakMap<Ragdoll, { mirror: number; back: boolean }>()

export const isOnBack = (rag: Ragdoll) => memo.get(rag)?.back ?? rag.belly < 0

export const drawRagdoll = (ctx: CanvasRenderingContext2D, rag: Ragdoll, look: Appearance, u: number) => {
  const a = rag.axis
  const c = rag.center
  const st = memo.get(rag) ?? { mirror: a.x >= 0 ? 1 : -1, back: rag.belly < 0 }
  const down = a.x * st.mirror
  if (down < -0.25) st.mirror = -st.mirror
  const yx = -a.y * st.mirror
  const yy = a.x * st.mirror
  const loc: number[] = []
  let ly = 0
  for (let i = 2; i < rag.p.length; i++) {
    const dx = rag.p[i].x - c.x
    const dy = rag.p[i].y - c.y
    const y = (dx * yx + dy * yy) / u
    loc.push((dx * a.x + dy * a.y) / u, y)
    ly += y
  }
  ly /= rag.p.length - 2
  st.back = st.back ? ly < 0.08 : ly < -0.08
  memo.set(rag, st)
  const { cy, h } = bodyY(look)
  const c0 = st.back ? -h / 2 : cy
  for (let i = 1; i < loc.length; i += 2) loc[i] += c0
  const grabbed = !!rag.grab
  const fast = rag.speed > u * 6
  const pose = makePose({
    back: st.back,
    feet: loc,
    sx: 1 + 0.12 * rag.squash,
    sy: 1 - 0.18 * rag.squash,
    eye: grabbed ? 'wide' : fast ? 'squint' : 'dot',
    mouth: grabbed ? 'o' : fast ? 'open' : 'w',
    mouthOpen: 0.6,
    blush: grabbed ? 0.6 : 0.2,
    tail: Math.sin(rag.time * 12),
    earDown: fast ? 0.6 : 0.15,
    phase: (rag.time * 1.5) % 1,
  })
  ctx.rotate(Math.atan2(a.y, a.x))
  ctx.scale(1, st.mirror)
  ctx.translate(0, -c0 * u)
  drawHamster(ctx, pose, look, u)
}
