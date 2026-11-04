import type { Pose } from '../pose'

export interface AnimBox {
  w: number
  up: number
  down: number
}

export interface AnimDef {
  frames: number
  fps: number
  loop: boolean
  box?: Partial<AnimBox>
  ease?: number
  pose: (p: number, i: number) => Partial<Pose>
}

export const DEFAULT_BOX: AnimBox = { w: 1.5, up: 1.05, down: 0.1 }

export const boxOf = (def: AnimDef): AnimBox => ({ ...DEFAULT_BOX, ...def.box })
