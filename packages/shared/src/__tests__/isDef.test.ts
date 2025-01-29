import { expect, it } from 'vitest';
import isDef from '../isDef';

it('return true, if the parameter is not null or undefined', () => {
  expect(isDef(null)).toBe(false);
  expect(isDef(void 0)).toBe(false);

  expect(isDef(0)).toBe(true);
  expect(isDef('0')).toBe(true);
  expect(isDef(false)).toBe(true);
  expect(isDef({})).toBe(true);
  expect(isDef([])).toBe(true);
});
