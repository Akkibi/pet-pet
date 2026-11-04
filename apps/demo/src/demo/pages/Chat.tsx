import { useEffect, useRef, useState, type FormEvent } from 'react'
import type { PageProps } from '../types'

interface Message {
  id: number
  from: 'me' | 'pet'
  text: string
}

const CHANNELS = [
  { name: 'Noisette', emoji: '🐹', last: 'Tu as des graines ?', active: true },
  { name: 'Le terrier', emoji: '🏡', last: 'Sieste à 15 h', active: false },
  { name: 'Club tournesol', emoji: '🌻', last: 'Nouvelle récolte !', active: false },
  { name: 'Roue & co', emoji: '🎡', last: '3 km ce matin', active: false },
]

const REPLIES = ['Mmh, intéressant !', 'Je note ça dans mes joues.', 'Pouic ! 🐹', 'D’accord, mais d’abord une graine.', 'J’adore cette idée.']
const ANSWERS = ['Je ne sais pas, mais je cherche…', 'Peut-être ? Demande à la roue.', 'Bonne question. Réponse : graines.']

const pick = (list: string[]) => list[Math.floor(Math.random() * list.length)]

export default function Chat({ pet }: PageProps) {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, from: 'pet', text: 'Coucou ! Je suis Noisette 🐹' },
    { id: 2, from: 'me', text: 'Salut Noisette, tu vas bien ?' },
    { id: 3, from: 'pet', text: 'Très bien ! Je viens de finir ma sieste.' },
  ])
  const [draft, setDraft] = useState('')
  const [typing, setTyping] = useState(false)
  const nextId = useRef(4)
  const timer = useRef(0)
  const busy = useRef(false)
  const alive = useRef(true)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
      if (!timer.current) return
      window.clearTimeout(timer.current)
      timer.current = 0
      void pet?.react('thinking', { duration: 0 })
    }
  }, [pet])

  useEffect(() => {
    pet?.refresh()
    endRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [pet, messages.length, typing])

  const respond = async (text: string) => {
    const question = text.includes('?')
    if (question) await pet?.react('confused', { say: 'Hmm… ?' })
    if (!alive.current) return
    setTyping(true)
    void pet?.react('thinking', { hold: true })
    timer.current = window.setTimeout(() => {
      timer.current = 0
      busy.current = false
      setTyping(false)
      setMessages((m) => [...m, { id: nextId.current++, from: 'pet', text: pick(question ? ANSWERS : REPLIES) }])
      void pet?.react('approve')
    }, 1500)
  }

  const send = (e: FormEvent) => {
    e.preventDefault()
    const text = draft.trim()
    if (!text || busy.current) return
    busy.current = true
    setMessages((m) => [...m, { id: nextId.current++, from: 'me', text }])
    setDraft('')
    void respond(text)
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-6 px-6 py-8 md:grid-cols-[15rem_1fr]">
      <aside className="hidden self-start rounded-blob border border-line bg-paper p-3 md:block">
        <p className="px-2 pt-1 pb-3 text-xs font-semibold tracking-wide text-muted uppercase">Discussions</p>
        {CHANNELS.map((c) => (
          <button
            key={c.name}
            type="button"
            className={`flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors ${c.active ? 'bg-sand' : 'hover:bg-cream'}`}
            data-pet-say={c.active ? undefined : 'Pas maintenant, on discute !'}
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-cream text-lg">{c.emoji}</span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold">{c.name}</span>
              <span className="block truncate text-xs text-muted">{c.last}</span>
            </span>
          </button>
        ))}
      </aside>

      <section className="flex min-h-[70vh] flex-col rounded-blob border border-line bg-paper">
        <header className="flex items-center gap-3 border-b border-line px-5 py-4">
          <span className="grid size-10 place-items-center rounded-full bg-honey/30 text-xl">🐹</span>
          <div>
            <p className="font-semibold">Noisette</p>
            <p className="text-xs text-muted">{typing ? 'écrit…' : 'en ligne'}</p>
          </div>
          <button
            type="button"
            className="ml-auto rounded-full border border-line px-3 py-1 text-xs text-muted hover:bg-cream"
            data-pet-react="wave"
            data-pet-say="Coucou !"
          >
            Saluer
          </button>
        </header>

        <div className="flex flex-1 flex-col gap-4 px-5 py-6">
          <p className="self-center rounded-full bg-cream px-3 py-1 text-xs text-muted">Aujourd’hui</p>
          {messages.map((m) => (
            <div
              key={m.id}
              className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                m.from === 'me' ? 'self-end rounded-br-md bg-honey/45' : 'self-start rounded-bl-md bg-sand'
              }`}
            >
              {m.text}
            </div>
          ))}
          {typing && (
            <div className="flex gap-1 self-start rounded-2xl rounded-bl-md bg-sand px-4 py-3">
              {[0, 150, 300].map((d) => (
                <span key={d} className="size-1.5 animate-bounce rounded-full bg-muted" style={{ animationDelay: `${d}ms` }} />
              ))}
            </div>
          )}
          <div ref={endRef} />
        </div>

        <form onSubmit={send} className="flex gap-2 border-t border-line p-3">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Écrire à Noisette… (essayez une question ?)"
            className="min-w-0 flex-1 rounded-full border border-line bg-cream px-4 py-2.5 text-sm outline-none focus:border-honey"
          />
          <button
            type="submit"
            disabled={typing || !draft.trim()}
            className="rounded-full bg-honey px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-honey-deep disabled:opacity-50"
          >
            Envoyer
          </button>
        </form>
      </section>
    </div>
  )
}
