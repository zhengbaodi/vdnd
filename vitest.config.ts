import { defineConfig } from 'vitest/config';
import { resolve as resolvePath } from 'node:path';

export default defineConfig({
  test: {
    dir: './src',
    include: ['**/__tests__/**/*.test.ts'],
    coverage: {
      enabled: false,
      provider: 'v8',
      clean: true,
      cleanOnRerun: true,
      include: ['**/src/**/*.ts'],
      exclude: ['**/examples/**', '**/__tests__/**/*.ts'],
    },
    watch: false,
    environment: 'jsdom',
    clearMocks: true,
    passWithNoTests: true,
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    alias: {
      '@base': resolvePath(__dirname, './src/base'),
      '@shared': resolvePath(__dirname, './src/shared'),
      '@wrapper': resolvePath(__dirname, './src/wrapper'),
    },
  },
});
