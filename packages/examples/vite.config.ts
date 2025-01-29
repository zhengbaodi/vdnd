import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import gzip from 'rollup-plugin-gzip';

const plugins = [vue()];
if (process.env.NODE_ENV !== 'development') {
  plugins.push(gzip());
}

// https://vitejs.dev/config/
export default defineConfig({
  base: '/vdnd',
  plugins,
  build: {
    outDir: '../../docs',
    emptyOutDir: false,
    terserOptions: {
      ecma: 5,
      compress: true,
      sourceMap: false,
    },
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
  },
});
