import { defineConfig } from 'vite'

const core = {
  entry: 'src/index.ts',
  name: 'PetPet',
  formats: ['es', 'umd', 'iife'] as const,
  fileName: (format: string) => (format === 'es' ? 'pet-pet.js' : format === 'umd' ? 'pet-pet.umd.cjs' : 'pet-pet.iife.js'),
}

const react = {
  entry: 'src/react.ts',
  formats: ['es', 'cjs'] as const,
  fileName: (format: string) => (format === 'es' ? 'react.js' : 'react.cjs'),
}

export default defineConfig(({ mode }) => ({
  build: {
    lib: mode === 'react' ? { ...react, formats: [...react.formats] } : { ...core, formats: [...core.formats] },
    emptyOutDir: mode !== 'react',
    rollupOptions: { external: mode === 'react' ? ['react', 'pet-pet'] : [] },
  },
}))
