import { expect } from 'vitest';

function toHaveDefaultPrevented(event: Event) {
  const pass = Boolean(event.defaultPrevented);

  return {
    pass,
    message: () => {
      const expectation = pass ? 'not to have' : 'to have';

      return `Expected dom event '${event.type}' ${expectation} default prevented`;
    },
  };
}

function toBeSuperSetOf(parentset = [], subset = []) {
  const pass = subset.every((item) => parentset.indexOf(item) >= 0);
  return {
    pass,
    message: () => {
      const expectation = pass ? 'is not' : 'is';
      return `Expected [${parentset}] ${expectation} super set of [${subset}].`;
    },
  };
}

expect.extend({
  toBeSuperSetOf,
  toHaveDefaultPrevented,
});
