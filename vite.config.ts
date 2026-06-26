import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { writeFileSync } from 'node:fs'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'generate-redirects',
      writeBundle() {
        writeFileSync('dist/_redirects', '/* /index.html 200\n')
      },
    },
  ],
  server: {
    port: 5173,
  },
  build: {
    sourcemap: true,
    minify: false,
  },
  define: {
    'process.env.NODE_ENV': '"development"',
  },
})
