import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';

const useHttps = process.env.VITE_HTTPS === 'true' || process.argv.includes('--https');

export default defineConfig({
  plugins: [react(), ...(useHttps ? [basicSsl({ domains: ['localhost', '192.168.1.64'] })] : [])],
  server: {
    host: true,
    port: 5173,
    https: useHttps,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
});
