import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  define: {
    global: 'window'
  },
  build: {
    chunkSizeWarningLimit: 3000, // increases limit to 2MB
     outDir: 'dist', // ensure build output goes to /dist
  },
  base: '/',
  
})
