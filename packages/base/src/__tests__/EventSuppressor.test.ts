import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { triggerEvent, createEvent } from '@vdnd/test-utils';
import {
  ListenerProxy,
  SpecificEventSuppressor,
  EventSuppressorEnvironment,
  EventSuppressor,
} from '../EventSuppressor';

describe('ListenerProxy', () => {
  it('is', () => {
    const fn = vi.fn();
    const proxy = new ListenerProxy('click', fn, {});
    expect(proxy.is(fn)).toBe(true);
    expect(proxy.is(vi.fn())).toBe(false);
  });

  describe('call', () => {
    it('should call listener when expected type are received', () => {
      const fn = vi.fn();
      const proxy = new ListenerProxy('click', fn, {});

      proxy.call(createEvent('click'));

      expect(fn).toHaveBeenCalled();
    });

    it('should not call listener when unexpected type are received', () => {
      const fn = vi.fn();
      const proxy = new ListenerProxy('click', fn, {});

      proxy.call(createEvent('unknown'));

      expect(fn).not.toHaveBeenCalled();
    });

    it("should prevent the call of 'e.preventDefault' when 'options.passive' is true", () => {
      const fn = vi.fn((e: Event) => {
        e.preventDefault();
      });
      const proxy = new ListenerProxy('click', fn, { passive: true });
      const button = document.createElement('button');
      button.addEventListener('click', proxy.call.bind(proxy));

      const event = triggerEvent(button, 'click');

      expect(event).not.toHaveDefaultPrevented();
    });

    it("the listener only be called once when 'options.once' is true", () => {
      const fn = vi.fn();
      const proxy = new ListenerProxy('click', fn, { once: true });
      const event = createEvent('click');

      proxy.call(event);
      proxy.call(event);

      expect(fn).toHaveBeenCalledOnce();
    });

    describe("should not call the listener when 'options.signal' is aborted", () => {
      it('pass an aborted signal', () => {
        const fn = vi.fn();
        const proxy = new ListenerProxy('click', fn, {
          signal: AbortSignal.abort(),
        });
        const event = createEvent('click');

        proxy.call(event);

        expect(fn).not.toHaveBeenCalled();
      });

      it("aborts signal by 'AbortController'", () => {
        const fn = vi.fn();
        const controller = new AbortController();
        const proxy = new ListenerProxy('click', fn, {
          signal: controller.signal,
        });
        const event = createEvent('click');

        proxy.call(event);
        controller.abort();
        proxy.call(event);

        expect(fn).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('destroy', () => {
    it('the listener will no longer be called', () => {
      const fn = vi.fn();
      const proxy = new ListenerProxy('click', fn, {});
      const event = createEvent('click');

      proxy.call(event);
      proxy.destroy();
      proxy.call(event);

      expect(fn).toHaveBeenCalledTimes(1);
    });
  });
});

describe('SpecificEventSuppressor', () => {
  let enabled = false;
  const enable = () => (enabled = true);
  const disable = () => (enabled = false);
  const isEnabled = () => enabled;

  let button: HTMLButtonElement;
  let suppressor: SpecificEventSuppressor;

  beforeEach(() => {
    enable();
    suppressor = new SpecificEventSuppressor(
      'click',
      {
        preventDefault: true,
        stopPropagation: true,
        stopImmediatePropagation: true,
      },
      isEnabled,
      () => true
    );
    button = document.createElement('button');
    document.body.appendChild(button);
  });

  afterEach(() => {
    suppressor.destroy();
  });

  describe("should suppress events if 'isEnabled' returns true", () => {
    it('preventDefault', () => {
      const ev = triggerEvent(button, 'click');
      expect(ev).toHaveDefaultPrevented();
    });

    it('stopPropagation', () => {
      const fn = vi.fn();
      button.addEventListener('click', fn);

      triggerEvent(button, 'click');

      expect(fn).not.toHaveBeenCalled();
    });

    it('stopImmediatePropagation', () => {
      const fn = vi.fn();
      document.addEventListener('click', fn);

      triggerEvent(button, 'click');

      expect(fn).not.toHaveBeenCalled();

      document.removeEventListener('click', fn);
    });
  });

  describe("should not suppress events if 'isEnabled' returns false", () => {
    beforeEach(() => {
      disable();
    });

    it('preventDefault', () => {
      const ev = triggerEvent(button, 'click');
      expect(ev).not.toHaveDefaultPrevented();
    });

    it('stopPropagation', () => {
      const fn = vi.fn();
      button.addEventListener('click', fn);

      triggerEvent(button, 'click');

      expect(fn).toHaveBeenCalled();
    });

    it('stopImmediatePropagation', () => {
      const fn = vi.fn();
      document.addEventListener('click', fn);

      triggerEvent(button, 'click');

      expect(fn).toHaveBeenCalled();

      document.removeEventListener('click', fn);
    });
  });

  it('addAliveEventListener', () => {
    const dummy: number[] = [];
    const captureFn = vi.fn(() => dummy.push(1));
    const bubbleFn = vi.fn(() => dummy.push(2));
    suppressor.addAliveEventListener('test', 'click', bubbleFn, {
      capture: false,
    });
    suppressor.addAliveEventListener('test', 'click', captureFn, {
      capture: true,
      once: true,
    });

    triggerEvent(button, 'click');
    triggerEvent(button, 'click');

    expect(dummy).toEqual([1, 2, 2]);
  });

  it('removeAliveEventListener', () => {
    const fn = vi.fn();
    suppressor.addAliveEventListener('test', 'click', fn);

    triggerEvent(button, 'click');
    expect(fn).toHaveBeenCalledTimes(1);

    suppressor.removeAliveEventListener('unknown', 'click', fn);
    triggerEvent(button, 'click');
    expect(fn).toHaveBeenCalledTimes(2);

    suppressor.removeAliveEventListener('test', 'click', fn);
    triggerEvent(button, 'click');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('destroy', () => {
    const fn1 = vi.fn();
    const fn2 = vi.fn();
    button.addEventListener('click', fn2);
    suppressor.addAliveEventListener('test', 'click', fn1);

    suppressor.destroy();
    triggerEvent(button, 'click');

    expect(fn1).not.toHaveBeenCalled();
    expect(fn2).toHaveBeenCalled();
  });
});

const oldIsTrustedEvent = EventSuppressorEnvironment.isTrustedEvent;
const spyIsTrustedEvent = (fn: () => boolean) => {
  EventSuppressorEnvironment.isTrustedEvent = fn;
};
const restoreIsTrustedEvent = () => {
  EventSuppressorEnvironment.isTrustedEvent = oldIsTrustedEvent;
};

it('EventSuppressorEnvironment', () => {
  const env = new EventSuppressorEnvironment({
    click: {
      preventDefault: true,
    },
    mousedown: {
      preventDefault: true,
    },
  });
  const fn1 = vi.fn();
  const fn2 = vi.fn();
  const button = document.createElement('button');
  document.body.appendChild(button);
  button.addEventListener('click', fn1);
  button.addEventListener('mousedown', fn2);
  spyIsTrustedEvent(() => true);
  env.enable();

  let events = [
    triggerEvent(button, 'click'),
    triggerEvent(button, 'mousedown'),
  ];

  expect(events[0]).toHaveDefaultPrevented();
  expect(events[1]).toHaveDefaultPrevented();

  env.destroy();
  events = [triggerEvent(button, 'click'), triggerEvent(button, 'mousedown')];

  expect(events[0]).not.toHaveDefaultPrevented();
  expect(events[1]).not.toHaveDefaultPrevented();

  restoreIsTrustedEvent();
});

describe('EventSuppressor', () => {
  let button: HTMLButtonElement;
  let suppressor: EventSuppressor;
  const env = new EventSuppressorEnvironment({
    click: {
      preventDefault: true,
      stopPropagation: true,
    },
  });

  beforeEach(() => {
    suppressor = new EventSuppressor(env, 'test');
    suppressor.enable();
    button = document.createElement('button');
    document.body.appendChild(button);
    spyIsTrustedEvent(() => true);
  });

  afterEach(() => {
    suppressor.destroy();
    restoreIsTrustedEvent();
  });

  it('enable/disable', () => {
    suppressor.disable();
    const ev1 = triggerEvent(button, 'click');
    expect(ev1).not.toHaveDefaultPrevented();

    suppressor.enable();
    const ev2 = triggerEvent(button, 'click');
    expect(ev2).toHaveDefaultPrevented();
  });

  describe('addAliveEventListener', () => {
    it('should call added listener when the event is suppressed', () => {
      const fn = vi.fn();
      suppressor.addAliveEventListener('click', fn);

      triggerEvent(button, 'click');

      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should call added listener when the event is not suppressed', () => {
      const fn = vi.fn();
      suppressor.addAliveEventListener('mousedown', fn);

      triggerEvent(button, 'mousedown');

      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  it('removeAliveEventListener', () => {
    const fn = vi.fn();
    suppressor.addAliveEventListener('click', fn);
    suppressor.removeAliveEventListener('click', fn);

    triggerEvent(button, 'click');

    expect(fn).not.toHaveBeenCalled();
  });

  it('destroy', () => {
    const fn = vi.fn();
    const otherSuppressor = new EventSuppressor(env, 'other');
    suppressor.addAliveEventListener('click', fn);
    otherSuppressor.addAliveEventListener('click', fn);

    suppressor.destroy();
    triggerEvent(button, 'click');

    expect(fn).toHaveBeenCalledTimes(1);
  });
});
