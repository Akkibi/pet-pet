import { useEffect, useRef, useState, type RefObject } from 'react'
import { Pet, type ConfigPatch, type PetOptions } from 'pet-pet'

type Target<T> = T | null | undefined | RefObject<T | null>

export interface UsePetOptions extends ConfigPatch {
  container?: Target<HTMLElement>
  root?: Target<ParentNode>
  spawn?: PetOptions['spawn']
}

export interface HamsterPetProps extends UsePetOptions {
  onReady?: (pet: Pet) => void
}

const resolve = <T extends object>(t: Target<T>): T | null => (t && 'current' in t ? t.current : (t ?? null))

export function usePet(options: UsePetOptions = {}): Pet | null {
  const { container, root, spawn, ...config } = options
  const [pet, setPet] = useState<Pet | null>(null)
  const key = JSON.stringify(config)
  const latest = useRef({ config, spawn, key })
  const applied = useRef(key)

  useEffect(() => {
    latest.current = { config, spawn, key }
  })

  useEffect(() => {
    const { config, spawn, key } = latest.current
    const p = new Pet({ ...config, spawn, container: resolve(container), root: resolve(root) ?? undefined })
    applied.current = key
    setPet(p)
    return () => {
      p.destroy()
      setPet(null)
    }
  }, [container, root])

  useEffect(() => {
    if (!pet || applied.current === key) return
    applied.current = key
    pet.set(latest.current.config)
  }, [pet, key])

  return pet
}

export function HamsterPet({ onReady, ...options }: HamsterPetProps) {
  const pet = usePet(options)
  const ready = useRef(onReady)
  useEffect(() => {
    ready.current = onReady
  })
  useEffect(() => {
    if (pet) ready.current?.(pet)
  }, [pet])
  return null
}
