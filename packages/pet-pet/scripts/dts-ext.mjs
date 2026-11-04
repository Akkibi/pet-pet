import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

const walk = (dir) =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f)
    return statSync(p).isDirectory() ? walk(p) : p.endsWith('.d.ts') ? [p] : []
  })

const SPEC = /(from\s+|import\(\s*)(['"])(\.{1,2}\/[^'"]+?)\2/g

for (const file of walk('dist')) {
  const src = readFileSync(file, 'utf8')
  const out = src.replace(SPEC, (m, pre, q, spec) => {
    if (/\.[cm]?js$/.test(spec)) return m
    const base = join(dirname(file), spec)
    const ext = existsSync(`${base}.d.ts`) ? '.js' : existsSync(join(base, 'index.d.ts')) ? '/index.js' : null
    if (!ext) throw new Error(`${file}: cannot resolve ${spec}`)
    return `${pre}${q}${spec}${ext}${q}`
  })
  if (out !== src) writeFileSync(file, out)
}
