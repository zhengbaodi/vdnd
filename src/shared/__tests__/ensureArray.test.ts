import { expect, it } from 'vitest';
import ensureArray from '../ensureArray';

it('parameter is array', () => {
  expect(ensureArray([1])).toEqual([1]);
});

it("parameter isn't array", () => {
  expect(ensureArray(1)).toEqual([1]);
});
