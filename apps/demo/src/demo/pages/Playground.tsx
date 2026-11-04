import { useEffect, useRef, useState } from 'react'
import { REACTION_ALIASES, REACTION_NAMES, type PetEventMap, type PetEventName, type ReactionAlias, type ReactionName } from 'pet-pet'
import type { PageProps } from '../types'

interface LogEntry {
  id: number
  name: PetEventName
  info: string
  at: string
}

const EVENTS: PetEventName[] = ['pet', 'grab', 'throw', 'impact', 'land', 'react', 'eat', 'sleep', 'wake']
const ALIASES = Object.entries(REACTION_ALIASES) as [ReactionAlias, ReactionName][]
const SHELVES = [
  { id: 'a', label: 'Étagère A', cls: 'w-40 bg-honey/40 md:ml-4' },
  { id: 'b', label: 'Étagère B', cls: 'w-56 bg-mint/40 md:ml-40' },
  { id: 'c', label: 'Étagère C', cls: 'w-44 bg-sky/40 md:ml-16' },
]

const summary = (data: PetEventMap[PetEventName]) =>
  Object.entries(data)
    .filter(([, v]) => typeof v === 'number' || typeof v === 'string')
    .map(([k, v]) => `${k}=${typeof v === 'number' ? Math.round(v) : v}`)
    .join(' ')

const chip = 'rounded-full border border-line bg-paper px-3 py-1.5 text-sm transition-colors hover:bg-sand'
const card = 'rounded-blob border border-line bg-paper p-5'

export default function Playground({ pet }: PageProps) {
  const [say, setSay] = useState(true)
  const [hold, setHold] = useState(false)
  const [shown, setShown] = useState<Record<string, boolean>>({ a: true, b: true, c: true })
  const [log, setLog] = useState<LogEntry[]>([])
  const [status, setStatus] = useState('…')
  const nextId = useRef(1)

  useEffect(() => {
    if (!pet) return
    const offs = EVENTS.map((name) =>
      pet.on(name, (data) => {
        const entry = { id: nextId.current++, name, info: summary(data), at: new Date().toLocaleTimeString('fr-FR') }
        setLog((l) => [entry, ...l].slice(0, 8))
      }),
    )
    offs.push(pet.on('state', ({ task, anim }) => setStatus(`${task} · ${anim}`)))
    return () => offs.forEach((off) => off())
  }, [pet])

  useEffect(() => {
    pet?.refresh()
  }, [pet, shown])

  const play = (name: ReactionName | ReactionAlias) => void pet?.react(name, { say: say ? name : undefined, hold })

  const actions: [string, () => void][] = [
    ['Nourrir 🌻', () => pet?.feed()],
    ['Dodo 💤', () => pet?.sleep()],
    ['Réveil ☀️', () => pet?.wake()],
    ['Viens ici 📍', () => void pet?.goTo('#playground-target')],
    ['Coucou 💬', () => pet?.say('Je suis là !')],
    ['Rescanner', () => pet?.refresh()],
  ]

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-3xl font-bold">Bac à sable</h1>
      <p className="mt-1 text-muted">
        Tous les boutons du hamster au même endroit. État : <span className="font-mono text-xs text-ink">{status}</span>
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          <section className={card}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-semibold">Réactions</h2>
              <div className="flex gap-4 text-sm text-muted">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={say} onChange={(e) => setSay(e.target.checked)} className="accent-honey-deep" />
                  Bulle
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={hold} onChange={(e) => setHold(e.target.checked)} className="accent-honey-deep" />
                  Maintenir (boucles)
                </label>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {REACTION_NAMES.map((n) => (
                <button key={n} type="button" className={chip} onClick={() => play(n)}>
                  {n}
                </button>
              ))}
            </div>
            <p className="mt-5 text-xs font-semibold tracking-wide text-muted uppercase">Alias</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {ALIASES.map(([alias, target]) => (
                <button key={alias} type="button" className={`${chip} bg-cream`} onClick={() => play(alias)}>
                  {alias} <span className="text-muted">→ {target}</span>
                </button>
              ))}
            </div>
          </section>

          <section className={card}>
            <h2 className="font-semibold">Actions</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {actions.map(([label, fn]) => (
                <button key={label} type="button" className="rounded-full bg-honey px-4 py-2 text-sm font-semibold transition-colors hover:bg-honey-deep" onClick={fn}>
                  {label}
                </button>
              ))}
            </div>
          </section>

          <section className="grid gap-6 md:grid-cols-2">
            <div className={card}>
              <h2 className="font-semibold">Plateformes amovibles</h2>
              <div className="mt-3 flex flex-wrap gap-3 text-sm">
                {SHELVES.map((s) => (
                  <label key={s.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={shown[s.id]}
                      onChange={(e) => setShown((v) => ({ ...v, [s.id]: e.target.checked }))}
                      className="accent-honey-deep"
                    />
                    {s.label}
                  </label>
                ))}
              </div>
              <p className="mt-6 text-sm leading-loose text-muted">
                Ce texte n’a pas de fond, mais <span data-pet-platform className="border-b-2 border-dotted border-honey-deep text-ink">ce long morceau souligné</span>{' '}
                est une plateforme forcée.
              </p>
            </div>
            <div data-pet-ignore className="grid place-items-center rounded-blob border-2 border-dashed border-blush/60 bg-blush/10 p-5 text-center text-sm text-muted">
              <div>
                <p className="font-semibold text-ink">Zone ignorée 🚫</p>
                <p className="mt-1">
                  <code>data-pet-ignore</code> : le hamster passe au travers.
                </p>
                <button type="button" className="mt-3 rounded-full bg-paper px-3 py-1 text-xs">
                  Même ce bouton
                </button>
              </div>
            </div>
          </section>

          <section className="space-y-10 py-4">
            {SHELVES.map((s) => (
              <div key={s.id} hidden={!shown[s.id]} className={`h-5 rounded-full ${s.cls}`}>
                <span className="sr-only">{s.label}</span>
              </div>
            ))}
            <div
              id="playground-target"
              className="ml-auto w-48 rounded-blob border-2 border-dashed border-honey-deep bg-honey/20 px-4 py-6 text-center text-sm font-semibold text-honey-deep"
            >
              📍 Cible
            </div>
          </section>
        </div>

        <aside className={`${card} self-start lg:sticky lg:top-6`}>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Événements</h2>
            <button type="button" className="text-xs text-muted hover:text-ink" onClick={() => setLog([])}>
              Vider
            </button>
          </div>
          <p className="text-xs text-muted">8 derniers (hors state)</p>
          <ol className="mt-4 space-y-2 font-mono text-xs">
            {log.map((e) => (
              <li key={e.id} className="rounded-xl bg-cream px-3 py-2">
                <span className="font-semibold text-honey-deep">{e.name}</span> <span className="text-muted">{e.at}</span>
                {e.info && <p className="mt-0.5 truncate text-ink/80">{e.info}</p>}
              </li>
            ))}
            {!log.length && <li className="text-muted">Caressez-le, lancez-le…</li>}
          </ol>
        </aside>
      </div>
    </div>
  )
}
