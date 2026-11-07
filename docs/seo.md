# SEO and GEO

Canonical site: https://petpet.akkibi.art/ (Vercel). The GitHub Pages copy (https://akkibi.github.io/pet-pet/) serves the same build and points its canonical to the Vercel URL.

## Where it lives

- `apps/demo/index.html`: title, description, canonical, robots, Open Graph, Twitter card, JSON-LD (`WebSite`, `SoftwareSourceCode` for the library with repo + npm links, shared `Person` node `https://akkibi.art/#person`), and a French `<noscript>` summary for crawlers that don't run JS.
- `apps/demo/public/robots.txt`, `sitemap.xml`: root URL only (the demo pages are hash anchors, not separate routes).
- `apps/demo/public/llms.txt`: summary for AI answer engines (install, usage, API, demo pages).
- Share image: `https://petpet.akkibi.art/og-image.jpg` (1200×630), file `apps/demo/public/og-image.jpg`.

## When things change

- New demo page: add it to the `<noscript>` links (if it's a main one) and to the pages list in `llms.txt`.
- API change or new install method: update the `llms.txt` usage/API blocks (mirror `packages/pet-pet/README.md`).
- Bump `lastmod` in `sitemap.xml` on notable content changes.

## Deploy

`vercel.json` (root): `yarn build` (library, then demo) with `outputDirectory: apps/demo/dist`. The demo uses `base: './'`, so the same build works at `/` (Vercel) and under `/pet-pet/` (GitHub Pages).
