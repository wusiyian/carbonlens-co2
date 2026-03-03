import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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
