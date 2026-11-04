import type { Platforms } from '../config'

export interface Candidate {
  id: number
  el: Element
  ancestors: Set<number>
}

const SOLID_TAGS = new Set([
  'BUTTON',
  'INPUT',
  'TEXTAREA',
  'SELECT',
  'IMG',
  'VIDEO',
  'CANVAS',
  'IFRAME',
  'PRE',
  'TABLE',
  'PICTURE',
])

const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'LINK', 'META', 'TEMPLATE', 'NOSCRIPT', 'BR', 'HTML', 'HEAD'])

const ids = new WeakMap<Element, number>()
let nextId = 1
export const elementId = (el: Element) => {
  let id = ids.get(el)
  if (!id) {
    id = nextId++
    ids.set(el, id)
  }
  return id
}

const transparent = (c: string) => c === 'transparent' || c === 'rgba(0, 0, 0, 0)' || /,\s*0\)$/.test(c)

const looksSolid = (cs: CSSStyleDeclaration) => {
  if (!transparent(cs.backgroundColor) || cs.backgroundImage !== 'none') return true
  if (cs.boxShadow !== 'none') return true
  const bw = parseFloat(cs.borderTopWidth)
  if (bw > 0 && cs.borderTopStyle !== 'none' && !transparent(cs.borderTopColor)) return true
  return false
}

export const scanCandidates = (root: ParentNode, p: Platforms, limit = 2500): Candidate[] => {
  const out: Candidate[] = []
  const byEl = new Map<Element, Candidate>()
  const start = root instanceof Document ? root.body : (root as Element)
  if (!start) return out
  const walker = document.createTreeWalker(start, NodeFilter.SHOW_ELEMENT, {
    acceptNode: (node) => {
      const el = node as Element
      if (SKIP_TAGS.has(el.tagName)) return NodeFilter.FILTER_REJECT
      if (p.ignore && el.matches(p.ignore)) return NodeFilter.FILTER_REJECT
      return NodeFilter.FILTER_ACCEPT
    },
  })
  let n = 0
  for (let node = walker.currentNode as Element | null; node && n < limit; node = walker.nextNode() as Element | null) {
    n++
    const el = node
    if (el === start && !(root instanceof Document)) continue
    const forced = p.selector ? el.matches(p.selector) : false
    if (!forced && !p.auto) continue
    const cs = getComputedStyle(el)
    if (cs.display === 'none' || cs.display === 'contents') continue
    if (cs.visibility === 'hidden' || parseFloat(cs.opacity) < 0.05) continue
    if (!forced && !SOLID_TAGS.has(el.tagName) && !looksSolid(cs)) continue
    const c: Candidate = { id: elementId(el), el, ancestors: new Set() }
    for (let a = el.parentElement; a; a = a.parentElement) {
      const pc = byEl.get(a)
      if (pc) {
        c.ancestors.add(pc.id)
        for (const id of pc.ancestors) c.ancestors.add(id)
        break
      }
    }
    byEl.set(el, c)
    out.push(c)
  }
  return out
}
