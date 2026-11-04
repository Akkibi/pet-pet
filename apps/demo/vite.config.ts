import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const lib = (file: string) => fileURLToPath(new URL(`../../packages/pet-pet/src/${file}`, import.meta.url))

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      { find: /^pet-pet$/, replacement: lib('index.ts') },
      { find: /^pet-pet\/react$/, replacement: lib('react.ts') },
    ],
  },
})
