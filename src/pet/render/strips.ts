import type { Appearance } from '../config'
import { ANIMS, type AnimName } from './anims'
import { boxOf } from './anims/types'
import { drawHamster } from './layers'
import { makePose } from './pose'

export interface Strip {
  name: AnimName
  canvas: HTMLCanvasElement
  frames: number
  fw: number
  fh: number
  ax: number
  ay: number
}

const PINNED = new Set<AnimName>(['idle', 'walk', 'run', 'crouch', 'jumpUp', 'jumpDown', 'fall', 'land'])

export const bakeStrip = (name: AnimName, look: Appearance, u: number, dpr: number): Strip => {
  const def = ANIMS[name]
  const box = boxOf(def)
  const fw = Math.ceil(box.w * u * dpr)
  const fh = Math.ceil((box.up + box.down) * u * dpr)
  const ax = Math.round(fw / 2)
  const ay = Math.round(box.up * u * dpr)
  const canvas = document.createElement('canvas')
  canvas.width = fw * def.frames
  canvas.height = fh
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('pet-pet: 2d context unavailable')
  for (let i = 0; i < def.frames; i++) {
    const p = def.loop ? i / def.frames : def.frames > 1 ? i / (def.frames - 1) : 1
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.save()
    ctx.beginPath()
    ctx.rect(i * fw, 0, fw, fh)
    ctx.clip()
    ctx.setTransform(dpr, 0, 0, dpr, i * fw + ax, ay)
    drawHamster(ctx, makePose(def.pose(p, i)), look, u)
    ctx.restore()
  }
  return { name, canvas, frames: def.frames, fw, fh, ax, ay }
}

export class SpriteBank {
  private cache = new Map<AnimName, Strip>()
  private pixels = 0
  private look: Appearance
  private u: number
  private dpr: number
  private budget: number
  private key: string

  constructor(look: Appearance, u: number, dpr: number, budget = 12e6) {
    this.look = look
    this.u = u
    this.dpr = dpr
    this.budget = budget
    this.key = JSON.stringify([look, u, dpr])
  }

  configure(look: Appearance, u: number, dpr: number) {
    const key = JSON.stringify([look, u, dpr])
    if (key === this.key) return false
    this.key = key
    this.look = look
    this.u = u
    this.dpr = dpr
    this.clear()
    return true
  }

  clear() {
    for (const s of this.cache.values()) s.canvas.width = 0
    this.cache.clear()
    this.pixels = 0
  }

  get(name: AnimName): Strip {
    const hit = this.cache.get(name)
    if (hit) {
      this.cache.delete(name)
      this.cache.set(name, hit)
      return hit
    }
    const strip = bakeStrip(name, this.look, this.u, this.dpr)
    this.cache.set(name, strip)
    this.pixels += strip.canvas.width * strip.canvas.height
    this.evict()
    return strip
  }

  prewarm(names: Iterable<AnimName> = PINNED) {
    for (const n of names) this.get(n)
  }

  get size() {
    return { strips: this.cache.size, pixels: this.pixels }
  }

  private evict() {
    for (const [name, s] of this.cache) {
      if (this.pixels <= this.budget) return
      if (PINNED.has(name)) continue
      this.cache.delete(name)
      this.pixels -= s.canvas.width * s.canvas.height
      s.canvas.width = 0
    }
  }
}
