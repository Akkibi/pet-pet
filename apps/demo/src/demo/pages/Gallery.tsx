import { useEffect, useRef, useState } from 'react'
import type { PageProps } from '../types'

type Tag = 'chaud' | 'doux' | 'frais'

interface Tile {
  title: string
  emoji: string
  bg: string
  h: string
  tag: Tag
}

const TILES: Tile[] = [
  { title: 'Tournesol', emoji: '🌻', bg: 'from-honey to-honey-deep/70', h: 'h-64', tag: 'chaud' },
  { title: 'Nuage', emoji: '☁️', bg: 'from-sky/70 to-lilac/50', h: 'h-40', tag: 'frais' },
  { title: 'Fraise', emoji: '🍓', bg: 'from-blush/70 to-honey/40', h: 'h-52', tag: 'doux' },
  { title: 'Menthe', emoji: '🌿', bg: 'from-mint/80 to-sky/40', h: 'h-72', tag: 'frais' },
  { title: 'Coucher', emoji: '🌅', bg: 'from-honey/80 via-blush/60 to-lilac/60', h: 'h-44', tag: 'chaud' },
  { title: 'Guimauve', emoji: '🍡', bg: 'from-blush/40 to-lilac/50', h: 'h-60', tag: 'doux' },
  { title: 'Lune', emoji: '🌙', bg: 'from-lilac/80 to-ink/40', h: 'h-36', tag: 'frais' },
  { title: 'Miel', emoji: '🍯', bg: 'from-honey-deep/70 to-honey/50', h: 'h-56', tag: 'chaud' },
  { title: 'Coquillage', emoji: '🐚', bg: 'from-sand to-blush/40', h: 'h-48', tag: 'doux' },
  { title: 'Glaçon', emoji: '🧊', bg: 'from-sky/50 to-paper', h: 'h-64', tag: 'frais' },
  { title: 'Pêche', emoji: '🍑', bg: 'from-honey/60 to-blush/60', h: 'h-40', tag: 'doux' },
  { title: 'Braise', emoji: '🔥', bg: 'from-honey-deep to-blush/70', h: 'h-52', tag: 'chaud' },
  { title: 'Trèfle', emoji: '🍀', bg: 'from-mint/60 to-honey/30', h: 'h-44', tag: 'frais' },
  { title: 'Bonbon', emoji: '🍬', bg: 'from-lilac/60 to-blush/50', h: 'h-60', tag: 'doux' },
]

const FILTERS: [Tag | 'all', string][] = [
  ['all', 'Tout'],
  ['chaud', 'Chaud'],
  ['doux', 'Doux'],
  ['frais', 'Frais'],
]

export default function Gallery({ pet }: PageProps) {
  const [filter, setFilter] = useState<Tag | 'all'>('all')
  const [picked, setPicked] = useState<string | null>(null)
  const [eaten, setEaten] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)

  const tiles = filter === 'all' ? TILES : TILES.filter((t) => t.tag === filter)

  useEffect(() => pet?.on('eat', () => setEaten((n) => n + 1)), [pet])

  useEffect(() => {
    pet?.refresh()
  }, [pet, filter])

  const visit = (el: HTMLElement, t: Tile) => {
    setPicked(t.title)
    if (!pet) return
    void pet.goTo(el).then((ok) => {
      if (ok) pet.say(`${t.emoji} ${t.title} !`)
      else void pet.react('confused', { say: 'Trop haut…' })
    })
  }

  const seed = () => {
    const r = rootRef.current?.getBoundingClientRect()
    pet?.feed(r ? r.left + 40 + Math.random() * Math.max(0, r.width - 80) : undefined)
  }

  return (
    <div ref={rootRef} className="mx-auto max-w-6xl px-6 py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Galerie</h1>
          <p className="mt-1 text-muted">Cliquez une tuile : le hamster va s’asseoir dessus.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted tabular-nums">{eaten} graine{eaten > 1 ? 's' : ''} mangée{eaten > 1 ? 's' : ''}</span>
          <button type="button" onClick={seed} className="rounded-full bg-honey px-5 py-2.5 text-sm font-semibold shadow-sm transition-colors hover:bg-honey-deep">
            Graine 🌻
          </button>
        </div>
      </header>

      <div className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id)}
            className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${filter === id ? 'border-ink bg-ink text-cream' : 'border-line bg-paper hover:bg-sand'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-8 columns-2 gap-5 sm:columns-3 lg:columns-4">
        {tiles.map((t) => (
          <button
            key={t.title}
            type="button"
            onClick={(e) => visit(e.currentTarget, t)}
            className={`group relative mb-5 block w-full break-inside-avoid overflow-hidden rounded-blob bg-linear-to-br ${t.bg} ${t.h} text-left ${
              picked === t.title ? 'ring-4 ring-honey ring-offset-2 ring-offset-cream' : ''
            }`}
          >
            <span className="absolute inset-0 grid place-items-center text-5xl transition-transform duration-300 group-hover:scale-110">{t.emoji}</span>
            <span className="absolute bottom-3 left-3 rounded-full bg-paper/85 px-3 py-1 text-xs font-semibold">{t.title}</span>
          </button>
        ))}
      </div>

      <footer className="mt-10 rounded-blob border border-dashed border-line p-6 text-center text-sm text-muted">
        {tiles.length} tuiles · {TILES.length - tiles.length} masquées par le filtre
      </footer>
    </div>
  )
}
