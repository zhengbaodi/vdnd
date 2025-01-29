import { readdirSync, readFileSync } from 'node:fs';

// The versions of @vdnd/v2 and @vdnd/v3 packages must be the same.

const pkgs = readdirSync('./packages')
  .map((path) =>
    JSON.parse(readFileSync(`./packages/${path}/package.json`).toString())
  )
  .filter((pkg) => !pkg.private)
  .map((pkg) => {
    return {
      name: pkg.name,
      version: pkg.version,
    };
  });

const versions = pkgs.map((pkg) => pkg.version);

if (new Array(versions.length).fill(versions[0]).join() !== versions.join()) {
  console.error('Please unify versions of the following packages:');
  console.table(pkgs);
  throw new Error('Version validation failed.');
}

console.table(pkgs);
console.log('Version validation successful.');
