import type { SizeSpec } from './world/bounds'

export interface Palette {
  fur: string
  belly: string
  line: string
  paws: string
  inner: string
  blush: string
  eyes: string
  nose: string
}

export type BellyStyle = 'patch' | 'band' | 'none'
export type FaceStyle = 'mochi' | 'classic' | 'pouch'

export interface Shape {
  roundness: number
  chubby: number
  legLength: number
  headBump: number
  stripe: boolean
  bellyStyle: BellyStyle
  bellyWidth: number
}

export interface Appearance extends Palette, Shape {
  face: FaceStyle
  earSize: number
  eyeSize: number
  cheekSize: number
  whiskers: boolean
}

export interface Physics {
  gravity: number
  jumpHeight: number
  jumpReach: number
  walkSpeed: number
  runSpeed: number
  bounce: number
  friction: number
  airDrag: number
  dragStiffness: number
  limbStiffness: number
  dizzyImpact: number
}

export interface Behavior {
  followCursor: boolean
  followRadius: number
  startle: boolean
  petting: boolean
  stroke: boolean
  activity: number
  explore: number
  sleepiness: number
  clumsiness: number
  watchTyping: boolean
}

export interface Motion {
  blend: number
  turnTime: number
}

export interface Platforms {
  auto: boolean
  selector: string
  ignore: string
  minWidth: number
}

export interface Debug {
  surfaces: boolean
  state: boolean
}

export interface PetConfig {
  size: SizeSpec
  maxDpr: number
  zIndex: number
  appearance: Appearance
  physics: Physics
  behavior: Behavior
  motion: Motion
  platforms: Platforms
  debug: Debug
}

export type PresetName = 'golden' | 'grey' | 'cream' | 'choco'

export const PRESETS: Record<PresetName, Palette> = {
  golden: { fur: '#f4b66a', belly: '#fff4e3', line: '#5b3a29', paws: '#f7a6b0', inner: '#f7a6b0', blush: '#ff8fa3', eyes: '#2b1d16', nose: '#f27b8c' },
  grey: { fur: '#bdb6b0', belly: '#fbf8f5', line: '#4a4440', paws: '#f3b3bb', inner: '#efb0b8', blush: '#ff9fb0', eyes: '#231e1b', nose: '#ee8a98' },
  cream: { fur: '#fff3e6', belly: '#ffffff', line: '#7a6252', paws: '#f9b8c0', inner: '#f9b8c0', blush: '#ff9fb2', eyes: '#2b1d16', nose: '#f28e9c' },
  choco: { fur: '#9a6a4a', belly: '#f3dcc4', line: '#3d2618', paws: '#eaa3a5', inner: '#e59a9f', blush: '#ff8f9c', eyes: '#1d120c', nose: '#e8798a' },
}

export type ShapeName = 'soft' | 'loaf' | 'head' | 'stripe' | 'block'

const SOFT: Shape = { roundness: 0.28, chubby: 1, legLength: 1, headBump: 0, stripe: false, bellyStyle: 'patch', bellyWidth: 0.3 }
const LOAF: Shape = { ...SOFT, roundness: 0.43, bellyStyle: 'band' }

export const SHAPES: Record<ShapeName, Shape> = {
  soft: SOFT,
  loaf: LOAF,
  head: { ...LOAF, headBump: 1 },
  stripe: { ...LOAF, stripe: true },
  block: { ...SOFT, roundness: 0.14, bellyStyle: 'none' },
}

export const DEFAULT_CONFIG: PetConfig = {
  size: '10vh',
  maxDpr: 2,
  zIndex: 2147483000,
  appearance: {
    ...PRESETS.golden,
    ...SOFT,
    face: 'mochi',
    earSize: 1,
    eyeSize: 1,
    cheekSize: 1,
    whiskers: false,
  },
  physics: {
    gravity: 38,
    jumpHeight: 4,
    jumpReach: 5,
    walkSpeed: 1.1,
    runSpeed: 3.4,
    bounce: 0.55,
    friction: 0.35,
    airDrag: 0.04,
    dragStiffness: 0.5,
    limbStiffness: 0.35,
    dizzyImpact: 26,
  },
  behavior: {
    followCursor: true,
    followRadius: 220,
    startle: true,
    petting: true,
    stroke: true,
    activity: 0.5,
    explore: 0.6,
    sleepiness: 0.35,
    clumsiness: 0.15,
    watchTyping: true,
  },
  motion: { blend: 1, turnTime: 0.18 },
  platforms: {
    auto: true,
    selector: '[data-pet-platform]',
    ignore: '[data-pet-ignore]',
    minWidth: 0.9,
  },
  debug: { surfaces: false, state: false },
}

export interface PetOptions {
  container?: HTMLElement | null
  root?: ParentNode
  size?: SizeSpec
  maxDpr?: number
  zIndex?: number
  preset?: PresetName
  shape?: ShapeName
  appearance?: Partial<Appearance>
  physics?: Partial<Physics>
  behavior?: Partial<Behavior>
  motion?: Partial<Motion>
  platforms?: Partial<Platforms>
  debug?: Partial<Debug>
  spawn?: { x?: number; y?: number }
}

export type ConfigPatch = Omit<PetOptions, 'container' | 'root' | 'spawn'>

export const mergeConfig = (base: PetConfig, patch: ConfigPatch): PetConfig => ({
  size: patch.size ?? base.size,
  maxDpr: patch.maxDpr ?? base.maxDpr,
  zIndex: patch.zIndex ?? base.zIndex,
  appearance: {
    ...base.appearance,
    ...(patch.preset ? PRESETS[patch.preset] : {}),
    ...(patch.shape ? SHAPES[patch.shape] : {}),
    ...patch.appearance,
  },
  physics: { ...base.physics, ...patch.physics },
  behavior: { ...base.behavior, ...patch.behavior },
  motion: { ...base.motion, ...patch.motion },
  platforms: { ...base.platforms, ...patch.platforms },
  debug: { ...base.debug, ...patch.debug },
})
