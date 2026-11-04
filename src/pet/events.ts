import { REACTION_ALIASES } from './render/anims'
import { REACTION_NAMES, type PetEventMap, type PetEventName, type ReactionName } from './types'

export type Listener<K extends PetEventName> = (data: PetEventMap[K]) => void
type AnyListener = (data: unknown) => void

export class Emitter {
  private map = new Map<PetEventName, Set<AnyListener>>()

  emit = <K extends PetEventName>(name: K, data: PetEventMap[K]) => {
    this.map.get(name)?.forEach((fn) => fn(data))
  }

  on<K extends PetEventName>(name: K, fn: Listener<K>): () => void {
    let set = this.map.get(name)
    if (!set) this.map.set(name, (set = new Set()))
    set.add(fn as unknown as AnyListener)
    return () => this.off(name, fn)
  }

  off<K extends PetEventName>(name: K, fn: Listener<K>) {
    this.map.get(name)?.delete(fn as unknown as AnyListener)
  }

  clear() {
    this.map.clear()
  }
}

export const resolveReaction = (name: string): ReactionName | null => {
  const n = (REACTION_ALIASES as Record<string, string>)[name] ?? name
  return (REACTION_NAMES as readonly string[]).includes(n) ? (n as ReactionName) : null
}
