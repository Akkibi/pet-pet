import { useEffect, useRef, useState, type FormEvent } from 'react'
import type { PageProps } from '../types'

interface Item {
  id: number
  text: string
  done: boolean
}

type Filter = 'all' | 'todo' | 'done'

const FILTERS: [Filter, string][] = [
  ['all', 'Toutes'],
  ['todo', 'À faire'],
  ['done', 'Faites'],
]

const INITIAL: Item[] = [
  { id: 1, text: 'Remplir la gamelle de graines', done: true },
  { id: 2, text: 'Nettoyer la roue', done: false },
  { id: 3, text: 'Construire un tunnel en carton', done: false },
  { id: 4, text: 'Faire une sieste au soleil', done: false },
]

export default function Todo({ pet }: PageProps) {
  const [items, setItems] = useState(INITIAL)
  const [draft, setDraft] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const nextId = useRef(INITIAL.length + 1)

  const visible = items.filter((t) => (filter === 'all' ? true : filter === 'done' ? t.done : !t.done))
  const doneCount = items.filter((t) => t.done).length
  const progress = items.length ? doneCount / items.length : 0

  useEffect(() => {
    pet?.refresh()
  }, [pet, visible.length])

  const add = (e: FormEvent) => {
    e.preventDefault()
    const text = draft.trim()
    if (!text) {
      void pet?.react('confused', { say: 'Une tâche vide ?' })
      return
    }
    setItems((list) => [...list, { id: nextId.current++, text, done: false }])
    setDraft('')
    void pet?.react('success', { say: 'Ajouté !' })
  }

  const toggle = (id: number) => {
    const next = items.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    setItems(next)
    if (next.every((t) => t.done)) void pet?.react('celebrate', { say: 'Tout est fini !' })
  }

  const remove = (id: number) => {
    setItems((list) => list.filter((t) => t.id !== id))
    void pet?.react('delete')
  }

  const checkAll = () => {
    if (!items.length) return
    setItems((list) => list.map((t) => ({ ...t, done: true })))
    void pet?.react('celebrate', { say: 'Bravo !' })
  }

  const clearDone = () => {
    if (!doneCount) return
    setItems((list) => list.filter((t) => !t.done))
    void pet?.react('delete', { say: `${doneCount} de moins !` })
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-6 py-10 md:grid-cols-[1fr_17rem]">
      <section>
        <h1 className="text-3xl font-bold">Mes tâches</h1>
        <p className="mt-1 text-muted">Le hamster vous regarde écrire. Il adore les listes cochées.</p>

        <form onSubmit={add} className="mt-6 flex gap-2 rounded-blob border border-line bg-paper p-2 shadow-sm">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Nouvelle tâche…"
            className="min-w-0 flex-1 rounded-xl bg-transparent px-3 py-2 outline-none placeholder:text-muted/70"
          />
          <button type="submit" className="rounded-xl bg-honey px-4 py-2 text-sm font-semibold transition-colors hover:bg-honey-deep">
            Ajouter
          </button>
        </form>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-1 rounded-full border border-line bg-paper p-1">
            {FILTERS.map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setFilter(id)}
                className={`rounded-full px-3 py-1 text-sm transition-colors ${filter === id ? 'bg-sand font-semibold' : 'text-muted hover:text-ink'}`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex gap-2 text-sm">
            <button type="button" onClick={checkAll} className="rounded-full px-3 py-1 text-muted transition-colors hover:bg-sand hover:text-ink">
              Tout cocher
            </button>
            <button type="button" onClick={clearDone} className="rounded-full px-3 py-1 text-muted transition-colors hover:bg-sand hover:text-ink">
              Effacer les faites
            </button>
          </div>
        </div>

        <ul className="mt-4 space-y-3">
          {visible.map((t) => (
            <li key={t.id} className="group flex items-center gap-3 rounded-2xl border border-line bg-paper px-4 py-3">
              <button
                type="button"
                onClick={() => toggle(t.id)}
                aria-label={t.done ? 'Décocher' : 'Cocher'}
                className={`grid size-6 shrink-0 place-items-center rounded-full border-2 text-xs transition-colors ${t.done ? 'border-mint bg-mint text-paper' : 'border-line hover:border-honey'}`}
              >
                {t.done && '✓'}
              </button>
              <span className={`flex-1 ${t.done ? 'text-muted line-through' : ''}`}>{t.text}</span>
              <button
                type="button"
                onClick={() => remove(t.id)}
                aria-label="Supprimer"
                className="rounded-full px-2 text-muted opacity-0 transition-opacity group-hover:opacity-100 hover:text-blush focus:opacity-100"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
        {!visible.length && (
          <p className="mt-6 rounded-2xl border border-dashed border-line px-4 py-8 text-center text-muted">Rien par ici 🌾</p>
        )}
      </section>

      <aside className="space-y-6 md:pt-24">
        <div className="rounded-blob border border-line bg-paper p-5">
          <p className="text-sm text-muted">Progression</p>
          <p className="mt-1 text-2xl font-bold tabular-nums">
            {doneCount} / {items.length}
          </p>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-sand">
            <div className="h-full origin-left rounded-full bg-mint transition-transform duration-500" style={{ transform: `scaleX(${progress})` }} />
          </div>
        </div>
        <div className="rounded-blob bg-honey/25 p-5 text-sm md:ml-6">
          <p className="font-semibold">🐹 Le saviez-vous ?</p>
          <p className="mt-1 text-muted">Cocher toutes les tâches déclenche une petite fête. Supprimer, un petit nuage.</p>
        </div>
        <div className="rounded-blob border border-dashed border-line p-5 text-sm text-muted md:mr-8">
          Astuce : tapez dans le champ, il vient voir ce que vous écrivez.
        </div>
      </aside>
    </div>
  )
}
