import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig(() => ({
  plugins: [react()],
  resolve: {
    alias: {
      '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
      '@screens': fileURLToPath(new URL('./src/screens', import.meta.url)),
      '@router': fileURLToPath(new URL('./src/router', import.meta.url)),
      '@context': fileURLToPath(new URL('./src/context', import.meta.url)),
      '@hooks': fileURLToPath(new URL('./src/hooks', import.meta.url)),
      '@services': fileURLToPath(new URL('./src/services', import.meta.url)),
      '@shared': fileURLToPath(new URL('./src/types', import.meta.url)),
    },
  },
  server: {
    port: Number(process.env.PORT_CLIENT_DEV || 5173),
  },
  preview: {
    port: Number(process.env.PORT_CLIENT_PREVIEW || 4173),
  },
}));
