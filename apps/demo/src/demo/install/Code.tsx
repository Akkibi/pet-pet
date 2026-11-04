import { useState } from 'react'

export function Code({ code, lang }: { code: string; lang: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    void navigator.clipboard?.writeText(code).then(() => {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1400)
    })
  }
  return (
    <div className="group relative rounded-2xl border border-line bg-ink text-[13px] leading-relaxed text-cream">
      <div className="flex items-center justify-between px-4 pt-3 text-[11px] tracking-wide text-cream/50 uppercase">
        <span>{lang}</span>
        <button
          type="button"
          onClick={copy}
          className="rounded-md px-2 py-0.5 text-cream/70 normal-case transition-colors hover:bg-cream/10 hover:text-cream"
        >
          {copied ? 'copié ✓' : 'copier'}
        </button>
      </div>
      <pre className="overflow-x-auto px-4 pt-2 pb-4 font-mono">
        <code>{code}</code>
      </pre>
    </div>
  )
}
