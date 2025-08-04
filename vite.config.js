import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    react(),
    // visualizer({
    //   filename: 'bundle-stats.html',
    //   open: true, // opens report in browser after build
    //   gzipSize: true,
    //   brotliSize: true,
    // })
  ],
  base: '/ai-tooltip/',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            const parts = id.toString().split('node_modules/')[1].split('/');
            // Group all packages under their top-level scope
            return parts[0].startsWith('@') ? `${parts[0]}/${parts[1]}` : parts[0];
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000 // Optional: increase warning threshold
  }
})
