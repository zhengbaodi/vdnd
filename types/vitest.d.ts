import 'vitest';

interface CustomMatchers<R = unknown> {
  toBeSuperSetOf: (subset: unknown[]) => R;
  toHaveDefaultPrevented: () => R;
}

declare module 'vitest' {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}
