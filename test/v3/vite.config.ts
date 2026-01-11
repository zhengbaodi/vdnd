import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/vdnd3',
  plugins: [vue()],
  optimizeDeps: {
    exclude: ['@vdnd/v3'],
  },
});
