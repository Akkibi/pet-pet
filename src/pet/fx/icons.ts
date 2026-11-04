export type FxKind =
  | 'heart'
  | 'star'
  | 'check'
  | 'cross'
  | 'bang'
  | 'question'
  | 'zzz'
  | 'dots'
  | 'sweat'
  | 'sparkle'
  | 'poof'
  | 'confetti'
  | 'bonk'

const svg = (body: string) =>
  `<svg viewBox="0 0 24 24" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">${body}</svg>`

const badge = (fill: string, inner: string) => svg(`<circle cx="12" cy="12" r="11" fill="${fill}"/>${inner}`)

export const ICONS: Record<Exclude<FxKind, 'confetti' | 'poof'>, string> = {
  heart: svg('<path d="M12 21s-8-5.2-8-11a4.6 4.6 0 0 1 8-3.1A4.6 4.6 0 0 1 20 10c0 5.8-8 11-8 11z" fill="#ff7a93"/>'),
  star: svg('<path d="M12 2.5l2.8 6 6.5.7-4.9 4.4 1.4 6.4L12 16.7 6.2 20l1.4-6.4L2.7 9.2l6.5-.7z" fill="#ffc94d"/>'),
  sparkle: svg('<path d="M12 1c1 6 5 10 11 11-6 1-10 5-11 11-1-6-5-10-11-11 6-1 10-5 11-11z" fill="#ffd166"/>'),
  check: badge('#4cc38a', '<path d="M7 12.5l3.2 3.2L17.5 8.5" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>'),
  cross: badge('#ff6b6b', '<path d="M8 8l8 8M16 8l-8 8" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/>'),
  bang: badge('#f5a524', '<path d="M12 6v8" stroke="#fff" stroke-width="3" stroke-linecap="round"/><circle cx="12" cy="18" r="1.7" fill="#fff"/>'),
  question: badge(
    '#7c8cff',
    '<path d="M9 9.2a3 3 0 1 1 4.3 2.7c-.9.5-1.3 1-1.3 2v.6" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/><circle cx="12" cy="18" r="1.5" fill="#fff"/>',
  ),
  zzz: svg('<path d="M6 6h11L6 18h12" fill="none" stroke="#8aa0c8" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>'),
  dots: svg(
    '<rect x="1" y="5" width="22" height="14" rx="7" fill="#fff" stroke="#d9cfc6" stroke-width="1.2"/><circle cx="7" cy="12" r="1.8" fill="#9b8d80"/><circle cx="12" cy="12" r="1.8" fill="#9b8d80"/><circle cx="17" cy="12" r="1.8" fill="#9b8d80"/>',
  ),
  sweat: svg('<path d="M12 2C9 7 6.5 10.5 6.5 14a5.5 5.5 0 0 0 11 0C17.5 10.5 15 7 12 2z" fill="#8fd3ff"/><ellipse cx="10" cy="14" rx="1.4" ry="2.2" fill="#fff" opacity=".7"/>'),
  bonk: svg('<path d="M12 1l2.6 6.1 6.6-1.9-3.9 5.6 5.7 3.6-6.6.9.6 6.7L12 17l-5 4.9.6-6.7-6.6-.9 5.7-3.6-3.9-5.6 6.6 1.9z" fill="#ffd166" stroke="#fff" stroke-width="1.2"/>'),
}

export const CONFETTI_COLORS = ['#ff7a93', '#ffc94d', '#4cc38a', '#7c8cff', '#8fd3ff', '#f4b66a']
