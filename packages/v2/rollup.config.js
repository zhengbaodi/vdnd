import { defineConfig } from 'rollup';
import terser from '@rollup/plugin-terser';
import replace from '@rollup/plugin-replace';
import alias from '@rollup/plugin-alias';
import resolve from '@rollup/plugin-node-resolve';
import { babel } from '@rollup/plugin-babel';
import { dts } from 'rollup-plugin-dts';
import { fileURLToPath } from 'node:url';
import { resolve as resolvePath } from 'node:path';

const PKG_NAME = 'Vdnd2';
const external = ['vue'];
const iifeGlobals = {
  vue: 'Vue',
};
const __dirname = resolvePath(fileURLToPath(import.meta.url), '../../../');

/**
 * @param {('env' | 'typescript')[]} babelPresets
 * @param {boolean} sourcemap
 */
function createRuntimeRollupPlugins(babelPresets, sourcemap) {
  return [
    resolve({
      extensions: ['.ts'],
    }),
    replace({
      IS_VUE2: 'true',
      preventAssignment: true,
    }),
    alias({
      entries: {
        '@vdnd': `${__dirname}/packages`,
      },
    }),
    babel({
      extensions: ['.ts'],
      babelHelpers: 'bundled',
      presets: ['@babel/preset-env', '@babel/preset-typescript'].filter(
        (name) =>
          babelPresets.some((preset) => `@babel/preset-${preset}` === name)
      ),
      sourceMaps: sourcemap,
    }),
  ];
}

const input = 'index.ts';
/** @type {import('rollup').RollupOptions[]} */
const rollupRuntimeOptions = [
  {
    input,
    external,
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
    plugins: createRuntimeRollupPlugins(['typescript'], false),
  },
  {
    input,
    external,
    output: [
      {
        file: './dist/index.iife.js',
        format: 'iife',
        sourcemap: false,
        name: PKG_NAME,
        globals: iifeGlobals,
      },
      {
        file: './dist/index.iife.min.js',
        format: 'iife',
        sourcemap: false,
        plugins: [terser({ sourceMap: false })],
        name: PKG_NAME,
        globals: iifeGlobals,
      },
    ],
    plugins: createRuntimeRollupPlugins(['env', 'typescript'], false),
  },
  {
    input,
    external,
    output: [
      {
        file: '../../v2-validation/libs/vdnd2.js',
        format: 'iife',
        sourcemap: 'inline',
        name: PKG_NAME,
        globals: iifeGlobals,
      },
    ],
    plugins: createRuntimeRollupPlugins(['typescript'], true),
  },
];

/** @type {import('rollup').RollupOptions} */
const rollupDtsOptions = {
  input,
  external,
  output: {
    file: './dist/index.d.ts',
  },
  plugins: [
    dts({
      tsconfig: '../../tsconfig.v2.json',
    }),
  ],
};

export default defineConfig([...rollupRuntimeOptions, rollupDtsOptions]);
