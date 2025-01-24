import { defineConfig } from 'rollup';
import typescript from '@rollup/plugin-typescript';
import alias from '@rollup/plugin-alias';
import { fileURLToPath } from 'node:url';
import { resolve as resolvePath } from 'node:path';

const __dirname = resolvePath(fileURLToPath(import.meta.url), '..');

export default defineConfig({
  input: './src/wrapper/index.ts',
  output: [
    {
      file: './dist/index.cjs',
      format: 'cjs',
      sourcemap: false,
    },
    {
      file: './dist/index.mjs',
      format: 'esm',
      sourcemap: false,
    },
  ],
  external: ['vue'],
  plugins: [
    alias({
      entries: {
        '@base': resolvePath(__dirname, './src/base'),
        '@shared': resolvePath(__dirname, './src/shared'),
        '@wrapper': resolvePath(__dirname, './src/wrapper'),
      },
    }),
    typescript({
      tsconfig: './tsconfig.build.json',
      noEmit: false,
      emitDeclarationOnly: true,
      declaration: true,
      declarationMap: false,
      declarationDir: './dist/types',
    }),
  ],
});
