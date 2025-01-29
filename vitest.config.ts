import { defineConfig } from 'vitest/config';
import replace from '@rollup/plugin-replace';

export default defineConfig({
  test: {
    dir: './packages',
    include: ['{base,shared,v3}/**/*.test.ts'],
    coverage: {
      enabled: false,
      provider: 'v8',
      clean: true,
      cleanOnRerun: true,
      include: ['packages/{base,shared,v3}/**/*.ts'],
      exclude: [
        'packages/**/dist',
        'packages/*/index.ts',
        'packages/*/src/index.ts',
        'packages/**/*.test.ts',
        'packages/v3/src/types/*',
        'packages/v3/private/*',
        'packages/**/__tests__/__helpers__/*.ts',
      ],
    },
    watch: false,
    environment: 'jsdom',
    clearMocks: true,
    passWithNoTests: true,
    setupFiles: ['./vitest.setup.ts'],
  },
  plugins: [
    replace({
      IS_VUE2: 'false',
      preventAssignment: true,
    }),
  ],
});
