import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { triggerEvent } from '@vdnd/test-utils';
import { DefaultEventSuppressor } from '../EventSuppressor';

const oldIsTrustedEvent = DefaultEventSuppressor.isTrustedEvent;
const spyIsTrustedEvent = (fn: () => boolean) => {
  DefaultEventSuppressor.isTrustedEvent = fn;
};
const restoreIsTrustedEvent = () => {
  DefaultEventSuppressor.isTrustedEvent = oldIsTrustedEvent;
};
beforeEach(() => {
  spyIsTrustedEvent(() => true);
});
afterEach(() => {
  restoreIsTrustedEvent();
});

let suppressor!: DefaultEventSuppressor;
let button!: HTMLButtonElement;
beforeEach(() => {
  button = document.createElement('button');
  document.body.appendChild(button);
  suppressor = new DefaultEventSuppressor();
  suppressor.enable();
});
afterEach(() => {
  button.remove();
  suppressor.destroy();
});

describe('methods', () => {
  describe('suppress', () => {
    it('suppress: preventDefault', () => {
      suppressor.suppress('click', {
        preventDefault: true,
      });

      const ev = triggerEvent(button, 'click');
      expect(ev).toHaveDefaultPrevented();
    });

    it('suppress: stopPropagation', () => {
      suppressor.suppress('click', {
        stopPropagation: true,
      });
      const fn = vi.fn();
      button.addEventListener('click', fn);

      triggerEvent(button, 'click');
      expect(fn).not.toHaveBeenCalled();

      button.removeEventListener('click', fn);
    });

    it('suppress: stopImmediatePropagation', () => {
      suppressor.suppress('click', {
        stopImmediatePropagation: true,
      });
      const fn = vi.fn();
      document.addEventListener('click', fn);

      triggerEvent(button, 'click');
      expect(fn).not.toHaveBeenCalled();

      document.removeEventListener('click', fn);
    });

    it('for each event, only suppress it according to the last of multiple calls', () => {
      suppressor.suppress('click', {
        preventDefault: false,
      });
      suppressor.suppress('mousedown', {
        preventDefault: false,
      });

      suppressor.suppress('click', {
        preventDefault: true,
      });
      const ev1 = triggerEvent(button, 'click');
      expect(ev1).toHaveDefaultPrevented();
      const ev2 = triggerEvent(button, 'mousedown');
      expect(ev2).not.toHaveDefaultPrevented();
    });
  });

  it('unsuppress', () => {
    const fn = vi.fn();
    suppressor.suppress('click', {
      preventDefault: true,
      stopPropagation: true,
      stopImmediatePropagation: true,
    });

    suppressor.unsuppress('click');
    const ev = triggerEvent(button, 'click');
    document.addEventListener('click', fn);
    button.addEventListener('click', fn);
    expect(ev).not.toHaveDefaultPrevented();
    expect(fn).not.toHaveBeenCalled();
  });

  it('enable/disable', () => {
    suppressor.suppress('click', {
      preventDefault: true,
      stopPropagation: true,
      stopImmediatePropagation: true,
    });
    const fn = vi.fn();
    button.addEventListener('click', fn);

    suppressor.disable();
    const ev1 = triggerEvent(button, 'click');
    expect(ev1).not.toHaveDefaultPrevented();
    expect(fn).toHaveBeenCalledOnce();

    suppressor.enable();
    const ev2 = triggerEvent(button, 'click');
    expect(ev2).toHaveDefaultPrevented();
    expect(fn).toHaveBeenCalledOnce();
  });

  describe('addEventListenerSafely', () => {
    describe('should call listener when suppressed', () => {
      it('suppressed when added', () => {
        suppressor.suppress('click', {
          stopPropagation: true,
        });
        const fn = vi.fn();
        suppressor.addEventListenerSafely('click', fn);

        triggerEvent(button, 'click');
        expect(fn).toHaveBeenCalledOnce();
      });

      it('not suppressed when added, then suppressed', () => {
        const fn = vi.fn();
        suppressor.addEventListenerSafely('click', fn);
        suppressor.suppress('click', {
          stopPropagation: true,
        });

        triggerEvent(button, 'click');
        expect(fn).toHaveBeenCalledOnce();
      });
    });

    describe('should call listener when not suppressed', () => {
      it('not suppressed when added', () => {
        const fn = vi.fn();
        suppressor.addEventListenerSafely('click', fn);

        triggerEvent(button, 'click');
        expect(fn).toHaveBeenCalledOnce();
      });

      it('suppressed when added, then canceled suppression', () => {
        suppressor.suppress('click', {
          stopPropagation: true,
        });
        const fn = vi.fn();
        suppressor.addEventListenerSafely('click', fn);
        suppressor.unsuppress('click');

        triggerEvent(button, 'click');
        expect(fn).toHaveBeenCalledOnce();
      });
    });
  });

  it('removeEventListener', () => {
    suppressor.suppress('click', {
      stopPropagation: true,
    });
    const fn = vi.fn();
    suppressor.addEventListenerSafely('click', fn);
    suppressor.addEventListenerSafely('click', fn, {
      capture: true,
    });
    suppressor.removeEventListener('click', fn);
    suppressor.removeEventListener('click', fn, {
      capture: true,
    });
    triggerEvent(button, 'click');
    expect(fn).not.toHaveBeenCalled();
  });

  describe('destroy', () => {
    it(`no longer suppress events`, () => {
      const fn = vi.fn();
      suppressor.suppress('click', {
        stopPropagation: true,
      });
      button.addEventListener('click', fn);

      suppressor.destroy();
      triggerEvent(button, 'click');
      expect(fn).toHaveBeenCalledOnce();

      button.removeEventListener('click', fn);
    });

    it("remove all listeners added by 'addEventListenerSafely'", () => {
      suppressor.suppress('click', {
        stopPropagation: true,
      });
      suppressor.suppress('mousedown', {
        stopPropagation: true,
      });
      const fn1 = vi.fn();
      const fn2 = vi.fn();
      suppressor.addEventListenerSafely('mousedown', fn1);

      suppressor.destroy();
      triggerEvent(button, 'click');
      triggerEvent(button, 'mousedown');
      expect(fn1).not.toHaveBeenCalled();
      expect(fn2).not.toHaveBeenCalled();
    });
  });
});

it("should not suppress the event triggered by 'dispatchEvent'", () => {
  spyIsTrustedEvent(() => false);

  suppressor.suppress('click', {
    stopPropagation: true,
  });
  const fn = vi.fn();
  button.addEventListener('click', fn);

  triggerEvent(button, 'click');
  expect(fn).toHaveBeenCalledOnce();

  restoreIsTrustedEvent();
});
