import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/openaq': {
        target: 'https://api.openaq.org',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/openaq/, ''),
        configure: (proxy, options) => {
          // add API key header for OpenAQ calls in dev
          proxy.on('proxyReq', (proxyReq, req, res) => {
            proxyReq.setHeader('x-api-key', '0d8f7617cc27466bd352cc539d45a5a4b0eb3025811b100b22f8e56e8cf0eed4')
          })
        }
      }
    }
  }
})
