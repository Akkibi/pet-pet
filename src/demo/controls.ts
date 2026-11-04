import { button, folder, useControls } from 'leva'
import { useEffect } from 'react'
import {
  DEFAULT_CONFIG,
  PRESETS,
  REACTION_NAMES,
  SHAPES,
  type BellyStyle,
  type FaceStyle,
  type Pet,
  type PresetName,
  type ShapeName,
} from '../pet'

const A = DEFAULT_CONFIG.appearance
const P = DEFAULT_CONFIG.physics
const B = DEFAULT_CONFIG.behavior

export const LEVA_THEME = {
  colors: {
    elevation1: '#efe5d8',
    elevation2: '#fffdf9',
    elevation3: '#f6eee3',
    accent1: '#f4b66a',
    accent2: '#e39a45',
    accent3: '#ffd29a',
    highlight1: '#a8988a',
    highlight2: '#6b5546',
    highlight3: '#3b2a20',
    vivid1: '#ff8fa3',
    folderWidgetColor: '#e39a45',
    folderTextColor: '#3b2a20',
    toolTipBackground: '#3b2a20',
    toolTipText: '#fffdf9',
  },
  radii: { xs: '6px', sm: '8px', lg: '14px' },
  fonts: { sans: "ui-rounded, 'SF Pro Rounded', 'Nunito', system-ui, sans-serif" },
}

const SHAPE_OPTIONS: Record<string, ShapeName> = {
  'Mix A + D': 'soft',
  'Pain moelleux': 'loaf',
  'Tête marquée': 'head',
  'Rayure dorsale': 'stripe',
  'Bloc minimal': 'block',
}

const range = (value: number, min: number, max: number, step = 0.01) => ({ value, min, max, step })

export function usePetControls(pet: Pet | null) {
  const [look, setLook] = useControls('Apparence', () => ({
    taille: { ...range(10, 4, 24, 0.5), label: 'taille (vh)' },
    pelage: { value: 'golden', options: Object.keys(PRESETS) },
    forme: { value: 'soft' as ShapeName, options: SHAPE_OPTIONS },
    visage: { value: A.face, options: { mochi: 'mochi', classique: 'classic', bajoues: 'pouch' } as Record<string, FaceStyle> },
    Couleurs: folder(
      { fur: A.fur, belly: A.belly, paws: A.paws, inner: A.inner, blush: A.blush, eyes: A.eyes, nose: A.nose, line: A.line },
      { collapsed: true },
    ),
    Silhouette: folder(
      {
        roundness: range(A.roundness, 0, 0.5),
        chubby: range(A.chubby, 0.7, 1.35),
        legLength: range(A.legLength, 0.3, 2.2),
        headBump: range(A.headBump, 0, 1),
        stripe: A.stripe,
        bellyStyle: { value: A.bellyStyle, options: { ellipse: 'patch', bande: 'band', aucun: 'none' } as Record<string, BellyStyle> },
        bellyWidth: range(A.bellyWidth, 0.1, 0.5),
      },
      { collapsed: true },
    ),
    Visage: folder(
      {
        earSize: range(A.earSize, 0.5, 1.6),
        eyeSize: range(A.eyeSize, 0.6, 1.7),
        cheekSize: range(A.cheekSize, 0, 2),
        whiskers: A.whiskers,
      },
      { collapsed: true },
    ),
  }))

  useEffect(() => setLook({ ...PRESETS[look.pelage as PresetName] }), [look.pelage, setLook])
  useEffect(() => setLook({ ...SHAPES[look.forme] }), [look.forme, setLook])

  const physics = useControls(
    'Physique',
    {
      gravity: range(P.gravity, 10, 80, 0.5),
      jumpHeight: range(P.jumpHeight, 1, 8, 0.1),
      jumpReach: range(P.jumpReach, 1, 10, 0.1),
      walkSpeed: range(P.walkSpeed, 0.3, 3, 0.05),
      runSpeed: range(P.runSpeed, 1, 8, 0.1),
      bounce: range(P.bounce, 0, 0.95),
      friction: range(P.friction, 0, 1),
      airDrag: range(P.airDrag, 0, 0.3),
      dragStiffness: range(P.dragStiffness, 0.05, 1),
      limbStiffness: range(P.limbStiffness, 0.05, 1),
      dizzyImpact: range(P.dizzyImpact, 5, 60, 0.5),
    },
    { collapsed: true },
  )

  const behavior = useControls(
    'Comportement',
    {
      followCursor: B.followCursor,
      followRadius: range(B.followRadius, 40, 600, 10),
      startle: B.startle,
      petting: B.petting,
      stroke: B.stroke,
      watchTyping: B.watchTyping,
      activity: range(B.activity, 0, 1),
      explore: range(B.explore, 0, 1),
      sleepiness: range(B.sleepiness, 0, 1),
      clumsiness: range(B.clumsiness, 0, 1),
    },
    { collapsed: true },
  )

  useControls(
    'Réactions',
    Object.fromEntries(REACTION_NAMES.map((n) => [n, button(() => void pet?.react(n))])),
    { collapsed: true },
    [pet],
  )

  useControls('Actions', {
    'nourrir 🌻': button(() => pet?.feed()),
    dodo: button(() => pet?.sleep()),
    réveil: button(() => pet?.wake()),
    'dire bonjour': button(() => pet?.say('Coucou !')),
    rescanner: button(() => pet?.refresh()),
  }, [pet])

  const debug = useControls('Debug', { surfaces: false, state: false }, { collapsed: true })

  const { taille, pelage: _p, forme: _f, visage, ...appearance } = look
  const key = JSON.stringify([taille, appearance, physics, behavior, debug, visage])
  useEffect(() => {
    const [size, a, ph, be, db, v] = JSON.parse(key)
    pet?.set({ size: `${size}vh`, appearance: { ...a, face: v }, physics: ph, behavior: be, debug: db })
  }, [pet, key])
}
