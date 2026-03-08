import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),  // @ 指向 src 目录
    },
  },

  server: {
    proxy: {
      '/proxy/': {
        target: 'http://example.com',  // 空 target，让它代理任意 URL
        changeOrigin: true,
        rewrite: (path) => {
          const urlPart = path.replace(/^\/proxy/, '');
          return urlPart;
        }
      },
    },
  },
})
