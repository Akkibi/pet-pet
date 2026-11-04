import { Leva } from 'leva'
import { useEffect, useRef, useState } from 'react'
import { LEVA_THEME, usePetControls } from './demo/controls'
import { PAGES } from './demo/pages'
import { createPet, type Pet } from './pet'

type PageId = (typeof PAGES)[number]['id']

const readHash = (): PageId => {
  const h = window.location.hash.slice(1)
  return (PAGES.find((p) => p.id === h)?.id ?? 'landing') as PageId
}

export default function App() {
  const stage = useRef<HTMLElement>(null)
  const [pet, setPet] = useState<Pet | null>(null)
  const [page, setPage] = useState<PageId>(readHash)

  useEffect(() => {
    const el = stage.current
    if (!el) return
    const p = createPet({ container: el, root: el })
    setPet(p)
    return () => {
      p.destroy()
      setPet(null)
    }
  }, [])

  usePetControls(pet)

  useEffect(() => {
    const onHash = () => setPage(readHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    if (window.location.hash.slice(1) !== page) window.history.replaceState(null, '', `#${page}`)
    stage.current?.scrollTo(0, 0)
    pet?.refresh()
  }, [page, pet])

  const Page = PAGES.find((p) => p.id === page)?.component ?? PAGES[0].component

  return (
    <>
      <Leva theme={LEVA_THEME} titleBar={{ title: 'réglages' }} collapsed={window.innerWidth < 720} />
      <header className="fixed inset-x-0 top-0 z-10 flex h-14 items-center gap-3 border-b border-line bg-paper/90 px-4 backdrop-blur">
        <span className="flex items-center gap-2 font-bold tracking-tight">
          <span className="grid size-7 place-items-center rounded-lg bg-honey text-sm">🐹</span>
          pet-pet
        </span>
        <label className="ml-2 flex items-center gap-2 text-sm text-muted">
          <span className="hidden sm:inline">page</span>
          <select
            value={page}
            onChange={(e) => setPage(e.target.value as PageId)}
            className="rounded-lg border border-line bg-paper px-2 py-1 text-ink outline-none focus:border-honey"
          >
            {PAGES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
        <span className="ml-auto hidden text-xs text-muted md:inline">clic = caresse · glisser = lancer · maintenir = câlin</span>
        <a
          href="https://github.com/Akkibi/pet-pet"
          className="rounded-lg px-2 py-1 text-sm text-muted hover:bg-sand hover:text-ink"
          target="_blank"
          rel="noreferrer"
        >
          GitHub
        </a>
      </header>
      <main ref={stage} className="fixed inset-x-0 top-14 bottom-0 overflow-y-auto">
        <Page pet={pet} />
      </main>
    </>
  )
}
