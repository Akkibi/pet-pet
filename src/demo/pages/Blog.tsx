import { useEffect, useRef, useState, type FormEvent } from 'react'
import type { PageProps } from '../types'

interface Comment {
  id: number
  author: string
  text: string
}

const SECTIONS = [
  { id: 'blog-origines', title: 'Des origines modestes' },
  { id: 'blog-plateformes', title: 'Tout est une plateforme' },
  { id: 'blog-code', title: 'Trois lignes de code' },
  { id: 'blog-fin', title: 'Et maintenant ?' },
]

const SNIPPET = `import { createPet } from 'pet-pet'

const pet = createPet({ container: document.querySelector('main') })

saveButton.addEventListener('click', async () => {
  await save()
  pet.react('approve', { say: 'Enregistré !' })
})`

const P = 'mt-4 leading-relaxed text-ink/85'

export default function Blog({ pet }: PageProps) {
  const [likes, setLikes] = useState(42)
  const [liked, setLiked] = useState(false)
  const [comments, setComments] = useState<Comment[]>([
    { id: 1, author: 'Camille', text: 'Mon hamster s’est endormi sur le bouton « Publier ». Je ne publierai plus jamais rien.' },
    { id: 2, author: 'Noah', text: 'Je l’ai lancé sur le bloc de code, il a rebondi. 10/10.' },
  ])
  const [author, setAuthor] = useState('')
  const [text, setText] = useState('')
  const nextId = useRef(3)

  useEffect(() => {
    pet?.refresh()
  }, [pet, comments.length])

  const like = () => {
    setLiked(!liked)
    setLikes((n) => n + (liked ? -1 : 1))
    void pet?.react(liked ? 'sad' : 'love', { say: liked ? 'Oh…' : 'Moi aussi !' })
  }

  const comment = (e: FormEvent) => {
    e.preventDefault()
    if (!text.trim()) {
      void pet?.react('warning', { say: 'Écris quelque chose !' })
      return
    }
    setComments((c) => [...c, { id: nextId.current++, author: author.trim() || 'Anonyme', text: text.trim() }])
    setText('')
    void pet?.react('approve', { say: 'Merci !' })
  }

  const jump = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-6 py-12 lg:grid-cols-[1fr_13rem]">
      <article className="min-w-0">
        <span className="rounded-full bg-mint/25 px-3 py-1 text-xs font-semibold">Carnet de terrier</span>
        <h1 className="mt-4 text-4xl leading-tight font-bold tracking-tight">Pourquoi j’ai mis un hamster dans mon interface</h1>
        <div className="mt-5 flex items-center gap-3 text-sm text-muted">
          <span className="grid size-9 place-items-center rounded-full bg-sand text-lg">🐹</span>
          <span>
            <span className="font-medium text-ink">Noisette</span> · 4 novembre 2026 · 6 min de lecture
          </span>
        </div>

        <div className="mt-8 grid h-64 place-items-center rounded-blob bg-linear-to-br from-honey/70 via-blush/40 to-lilac/50 text-6xl">🌻</div>

        <p className={`${P} mt-8 text-lg`}>
          Tout a commencé un mardi pluvieux. L’interface était propre, efficace, parfaitement alignée sur sa grille. Et
          terriblement vide. Il manquait quelqu’un pour habiter tout ça.
        </p>

        <h2 id={SECTIONS[0].id} className="mt-12 scroll-mt-6 text-2xl font-bold">
          {SECTIONS[0].title}
        </h2>
        <p className={P}>
          Le premier prototype était un carré marron qui tombait au bas de l’écran. Puis le carré a eu des pattes, des
          oreilles, et surtout des joues. Beaucoup de joues. À partir de là, impossible de revenir en arrière.
        </p>
        <p className={P}>
          Un hamster de bureau n’a pas besoin d’être utile. Il a besoin d’être là, de réagir au bon moment, et de ne
          jamais gêner. C’est un équilibre fragile entre présence et discrétion.
        </p>

        <blockquote className="my-10 rounded-blob border-l-4 border-honey bg-paper px-6 py-5 text-xl leading-snug font-medium">
          « Une interface vivante, c’est une interface où l’on a envie de cliquer juste pour voir ce qui se passe. »
        </blockquote>

        <h2 id={SECTIONS[1].id} className="mt-12 scroll-mt-6 text-2xl font-bold">
          {SECTIONS[1].title}
        </h2>
        <p className={P}>
          Le hamster scanne la page et repère tout ce qui ressemble à un conteneur : un fond, une bordure, une ombre. Chaque
          bord supérieur devient un rebord où il peut grimper. Les images ci-dessous, par exemple.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-4">
          <figure>
            <div className="grid h-40 place-items-center rounded-2xl bg-linear-to-br from-sky/60 to-mint/50 text-4xl">☁️</div>
            <figcaption className="mt-2 text-xs text-muted">Fig. 1 — Un nuage, très confortable.</figcaption>
          </figure>
          <figure className="mt-10">
            <div className="grid h-40 place-items-center rounded-2xl bg-linear-to-br from-blush/50 to-honey/60 text-4xl">🧁</div>
            <figcaption className="mt-2 text-xs text-muted">Fig. 2 — Un cupcake, moins stable.</figcaption>
          </figure>
        </div>
        <p className={P}>
          Les plateformes trop étroites sont ignorées, celles cachées sous d’autres aussi. Le reste devient un terrain de jeu,
          que le planificateur de sauts parcourt comme un petit graphe.
        </p>

        <h2 id={SECTIONS[2].id} className="mt-12 scroll-mt-6 text-2xl font-bold">
          {SECTIONS[2].title}
        </h2>
        <p className={P}>L’intégration tient en quelques lignes. Le reste se fait avec des attributs HTML.</p>
        <pre className="mt-6 overflow-x-auto rounded-blob bg-ink p-5 font-mono text-sm leading-relaxed text-cream">
          <code>{SNIPPET}</code>
        </pre>
        <div className="mt-6 rounded-2xl bg-honey/20 px-5 py-4 text-sm">
          <strong>Astuce :</strong> <code className="rounded bg-paper px-1.5 py-0.5">data-pet-react="love"</code> sur n’importe
          quel bouton, et c’est tout.
        </div>

        <h2 id={SECTIONS[3].id} className="mt-12 scroll-mt-6 text-2xl font-bold">
          {SECTIONS[3].title}
        </h2>
        <p className={P}>
          Le hamster dort quand on l’ignore, mange les graines qu’on lui lance et regarde quand on écrit. Il reste encore
          mille choses à lui apprendre. En attendant, il vous remercie d’avoir lu jusqu’ici.
        </p>
        <div className="mt-8 grid h-48 place-items-center rounded-blob bg-linear-to-tr from-lilac/50 to-sky/40 text-5xl">🌙</div>

        <div className="mt-10 flex items-center gap-4 border-y border-line py-6">
          <button
            type="button"
            onClick={like}
            className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${liked ? 'bg-blush text-paper' : 'border border-line bg-paper hover:bg-blush/15'}`}
          >
            {liked ? '♥' : '♡'} J’adore
          </button>
          <span className="text-sm text-muted tabular-nums">{likes} personnes adorent</span>
        </div>

        <section className="mt-10">
          <h2 className="text-xl font-bold">Commentaires ({comments.length})</h2>
          <ul className="mt-5 space-y-4">
            {comments.map((c) => (
              <li key={c.id} className="rounded-2xl border border-line bg-paper p-4">
                <p className="text-sm font-semibold">{c.author}</p>
                <p className="mt-1 text-sm text-ink/85">{c.text}</p>
              </li>
            ))}
          </ul>
          <form onSubmit={comment} className="mt-6 space-y-3 rounded-blob border border-line bg-paper p-5">
            <input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Votre nom"
              className="w-full rounded-xl border border-line bg-cream px-3.5 py-2 text-sm outline-none focus:border-honey"
            />
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              placeholder="Un mot gentil pour le hamster…"
              className="w-full resize-y rounded-xl border border-line bg-cream px-3.5 py-2 text-sm outline-none focus:border-honey"
            />
            <div className="flex justify-end">
              <button type="submit" className="rounded-full bg-honey px-5 py-2 text-sm font-semibold transition-colors hover:bg-honey-deep">
                Publier
              </button>
            </div>
          </form>
        </section>
      </article>

      <aside className="hidden lg:block">
        <nav className="sticky top-6 rounded-blob border border-line bg-paper p-4 text-sm">
          <p className="mb-2 text-xs font-semibold tracking-wide text-muted uppercase">Sommaire</p>
          {SECTIONS.map((s) => (
            <button key={s.id} type="button" onClick={() => jump(s.id)} className="block w-full rounded-lg px-2 py-1.5 text-left text-muted hover:bg-cream hover:text-ink">
              {s.title}
            </button>
          ))}
        </nav>
      </aside>
    </div>
  )
}
