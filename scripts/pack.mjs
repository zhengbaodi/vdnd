import { execSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { rimrafSync } from 'rimraf';
import compressing from 'compressing';
import copy from 'recursive-copy';

// This script:
// 1、Runs `pnpm pack` for each public package.
// 2、Prunes the results of step 1.

rimrafSync('./pack-results');

const pkgPaths = readdirSync('./packages')
  .map((path) => `./packages/${path}`)
  .filter((path) => {
    const json = JSON.parse(readFileSync(`${path}/package.json`).toString());
    return !json.private;
  });

const commands = {
  string: '',
  array: [],
};
for (let i = 0; i < pkgPaths.length; i++) {
  const pkgPath = pkgPaths[i];
  if (commands.string) {
    commands.string += ' && ';
  }
  const command = `cd ${pkgPath} && pnpm pack --pack-destination ../../pack-results && cd ../../`;
  commands.string += command;
  commands.array.push(command);
}
console.log('prepare to pack:');
console.table(commands.array);
execSync(commands.string, { stdio: 'inherit' });
console.log('packed: all');

async function uncompress(from, to) {
  return new Promise((resolve, reject) => {
    compressing.tgz
      .uncompress(from, to)
      .then(() => {
        console.log(`unziped: ${from}`);
        resolve();
      })
      .catch(reject);
  });
}
const tgz_filepaths = readdirSync('./pack-results').map(
  (path) => `./pack-results/${path}`
);
console.log('prepare to unzip');
await Promise.all(
  tgz_filepaths.map((tgz) => uncompress(tgz, tgz.replace('.tgz', '')))
);
console.log('unziped: all');

console.log('prepare to move folder');
const unziped_folder_paths = readdirSync('./pack-results')
  .filter((path) => !path.endsWith('.tgz'))
  .map((path) => `./pack-results/${path}`);
async function copyPackage(path) {
  const dest = `./pack-results/${path.split('/')[2].split('-')[1]}`;
  await copy(`${path}/package`, dest);
}
await Promise.all(unziped_folder_paths.map((path) => copyPackage(path)));
console.log('moved: all');

rimrafSync('./pack-results/vdnd*', { glob: true });
