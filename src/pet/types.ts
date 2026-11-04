export interface Vec {
  x: number
  y: number
}

export interface Rect {
  left: number
  top: number
  right: number
  bottom: number
}

export type Facing = 1 | -1

export interface Surface {
  id: string
  el: Element | null
  top: number
  left: number
  right: number
  ex: number
}

export const REACTION_NAMES = [
  'approve',
  'cancel',
  'delete',
  'error',
  'success',
  'warning',
  'thinking',
  'love',
  'wave',
  'surprised',
  'confused',
  'sad',
] as const

export type ReactionName = (typeof REACTION_NAMES)[number]

export type ReactionAlias = 'hello' | 'celebrate' | 'loading' | 'ok' | 'no'

export type PetEventName =
  | 'pet'
  | 'grab'
  | 'throw'
  | 'impact'
  | 'land'
  | 'state'
  | 'react'
  | 'eat'
  | 'sleep'
  | 'wake'

export interface PetEventMap {
  pet: { count: number }
  grab: { part: string }
  throw: { speed: number }
  impact: { speed: number; x: number; y: number }
  land: { surface: Surface; height: number }
  state: { task: string; anim: string }
  react: { name: ReactionName }
  eat: { x: number; y: number }
  sleep: Record<string, never>
  wake: Record<string, never>
}
