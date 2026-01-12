import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://34.72.106.241:8000/',
        changeOrigin: true
      },
      '/webhook': {
        target: 'http://34.72.106.241:8000/',
        changeOrigin: true
      }
    }
  }
})
