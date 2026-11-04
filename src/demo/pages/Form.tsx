import { useState, type FormEvent } from 'react'
import type { PageProps } from '../types'

interface Fields {
  name: string
  email: string
  password: string
  species: string
  bio: string
  terms: boolean
}

type Errors = Partial<Record<keyof Fields, string>>

const EMPTY: Fields = { name: '', email: '', password: '', species: 'dore', bio: '', terms: false }

const SPECIES = [
  ['dore', 'Hamster doré'],
  ['roborovski', 'Roborovski'],
  ['russe', 'Hamster russe'],
  ['chinois', 'Hamster de Chine'],
]

const validate = (f: Fields): Errors => {
  const e: Errors = {}
  if (f.name.trim().length < 2) e.name = 'Ton prénom est un peu court.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = 'Cet email a l’air bizarre.'
  if (f.password.length < 8) e.password = 'Il faut au moins 8 caractères.'
  if (f.bio.length > 280) e.bio = 'Bio trop longue (280 max).'
  if (!f.terms) e.terms = 'Accepte les conditions, s’il te plaît.'
  return e
}

const input =
  'mt-1.5 w-full rounded-xl border bg-cream px-3.5 py-2.5 outline-none transition-colors placeholder:text-muted/60 focus:border-honey focus:bg-paper'

export default function Form({ pet }: PageProps) {
  const [f, setF] = useState(EMPTY)
  const [errors, setErrors] = useState<Errors>({})
  const [done, setDone] = useState<string | null>(null)

  const set = <K extends keyof Fields>(k: K, v: Fields[K]) => {
    setF((prev) => ({ ...prev, [k]: v }))
    if (errors[k]) setErrors((prev) => ({ ...prev, [k]: undefined }))
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const errs = validate(f)
    setErrors(errs)
    const first = Object.values(errs)[0]
    if (first) {
      void pet?.react('error', { say: first })
      return
    }
    setDone(f.name.trim())
    void pet?.react('success', { say: `Bienvenue, ${f.name.trim()} !` })
  }

  const cancel = () => {
    setF(EMPTY)
    setErrors({})
    setDone(null)
  }

  const border = (k: keyof Fields) => (errors[k] ? 'border-blush' : 'border-line')
  const hint = (k: keyof Fields) => errors[k] && <p className="mt-1 text-xs text-blush">{errors[k]}</p>

  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-6 py-10 lg:grid-cols-[1fr_20rem]">
      <section className="rounded-blob border border-line bg-paper p-6 shadow-sm md:p-8">
        <h1 className="text-2xl font-bold">Créer un compte</h1>
        <p className="mt-1 text-sm text-muted">Rejoignez le club des amis des hamsters.</p>

        {done ? (
          <div className="mt-8 rounded-2xl bg-mint/20 p-6 text-center">
            <p className="text-3xl">🎉</p>
            <p className="mt-2 font-semibold">Bienvenue, {done} !</p>
            <p className="mt-1 text-sm text-muted">Votre hamster vous attend.</p>
            <button type="button" onClick={cancel} className="mt-4 rounded-full border border-line bg-paper px-4 py-2 text-sm hover:bg-sand">
              Recommencer
            </button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="mt-6 space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block text-sm font-medium">
                Prénom
                <input className={`${input} ${border('name')}`} value={f.name} onChange={(e) => set('name', e.target.value)} placeholder="Noisette" />
                {hint('name')}
              </label>
              <label className="block text-sm font-medium">
                Email
                <input
                  type="email"
                  className={`${input} ${border('email')}`}
                  value={f.email}
                  onChange={(e) => set('email', e.target.value)}
                  placeholder="noisette@terrier.fr"
                />
                {hint('email')}
              </label>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block text-sm font-medium">
                Mot de passe
                <input
                  type="password"
                  className={`${input} ${border('password')}`}
                  value={f.password}
                  onChange={(e) => set('password', e.target.value)}
                  placeholder="8 caractères minimum"
                />
                {hint('password')}
              </label>
              <label className="block text-sm font-medium">
                Espèce préférée
                <select className={`${input} ${border('species')}`} value={f.species} onChange={(e) => set('species', e.target.value)}>
                  {SPECIES.map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="block text-sm font-medium">
              Bio <span className="font-normal text-muted">({f.bio.length}/280)</span>
              <textarea
                rows={4}
                className={`${input} resize-y ${border('bio')}`}
                value={f.bio}
                onChange={(e) => set('bio', e.target.value)}
                placeholder="Parlez-nous de votre hamster…"
              />
              {hint('bio')}
            </label>
            <label className="flex items-start gap-3 text-sm">
              <input type="checkbox" checked={f.terms} onChange={(e) => set('terms', e.target.checked)} className="mt-0.5 size-4 accent-honey-deep" />
              <span>
                J’accepte de partager mes graines.
                {hint('terms')}
              </span>
            </label>
            <div className="flex flex-wrap justify-end gap-3 border-t border-line pt-5">
              <button
                type="button"
                onClick={cancel}
                className="rounded-full border border-line bg-paper px-5 py-2.5 text-sm font-medium transition-colors hover:bg-sand"
                data-pet-react="cancel"
                data-pet-say="Tant pis…"
              >
                Annuler
              </button>
              <button type="submit" className="rounded-full bg-honey px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-honey-deep">
                S’inscrire
              </button>
            </div>
          </form>
        )}
      </section>

      <aside className="space-y-6 lg:pt-16">
        <div className="rounded-blob border border-line bg-paper p-5">
          <p className="font-semibold">Pourquoi s’inscrire ?</p>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>🌻 Des graines chaque semaine</li>
            <li>🛏️ Des siestes partagées</li>
            <li>💌 Une newsletter toute douce</li>
          </ul>
        </div>
        <div className="rounded-blob bg-lilac/20 p-5 text-sm lg:ml-8">
          <p className="font-semibold">Aperçu</p>
          <p className="mt-2 text-muted">
            {f.name.trim() || 'Anonyme'} · {SPECIES.find(([v]) => v === f.species)?.[1]}
          </p>
          <p className="mt-1 line-clamp-3 text-muted italic">{f.bio || 'Pas encore de bio.'}</p>
        </div>
        <p className="rounded-blob border border-dashed border-line p-5 text-sm text-muted lg:mr-6">
          Envoyez le formulaire vide pour voir le hamster s’inquiéter.
        </p>
      </aside>
    </div>
  )
}
