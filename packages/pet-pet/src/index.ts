import type { PetOptions } from './config'
import { Pet } from './Pet'

export const createPet = (options?: PetOptions) => new Pet(options)

export { Pet, type PetState } from './Pet'
export { resolveReaction, type Listener } from './events'
export {
  DEFAULT_CONFIG,
  PRESETS,
  SHAPES,
  mergeConfig,
  type Appearance,
  type Behavior,
  type BellyStyle,
  type FaceStyle,
  type ConfigPatch,
  type Debug,
  type Motion,
  type Palette,
  type PetConfig,
  type PetOptions,
  type Physics,
  type Platforms,
  type PresetName,
  type Shape,
  type ShapeName,
} from './config'
export { REACTION_NAMES, type PetEventMap, type PetEventName, type ReactionAlias, type ReactionName } from './types'
export { REACTION_ALIASES } from './render/anims'
export type { SizeSpec } from './world/bounds'
export type { ReactOptions } from './brain/social'
