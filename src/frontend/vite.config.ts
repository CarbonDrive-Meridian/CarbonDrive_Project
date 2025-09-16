import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // base: "/CarbonDrive_Project/", // Comentado para desenvolvimento local
  resolve: {
    alias: {
      '@': '/src',
      '@/components': '/src/components',
      '@/hooks': '/src/hooks',
      '@/lib': '/src/lib',
      '@/pages': '/src/pages'
    }
  }
});