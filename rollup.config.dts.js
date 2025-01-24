import { defineConfig } from 'rollup';
import { dts } from 'rollup-plugin-dts';
import alias from '@rollup/plugin-alias';
import resolve from '@rollup/plugin-node-resolve';
import { fileURLToPath } from 'node:url';
import { resolve as resolvePath } from 'node:path';

const __dirname = resolvePath(fileURLToPath(import.meta.url), '..');

export default defineConfig({
  input: './dist/types/wrapper/index.d.ts',
  output: [
    {
      file: './dist/index.d.ts',
      format: 'es',
      sourcemap: false,
    },
  ],
  external: ['vue'],
  plugins: [
    alias({
      entries: {
        '@base': resolvePath(__dirname, './dist/types/base'),
        '@shared': resolvePath(__dirname, './dist/types/shared'),
        '@wrapper': resolvePath(__dirname, './dist/types/wrapper'),
      },
      customResolver: resolve({
        extensions: ['.d.ts'],
      }),
    }),
    dts(),
  ],
});
