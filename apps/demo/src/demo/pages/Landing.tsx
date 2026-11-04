import type { PageProps } from '../types'

const FEATURES = [
  { icon: '🌻', title: 'Zéro dépendance', text: 'Un seul module TypeScript, un canvas, et c’est tout. Rien à configurer.' },
  { icon: '🧱', title: 'Plateformes auto', text: 'Cartes, boutons et champs deviennent des rebords où il aime grimper.' },
  { icon: '💬', title: 'Réactions', text: 'Un attribut data-pet-react suffit pour qu’il applaudisse vos actions.' },
]

const PLANS = [
  { name: 'Graine', price: '0 €', perks: ['1 hamster', 'Réactions de base', 'Sieste illimitée'], featured: false },
  { name: 'Tournesol', price: '4 €', perks: ['Tout de Graine', 'Graines à volonté', 'Bulles de dialogue', 'Câlins prioritaires'], featured: true },
  { name: 'Grenier', price: '12 €', perks: ['Tout de Tournesol', 'Plusieurs pages', 'Support en peluche'], featured: false },
]

const btn = 'rounded-full px-5 py-2.5 text-sm font-semibold transition-colors'

export default function Landing({ pet }: PageProps) {
  return (
    <div className="mx-auto max-w-5xl px-6 pb-16">
      <section className="grid items-center gap-12 py-16 md:grid-cols-[1.1fr_1fr] md:py-24">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-3 py-1 text-xs font-medium text-muted">
            🐹 Nouveau · v1.0
          </span>
          <h1 className="mt-5 text-4xl leading-tight font-bold tracking-tight md:text-5xl">
            Un petit hamster
            <br />
            <span className="text-honey-deep">pour vos interfaces</span>
          </h1>
          <p className="mt-5 max-w-md text-lg text-muted">
            Il se promène sur vos cartes, saute sur vos boutons et réagit à ce que vous faites. Tout doux, tout rond.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button type="button" className={`${btn} bg-honey text-ink shadow-sm hover:bg-honey-deep`} data-pet-react="success" data-pet-say="C’est parti !">
              Commencer
            </button>
            <button type="button" className={`${btn} border border-line bg-paper hover:bg-sand`} data-pet-react="wave" data-pet-say="Coucou !">
              Dis bonjour 👋
            </button>
            <button type="button" className={`${btn} text-muted hover:text-ink`} onClick={() => pet?.feed()}>
              Lancer une graine
            </button>
          </div>
        </div>

        <div className="relative">
          <div className="rounded-blob border border-line bg-paper p-5 shadow-[0_12px_40px_-16px_rgba(59,42,32,0.25)]">
            <div className="flex gap-1.5">
              <span className="size-2.5 rounded-full bg-blush" />
              <span className="size-2.5 rounded-full bg-honey" />
              <span className="size-2.5 rounded-full bg-mint" />
            </div>
            <div className="mt-5 h-3 w-2/3 rounded-full bg-sand" />
            <div className="mt-2 h-3 w-1/2 rounded-full bg-sand" />
            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="h-16 rounded-xl bg-honey/40" />
              <div className="h-24 rounded-xl bg-mint/40" />
              <div className="h-12 rounded-xl bg-sky/40" />
            </div>
          </div>
          <div className="absolute -bottom-6 -left-6 hidden rounded-2xl border border-line bg-paper px-4 py-3 text-sm shadow-sm sm:block">
            <p className="font-semibold">+128 caresses</p>
            <p className="text-xs text-muted">aujourd’hui</p>
          </div>
        </div>
      </section>

      <section className="py-12">
        <h2 className="text-center text-2xl font-bold">Pourquoi un hamster ?</h2>
        <p className="mx-auto mt-2 max-w-md text-center text-muted">Parce qu’une interface, c’est mieux avec quelqu’un dedans.</p>
        <div className="mt-10 grid gap-6 md:grid-cols-3 md:items-start">
          {FEATURES.map((f, i) => (
            <article key={f.title} className={`rounded-blob border border-line bg-paper p-6 ${i === 1 ? 'md:mt-10' : ''}`}>
              <div className="grid size-11 place-items-center rounded-2xl bg-sand text-xl">{f.icon}</div>
              <h3 className="mt-4 font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{f.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="py-12">
        <h2 className="text-center text-2xl font-bold">Des tarifs tout doux</h2>
        <p className="mx-auto mt-2 max-w-md text-center text-muted">Payable en graines de tournesol (ou presque).</p>
        <div className="mt-12 grid gap-6 md:grid-cols-3 md:items-end">
          {PLANS.map((p) => (
            <article
              key={p.name}
              className={`flex flex-col rounded-blob p-6 ${p.featured ? 'border-2 border-honey bg-paper pt-10 pb-8 shadow-[0_16px_40px_-20px_rgba(227,154,69,0.6)]' : 'border border-line bg-paper'}`}
            >
              {p.featured && <span className="mb-3 self-start rounded-full bg-honey/30 px-3 py-0.5 text-xs font-semibold text-honey-deep">Le préféré</span>}
              <h3 className="font-semibold">{p.name}</h3>
              <p className="mt-2 text-3xl font-bold">
                {p.price}
                <span className="text-sm font-normal text-muted"> / mois</span>
              </p>
              <ul className="mt-5 space-y-2 text-sm text-muted">
                {p.perks.map((perk) => (
                  <li key={perk} className="flex gap-2">
                    <span className="text-mint">✓</span>
                    {perk}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className={`${btn} mt-6 ${p.featured ? 'bg-honey hover:bg-honey-deep' : 'border border-line bg-cream hover:bg-sand'}`}
                data-pet-react="approve"
                data-pet-say="Bon choix !"
              >
                Choisir {p.name}
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="my-12 rounded-blob bg-sand/70 px-8 py-12 text-center">
        <h2 className="text-2xl font-bold">Prêt à l’adopter ?</h2>
        <p className="mt-2 text-muted">Il ne demande qu’un conteneur et un peu d’attention.</p>
        <button type="button" className={`${btn} mt-6 bg-ink text-cream hover:bg-ink/85`} data-pet-react="love" data-pet-say="Merci ♥">
          Adopter maintenant
        </button>
      </section>

      <footer className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6 text-sm text-muted">
        <p>© 2026 Pet-pet · fait avec des graines</p>
        <nav className="flex gap-5">
          {[
            ['Mentions', 'Rien à voir ici !'],
            ['Confidentialité', 'Je ne sais pas lire…'],
            ['Contact', 'Écris-moi !'],
          ].map(([label, say]) => (
            <button key={label} type="button" className="hover:text-ink" data-pet-say={say}>
              {label}
            </button>
          ))}
        </nav>
      </footer>
    </div>
  )
}
