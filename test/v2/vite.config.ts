import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue2';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/vdnd2',
  plugins: [vue()],
  optimizeDeps: {
    exclude: ['@vdnd/v2'],
  },
});
