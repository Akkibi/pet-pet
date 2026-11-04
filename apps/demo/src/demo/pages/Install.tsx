import { useState, type ReactNode } from 'react'
import { REACTION_NAMES } from 'pet-pet'
import { Code } from '../install/Code'
import { ATTRIBUTES, DIST, EVENTS, INSTALL, METHODS, OPTIONS, REACT, SCRIPT, VANILLA, VERSION } from '../install/snippets'
import type { PageProps } from '../types'

const DOCS = 'https://github.com/Akkibi/pet-pet/blob/main/docs/api.md'

function Step({ n, title, children }: { n: string; title: string; children: ReactNode }) {
  return (
    <section className="rounded-blob border border-line bg-paper p-6">
      <h2 className="flex items-center gap-3 text-lg font-bold">
        <span className="grid size-7 place-items-center rounded-lg bg-honey/50 text-sm text-ink">{n}</span>
        {title}
      </h2>
      <div className="mt-4 space-y-4 text-sm text-muted">{children}</div>
    </section>
  )
}

function Table({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="divide-y divide-line overflow-hidden rounded-2xl border border-line">
      {rows.map(([k, v]) => (
        <div key={k} className="grid gap-1 px-4 py-2.5 sm:grid-cols-[13rem_1fr] sm:gap-4">
          <dt className="font-mono text-[13px] text-ink">{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  )
}

export default function Install({ pet }: PageProps) {
  const [pm, setPm] = useState(INSTALL[0].id)
  const install = INSTALL.find((i) => i.id === pm) ?? INSTALL[0]

  return (
    <div className="mx-auto max-w-4xl px-6 pb-20">
      <header className="py-14">
        <span className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-3 py-1 text-xs font-medium text-muted">
          📦 {DIST === 'npm' ? 'npm' : 'GitHub Releases'} · v{VERSION} · MIT
        </span>
        <h1 className="mt-5 text-4xl font-bold tracking-tight">
          Installer <span className="text-honey-deep">pet-pet</span>
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted">
          Un seul paquet, zéro dépendance, des types TypeScript inclus. Il marche dans n’importe quelle page : React, Vue, Svelte ou HTML tout simple.
        </p>
      </header>

      <div className="space-y-6">
        <Step n="1" title="Ajouter le paquet">
          <div className="flex gap-1">
            {INSTALL.map((i) => (
              <button
                key={i.id}
                type="button"
                onClick={() => setPm(i.id)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                  i.id === pm ? 'bg-honey text-ink' : 'text-muted hover:bg-sand hover:text-ink'
                }`}
              >
                {i.label}
              </button>
            ))}
          </div>
          <Code lang="shell" code={install.code} />
        </Step>

        <Step n="2" title="Le faire apparaître">
          <p>
            <code className="text-ink">createPet()</code> ajoute un canvas en <code className="text-ink">position: fixed</code> par-dessus la page et lâche le hamster
            dedans. Il repère tout seul les cartes, boutons et champs sur lesquels grimper.
          </p>
          <Code lang="ts" code={VANILLA} />
        </Step>

        <Step n="3" title="Avec React">
          <p>
            <code className="text-ink">usePet</code> crée le hamster au montage, le retire au démontage et suit les changements d’options.
          </p>
          <Code lang="tsx" code={REACT} />
        </Step>

        {SCRIPT && (
          <Step n="4" title="Sans bundler">
            <p>
              Le build IIFE expose un global <code className="text-ink">PetPet</code>, pratique pour un CodePen ou une page statique.
            </p>
            <Code lang="html" code={SCRIPT} />
          </Step>
        )}

        <Step n="✦" title="Réactions">
          <p>Appelez une réaction depuis le code, ou posez un attribut sur n’importe quel élément cliquable. Essayez :</p>
          <div className="flex flex-wrap gap-2">
            {REACTION_NAMES.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => void pet?.react(name)}
                className="rounded-full border border-line bg-cream px-3 py-1 font-mono text-xs text-ink transition-colors hover:border-honey hover:bg-honey/30"
              >
                {name}
              </button>
            ))}
          </div>
          <Code lang="html" code={ATTRIBUTES} />
        </Step>

        <Step n="⚙" title="Options">
          <Table rows={OPTIONS} />
        </Step>

        <Step n="→" title="Méthodes et événements">
          <Table rows={METHODS} />
          <Code lang="ts" code={EVENTS} />
        </Step>
      </div>

      <p className="mt-10 text-center text-sm text-muted">
        Tout le détail est dans{' '}
        <a href={DOCS} target="_blank" rel="noreferrer" className="font-semibold text-honey-deep underline-offset-4 hover:underline">
          la documentation sur GitHub
        </a>
        .
      </p>
    </div>
  )
}
