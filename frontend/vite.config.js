import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const requestedTarget = env.VITE_API_PROXY_TARGET || env.VITE_API_URL
  const proxyTarget = /^https?:\/\//.test(requestedTarget || '')
    ? requestedTarget
    : 'http://localhost:8000'

  return {
    plugins: [react()],
    esbuild: {
      // Ensure automatic JSX runtime is used for both dev/prod and test transforms
      jsx: 'automatic',
    },
    server: {
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/tests/setup.js'],
    },
  }
})
