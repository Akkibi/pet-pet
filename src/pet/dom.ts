export interface DomHooks {
  container: HTMLElement | null
  ignore: () => string
  react: (name: string, say?: string) => void
  say: (text: string) => void
  typing: (el: Element) => void
}

const editable = (t: EventTarget | null): t is HTMLElement =>
  t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement || (t instanceof HTMLElement && t.isContentEditable)

export const bindDom = (h: DomHooks) => {
  const inside = (el: Element) => !h.container || h.container.contains(el)
  const onClick = (e: MouseEvent) => {
    const t = e.target instanceof Element ? e.target : null
    const el = t?.closest<HTMLElement>('[data-pet-react],[data-pet-say]')
    if (!el || !inside(el)) return
    const { petReact, petSay } = el.dataset
    if (petReact) h.react(petReact, petSay)
    else if (petSay) h.say(petSay)
  }
  const onInput = (e: Event) => {
    const t = e.target
    if (!editable(t) || !inside(t) || t.closest(h.ignore())) return
    if (t instanceof HTMLInputElement && /^(checkbox|radio|range|color|file|button|submit)$/.test(t.type)) return
    h.typing(t)
  }
  document.addEventListener('click', onClick)
  document.addEventListener('input', onInput, true)
  return () => {
    document.removeEventListener('click', onClick)
    document.removeEventListener('input', onInput, true)
  }
}
