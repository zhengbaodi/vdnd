import { expect, it } from 'vitest';
import isPrimitive from '../isPrimitive';

it('isPrimitive', () => {
  expect(isPrimitive(1)).toBe(true);
  expect(isPrimitive('1')).toBe(true);
  expect(isPrimitive(Symbol())).toBe(true);
  expect(isPrimitive(1000n)).toBe(true);
  expect(isPrimitive(true)).toBe(true);
  expect(isPrimitive(new Date())).toBe(false);
  expect(isPrimitive({})).toBe(false);
  expect(isPrimitive([])).toBe(false);
});
