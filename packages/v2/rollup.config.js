import dts from 'rollup-plugin-dts';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

const __DEV__ = process.env.NODE_ENV === 'development';

const input = 'src/index.ts';
const external = ['vue', '@vdnd/native'];

/** @type {import('rollup').RollupOptions[]} */
const options = [
  {
    input,
    output: {
      file: './dist/index.js',
      format: 'esm',
      sourcemap: __DEV__,
    },
    external,
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
        removeComments: true,
      }),
      resolve({
        extensions: ['.ts'],
      }),
    ],
  },
  {
    input,
    output: {
      file: './dist/index.d.ts',
    },
    external,
    plugins: [
      dts({
        tsconfig: './tsconfig.json',
      }),
    ],
  },
];

export default options;
