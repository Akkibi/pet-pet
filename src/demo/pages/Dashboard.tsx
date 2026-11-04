import { useEffect, useRef, useState } from 'react'
import type { PageProps } from '../types'

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const NAV = ['Vue d’ensemble', 'Caresses', 'Graines', 'Siestes', 'Réglages']
const ROWS = [
  { who: 'Camille', what: 'Caresse ×4', when: 'il y a 2 min', tag: 'bg-blush/25 text-ink' },
  { who: 'Noah', what: 'Graine lancée', when: 'il y a 12 min', tag: 'bg-honey/30 text-ink' },
  { who: 'Inès', what: 'Lancer de hamster', when: 'il y a 1 h', tag: 'bg-sky/30 text-ink' },
  { who: 'Léo', what: 'Sieste réveillée', when: 'il y a 3 h', tag: 'bg-lilac/30 text-ink' },
  { who: 'Maya', what: 'Formulaire validé', when: 'hier', tag: 'bg-mint/30 text-ink' },
]

const randomBars = () => DAYS.map(() => 20 + Math.round(Math.random() * 80))

const btn = 'rounded-full px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-60'

export default function Dashboard({ pet }: PageProps) {
  const [bars, setBars] = useState([42, 68, 35, 90, 56, 74, 28])
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<{ task: string; anim: string } | null>(null)
  const timer = useRef(0)

  useEffect(() => pet?.on('state', setStatus), [pet])

  useEffect(
    () => () => {
      if (!timer.current) return
      window.clearTimeout(timer.current)
      void pet?.react('thinking', { duration: 0 })
    },
    [pet],
  )

  const refresh = () => {
    setLoading(true)
    void pet?.react('loading', { hold: true, say: 'Je recompte…' })
    timer.current = window.setTimeout(() => {
      timer.current = 0
      setBars(randomBars())
      setLoading(false)
      void pet?.react('success', { say: 'À jour !' })
    }, 1600)
  }

  const total = bars.reduce((a, b) => a + b, 0)
  const stats = [
    { label: 'Caresses', value: total * 3, delta: '+12 %', tone: 'bg-blush/20' },
    { label: 'Graines', value: Math.round(total / 2), delta: '+4 %', tone: 'bg-honey/25' },
    { label: 'Siestes', value: 7, delta: '−1', tone: 'bg-lilac/20' },
    { label: 'Sauts', value: total + 31, delta: '+28 %', tone: 'bg-mint/20' },
  ]

  return (
    <div className="mx-auto flex max-w-6xl gap-6 px-6 py-8">
      <aside className="hidden w-52 shrink-0 self-start rounded-blob border border-line bg-paper p-4 md:block">
        <p className="px-3 pb-3 text-xs font-semibold tracking-wide text-muted uppercase">Hamster HQ</p>
        <nav className="flex flex-col gap-1">
          {NAV.map((n, i) => (
            <button
              key={n}
              type="button"
              className={`rounded-xl px-3 py-2 text-left text-sm transition-colors ${i === 0 ? 'bg-sand font-semibold' : 'text-muted hover:bg-cream hover:text-ink'}`}
              data-pet-say={i === 0 ? undefined : `${n} : bientôt !`}
            >
              {n}
            </button>
          ))}
        </nav>
        <div className="mt-8 rounded-2xl bg-honey/25 p-4 text-sm">
          <p className="font-semibold">Astuce</p>
          <p className="mt-1 text-muted">Attrapez-le par les oreilles et lancez-le sur un graphique.</p>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Tableau de bord</h1>
            <span className="mt-1 inline-flex items-center gap-2 rounded-full border border-line bg-paper px-3 py-1 font-mono text-xs text-muted">
              <span className={`size-2 rounded-full ${status ? 'bg-mint' : 'bg-line'}`} />
              Hamster : {status ? `${status.task} · ${status.anim}` : '…'}
            </span>
          </div>
          <div className="flex gap-2">
            <button type="button" className={`${btn} border border-line bg-paper hover:bg-sand`} onClick={refresh} disabled={loading}>
              {loading ? 'Chargement…' : 'Rafraîchir'}
            </button>
            <button type="button" className={`${btn} bg-honey hover:bg-honey-deep`} data-pet-react="approve" data-pet-say="Exporté !">
              Exporter
            </button>
          </div>
        </header>

        <section className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((s, i) => (
            <div key={s.label} className={`rounded-blob border border-line bg-paper p-5 ${i % 2 ? 'lg:mt-6' : ''}`}>
              <div className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${s.tone}`}>{s.delta}</div>
              <p className="mt-3 text-2xl font-bold tabular-nums">{s.value.toLocaleString('fr-FR')}</p>
              <p className="text-sm text-muted">{s.label}</p>
            </div>
          ))}
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-blob border border-line bg-paper p-6">
            <div className="flex items-baseline justify-between">
              <h2 className="font-semibold">Caresses de la semaine</h2>
              <span className="text-xs text-muted">{total} au total</span>
            </div>
            <div className="mt-6 flex h-56 items-end gap-3 border-b border-line">
              {bars.map((v, i) => (
                <div key={DAYS[i]} className="flex h-full flex-1 flex-col justify-end">
                  <div
                    className={`w-full rounded-t-xl transition-[height] duration-500 ${i === 3 ? 'bg-honey' : 'bg-honey/45'}`}
                    style={{ height: `${v}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-2 flex gap-3 text-center text-xs text-muted">
              {DAYS.map((d) => (
                <span key={d} className="flex-1">
                  {d}
                </span>
              ))}
            </div>
          </div>

          <div className="self-start rounded-blob border border-line bg-paper p-6">
            <h2 className="font-semibold">Humeur</h2>
            {[
              ['Joie', 'w-4/5 bg-mint'],
              ['Faim', 'w-3/5 bg-honey'],
              ['Sommeil', 'w-2/5 bg-lilac'],
              ['Curiosité', 'w-full bg-sky'],
            ].map(([label, bar]) => (
              <div key={label} className="mt-4">
                <div className="flex justify-between text-sm">
                  <span>{label}</span>
                </div>
                <div className="mt-1.5 h-2.5 rounded-full bg-sand">
                  <div className={`h-full rounded-full ${bar}`} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 overflow-hidden rounded-blob border border-line bg-paper">
          <div className="flex items-center justify-between px-6 pt-5 pb-3">
            <h2 className="font-semibold">Activité récente</h2>
            <button type="button" className="text-sm text-muted hover:text-ink" data-pet-react="thinking" data-pet-say="Je cherche…">
              Tout voir
            </button>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-cream text-xs text-muted">
              <tr>
                <th className="px-6 py-2 font-medium">Qui</th>
                <th className="px-6 py-2 font-medium">Quoi</th>
                <th className="px-6 py-2 font-medium">Quand</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r) => (
                <tr key={r.who} className="border-t border-line">
                  <td className="px-6 py-3 font-medium">{r.who}</td>
                  <td className="px-6 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs ${r.tag}`}>{r.what}</span>
                  </td>
                  <td className="px-6 py-3 text-muted">{r.when}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  )
}
