import { idleExtras } from './idle'
import { interactions } from './interact'
import { locomotion } from './locomotion'
import { reactions } from './reactions'
import type { AnimDef } from './types'

export const ANIMS = {
  ...locomotion,
  ...idleExtras,
  ...interactions,
  ...reactions,
}

export type AnimName = keyof typeof ANIMS

export const getAnim = (name: AnimName): AnimDef => ANIMS[name]

export const ANIM_NAMES = Object.keys(ANIMS) as AnimName[]

export { REACTION_ALIASES } from './reactions'
export type { AnimDef } from './types'
