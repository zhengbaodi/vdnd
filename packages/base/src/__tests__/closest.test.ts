import { it, expect, vi, afterAll } from 'vitest';
import { createSandbox, findAllEls, findEl } from '@vdnd/test-utils';
import closest from '../closest';

const sandbox = createSandbox(`
  <div class="tree">
    <section>
      <ul>
        <li class="leaf"></li>
      </ul>
    </section>
  </div>
  <div class="other-tree"></div>
  <div class="other-tree"></div>
`);
const leaf = findEl(sandbox!, '.leaf')!;
const root = findEl(sandbox!, '.tree')!;

afterAll(() => {
  sandbox.remove();
});

it('self is also closest', () => {
  expect(closest(leaf, leaf)).toBe(leaf);
});

it('element without parentElement', () => {
  const who = document.createElement('div');
  expect(closest(who, '.parent')).toBeNull();
});

it('class matcher', () => {
  expect(closest(leaf, 'will-not-match')).toBeNull();
  expect(closest(leaf, 'tree')).toBe(root);
});

it('node matcher', () => {
  expect(closest(leaf, document.createElement('div'))).toBeNull();
  expect(closest(leaf, root)).toBe(root);
});

it('nodelist matcher', () => {
  const leaf = findEl(sandbox!, '.leaf')!;
  const nodelist1 = findAllEls(sandbox!, '.other-tree');
  const nodelist2 = findAllEls(sandbox!, '.tree');
  expect(closest(leaf, nodelist1)).toBeNull();
  expect(closest(leaf, nodelist2)).toBe(root);
});

it('array matcher', () => {
  const leaf = findEl(sandbox!, '.leaf')!;
  const nodes1 = [document.createElement('div'), document.createElement('div')];
  const nodes2 = [document.createElement('div'), root];
  expect(closest(leaf, nodes1)).toBeNull();
  expect(closest(leaf, nodes2)).toBe(root);
});

it('callback matcher', () => {
  const isNull = vi.fn().mockImplementation((value) => value === null);
  const isRoot = vi.fn().mockImplementation((value) => value === root);
  expect(closest(leaf, isNull as () => boolean)).toBeNull();
  expect(closest(leaf, isRoot as () => boolean)).toBe(root);
  // sandbox will create a wrapper element
  expect(isNull).toHaveBeenCalledTimes(5);
  expect(isRoot).toHaveBeenCalledTimes(4);
});
