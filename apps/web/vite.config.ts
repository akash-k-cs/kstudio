import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Load env from root directory
  const env = loadEnv(mode, path.resolve(__dirname, '../..'), '');
  
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    // Expose VITE_ prefixed env variables to the client
    envDir: path.resolve(__dirname, '../..'),
    server: {
      port: parseInt(env.VITE_PORT || '3000'),
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:4000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
        '/socket.io': {
          target: env.VITE_API_URL || 'http://localhost:4000',
          changeOrigin: true,
          ws: true,
        },
      },
    },
  };
});
