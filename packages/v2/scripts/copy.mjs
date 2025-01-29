import copy from 'recursive-copy';
import { rimrafSync } from 'rimraf';

if (!rimrafSync(['./src', './index.ts'])) {
  throw new Error('rimraf failed: ./src ./index.ts');
}

await Promise.all([
  copy('../v3/src', './src', {
    filter(path) {
      return !path.includes('__tests__');
    },
    results: false,
  }),
  copy('../v3/index.ts', './index.ts', {
    results: false,
  }),
]);
