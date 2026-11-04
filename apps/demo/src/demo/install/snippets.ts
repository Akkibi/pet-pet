export const VERSION = '0.1.0'
export const DIST: 'npm' | 'github' = 'npm'
export const REACT_WRAPPER = true

const TARBALL = `https://github.com/Akkibi/pet-pet/releases/download/v${VERSION}/pet-pet-${VERSION}.tgz`
const SPEC = DIST === 'npm' ? 'pet-pet' : TARBALL

export const INSTALL = [
  { id: 'yarn', label: 'yarn', code: `yarn add ${SPEC}` },
  { id: 'npm', label: 'npm', code: `npm install ${SPEC}` },
  { id: 'pnpm', label: 'pnpm', code: `pnpm add ${SPEC}` },
]

export const VANILLA = `import { createPet } from 'pet-pet'

const pet = createPet({
  container: document.querySelector('main'), // optional, defaults to the viewport
  size: '10vh',
})

pet.react('success', { say: 'Saved!' })`

export const ATTRIBUTES = `<button data-pet-react="approve" data-pet-say="Nice!">Save</button>
<button data-pet-react="delete">Delete</button>

<section data-pet-platform>always a platform</section>
<aside data-pet-ignore>never a platform</aside>`

export const REACT = REACT_WRAPPER
  ? `import { useRef } from 'react'
import { usePet } from 'pet-pet/react'

export function App() {
  const main = useRef<HTMLElement>(null)
  const pet = usePet({ container: main, preset: 'golden' })

  return (
    <main ref={main}>
      <button onClick={() => pet?.react('approve')}>Save</button>
    </main>
  )
}`
  : `import { useEffect, useRef, useState } from 'react'
import { createPet, type Pet } from 'pet-pet'

export function App() {
  const main = useRef<HTMLElement>(null)
  const [pet, setPet] = useState<Pet | null>(null)

  useEffect(() => {
    const p = createPet({ container: main.current })
    setPet(p)
    return () => p.destroy()
  }, [])

  return (
    <main ref={main}>
      <button onClick={() => pet?.react('approve')}>Save</button>
    </main>
  )
}`

export const SCRIPT =
  DIST === 'npm'
    ? `<script src="https://unpkg.com/pet-pet@${VERSION.split('.').slice(0, 2).join('.')}"></script>
<script>
  const pet = PetPet.createPet({ size: '10vh' })
</script>`
    : null

export const EVENTS = `pet.on('pet', ({ count }) => console.log('petted', count))
pet.on('throw', ({ speed }) => console.log('wheee', speed))

pet.set({ preset: 'choco', behavior: { followCursor: false } })
pet.destroy()`

export const OPTIONS: [string, string][] = [
  ['container', 'Zone où il vit (par défaut : la fenêtre).'],
  ['root', 'Sous-arbre DOM scanné pour trouver les plateformes.'],
  ['size', "Longueur du corps : '10vh', '64px', 80…"],
  ['preset · shape', 'Pelage (golden grey cream choco) et silhouette (soft loaf head stripe block).'],
  ['appearance', 'Couleurs, oreilles, yeux, joues, visage (mochi classic pouch).'],
  ['physics · behavior', 'Saut, gravité, rebond · suivi du curseur, sieste, curiosité.'],
  ['motion', 'Durée des fondus entre animations et des demi-tours.'],
  ['platforms', 'Sélecteurs des éléments à escalader ou à ignorer.'],
]

export const METHODS: [string, string][] = [
  ['react(name, { say })', 'Joue une réaction : approve, cancel, delete, error, success…'],
  ['say(text)', 'Bulle de dialogue.'],
  ['goTo(el)', 'Va se poser sur un élément.'],
  ['feed()', 'Lâche une graine.'],
  ['sleep() · wake()', 'Sieste et réveil.'],
  ['set(patch)', 'Change la config en direct.'],
  ['on(event, fn)', 'pet, grab, throw, impact, land, react, eat, sleep, wake, state.'],
  ['refresh() · destroy()', 'Rescanne les plateformes · retire le hamster.'],
]
