import { expect, it } from 'vitest';
import $typeof from '../typeof';

it('typeof', () => {
  expect($typeof(1)).toBe('number');
  expect($typeof(1n)).toBe('bigint');
  expect($typeof('1')).toBe('string');
  expect($typeof(true)).toBe('boolean');
  expect($typeof(Symbol())).toBe('symbol');
  expect($typeof(null)).toBe('null');
  expect($typeof(void 0)).toBe('undefined');
  expect($typeof({})).toBe('Object');
  expect($typeof([])).toBe('Array');
  expect($typeof(new Date())).toBe('Date');
});
