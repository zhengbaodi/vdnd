// @ts-nocheck
import copy from 'recursive-copy';
import through from 'through2';
import { rimrafSync } from 'rimraf';

if (
  !rimrafSync([
    './src/tests',
    './src/vdnd.ts',
    './src/test.css',
    './src/Test.vue',
  ])
) {
  throw new Error('generate failed');
}

await Promise.all([
  copy('../v3/src/tests', './src/tests', {
    results: false,
  }),
  copy('../v3/src/vdnd.ts', './src/vdnd.ts', {
    results: false,
    transform: function (src, dest, stats) {
      return through(function (chunk, enc, done) {
        /** @type {string} */
        const code = chunk.toString();
        done(null, code.replaceAll('@vdnd/v3', '@vdnd/v2'));
      });
    },
  }),
  copy('../v3/src/test.css', './src/test.css', {
    results: false,
  }),
  copy('../v3/src/Test.vue', './src/Test.vue', {
    results: false,
  }),
]);
