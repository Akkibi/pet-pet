import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    outDir: 'dist-lib',
    lib: { entry: 'src/pet/index.ts', name: 'PetPet', formats: ['es', 'umd'], fileName: 'pet-pet' },
  },
})
