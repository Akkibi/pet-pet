import type { PetConfig } from '../config'
import type { Fx } from '../fx/Fx'
import type { FxKind } from '../fx/icons'
import type { Seed } from '../fx/Seed'
import type { Cursor } from '../input/PointerInput'
import type { Body } from '../physics/Body'
import type { AnimPlayer } from '../render/AnimPlayer'
import type { PetEventMap, PetEventName, Surface } from '../types'
import type { World } from '../world/World'

export interface Landing {
  kind: 'land' | 'ledge'
  surface: Surface
  height: number
}

export interface PetCtx {
  cfg: PetConfig
  u: number
  now: number
  body: Body
  world: World
  anim: AnimPlayer
  fx: Fx
  cursor: Cursor
  seeds: Seed[]
  landing: Landing | null
  emit: <K extends PetEventName>(name: K, data: PetEventMap[K]) => void
  say: (text: string, ms?: number) => void
  spawn: (kind: FxKind, dx?: number, dy?: number) => void
}

export const headPoint = (c: PetCtx) => ({
  x: c.body.x + c.body.facing * c.u * 0.3,
  y: c.body.y - c.u * 0.78,
})
