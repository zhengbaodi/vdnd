import {
  beforeEach,
  describe,
  it,
  vi,
  expect,
  afterEach,
  beforeAll,
  afterAll,
} from 'vitest';
import { Plugin } from '../plugins';
import SimulatedDnd from '../SimulatedDnd';
import {
  EventSuppressor,
  EventSuppressorEnvironment,
} from '../EventSuppressor';
import {
  DragSimulator,
  TouchDragSimulator,
  triggerEvent,
  waitForPromisesToResolve,
  waitForRequestAnimationFrame,
} from '@vdnd/test-utils';
import {
  TestEnv,
  createTestEnv,
  createTestEnvIterator,
  findAllMirrors,
  releaseTestEnv,
} from './__helpers__/test-env';
import { mouseOptions, touchOptions } from './__helpers__/constants';

describe('methods', () => {
  let env: TestEnv;
  let source: HTMLElement;
  let dnd: SimulatedDnd;
  let simulator: DragSimulator;

  beforeEach(() => {
    env = createTestEnv(false, null, null, mouseOptions);
    dnd = env.dnd as SimulatedDnd;
    source = env.source;
    simulator = env.simulator;
  });
  afterEach(() => {
    releaseTestEnv(env);
  });

  it('addPlugin', () => {
    let dummy = 0;
    class TestPlugin extends Plugin {
      attach() {
        dummy++;
      }
      detach() {}
    }

    dnd.addPlugin(TestPlugin);

    expect(dummy).toBe(1);
  });

  it('removePlugin', () => {
    let dummy = 0;
    class TestPlugin extends Plugin {
      attach() {}
      detach() {
        dummy++;
      }
    }

    dnd.addPlugin(TestPlugin);
    dnd.removePlugin(TestPlugin);

    expect(dummy).toBe(1);
  });

  it('isDragging', async () => {
    await simulator.dragstart(source);
    expect(dnd.isDragging()).toBe(true);

    await simulator.dragend(false);
    expect(dnd.isDragging()).toBe(false);
  });

  describe('destroy', () => {
    it("can't destroy while dragging", async () => {
      await simulator.dragstart(source);
      dnd.destroy();

      expect(dnd.isDragging()).toBe(true);
    });

    it('should detach all plugins', () => {
      class T1 extends Plugin {
        static dummy = 0;
        attach() {
          T1.dummy++;
        }
        detach() {
          T1.dummy--;
        }
      }
      class T2 extends Plugin {
        static dummy = 0;
        attach() {
          T2.dummy++;
        }
        detach() {
          T2.dummy--;
        }
      }

      dnd.addPlugin(T1, T2);
      dnd.destroy();
      expect(T1.dummy).toBe(0);
      expect(T2.dummy).toBe(0);
    });

    it('will not initiate drag-flow again after it', async () => {
      dnd.destroy();
      await simulator.dragstart(source);

      expect(dnd.isDragging()).toBe(false);
      expect(env.handlers.onDragStart).not.toHaveBeenCalled();
    });
  });
});

describe('exclusive interactions', () => {
  it('should create mirror when dragging a draggable source', async () => {
    const iterate = createTestEnvIterator(null, [mouseOptions, touchOptions]);
    await iterate(async ({ source, simulator }) => {
      // ensure mirror works
      vi.useRealTimers();
      TouchDragSimulator.USE_FAKE_TIMERS = false;
      await simulator.dragstart(source);
      await waitForPromisesToResolve();
      await waitForRequestAnimationFrame();

      const mirrors = findAllMirrors();
      expect(mirrors.item(0)).not.toBeFalsy();
    });
  });

  it('should not create mirror when dragging a not draggable source', async () => {
    const iterate = createTestEnvIterator(null, [
      {
        ...mouseOptions,
        isDraggable: () => false,
      },
      {
        ...touchOptions,
        isDraggable: () => false,
      },
    ]);
    await iterate(async ({ source, simulator }) => {
      // ensure mirror works
      vi.useRealTimers();
      TouchDragSimulator.USE_FAKE_TIMERS = false;
      await simulator.dragstart(source);
      await waitForPromisesToResolve();
      await waitForRequestAnimationFrame();

      const mirrors = findAllMirrors();
      expect(mirrors.item(0)).toBeFalsy();
    });
  });

  it('should suppress events while dragging', async () => {
    const env = new EventSuppressorEnvironment({
      keydown: {
        preventDefault: true,
        stopPropagation: true,
        stopImmediatePropagation: true,
      },
    });
    const iterate = createTestEnvIterator(null, [
      {
        ...mouseOptions,
        eventSuppressor: new EventSuppressor(env, 'mouse'),
      },
      {
        ...touchOptions,
        eventSuppressor: new EventSuppressor(env, 'touch'),
      },
    ]);
    await iterate(async ({ simulator, source }) => {
      EventSuppressorEnvironment.isTrustedEvent = () => true;
      await simulator.dragstart(source);
      const fn = vi.fn();

      source.addEventListener('keydown', fn);
      document.addEventListener('keydown', fn);
      const ev = triggerEvent(source, 'keydown');

      expect(fn).not.toHaveBeenCalled();
      expect(ev).toHaveDefaultPrevented();
      source.removeEventListener('keydown', fn);
      document.removeEventListener('keydown', fn);
    });
  });
});

describe('multiple `Simulated` instances should each work properly without conflict', () => {
  beforeAll(() => {
    vi.useFakeTimers();
    TouchDragSimulator.USE_FAKE_TIMERS = true;
  });
  afterAll(() => {
    vi.useRealTimers();
    TouchDragSimulator.USE_FAKE_TIMERS = false;
  });

  it('instances interfere with each other', async () => {
    async function test(a: TestEnv, b: TestEnv) {
      await a.simulator.dragstart(a.source);
      vi.advanceTimersByTime(SimulatedDnd.eventTriggeringInterval.drag);
      await a.simulator.dragenter(b.dropzone);
      vi.advanceTimersByTime(SimulatedDnd.eventTriggeringInterval.dragover);
      await a.simulator.dragleave();
      await a.simulator.dragend(false);

      expect(a.handlers.onDrag).toHaveBeenCalled();
      expect(a.handlers.onDragOver).not.toHaveBeenCalled();
      expect(a.handlers.onDragStart).toHaveBeenCalledTimes(1);
      expect(a.handlers.onDragEnter).not.toHaveBeenCalled();
      expect(a.handlers.onDragLeave).not.toHaveBeenCalled();
      expect(a.handlers.onDragEnd).toHaveBeenCalledTimes(1);

      expect(b.handlers.onDrag).not.toHaveBeenCalled();
      expect(b.handlers.onDragOver).not.toHaveBeenCalled();
      expect(b.handlers.onDragStart).not.toHaveBeenCalled();
      expect(b.handlers.onDragEnter).not.toHaveBeenCalled();
      expect(b.handlers.onDragLeave).not.toHaveBeenCalled();
      expect(b.handlers.onDragEnd).not.toHaveBeenCalled();
    }

    async function testMouse() {
      const [a, b] = [
        createTestEnv(false, null, null, mouseOptions),
        createTestEnv(false, null, null, mouseOptions),
      ];

      await test(a, b);
      releaseTestEnv(a);
      releaseTestEnv(b);
    }

    async function testTouch() {
      const [a, b] = [
        createTestEnv(false, null, null, touchOptions),
        createTestEnv(false, null, null, touchOptions),
      ];

      await test(a, b);
      releaseTestEnv(a);
      releaseTestEnv(b);
    }

    await Promise.all([testMouse(), testTouch()]);
  });

  it("instances don't interfere with each other", async () => {
    async function test(env: TestEnv) {
      const { simulator, source, dropzone, handlers } = env;
      await simulator.dragstart(source);
      vi.advanceTimersByTime(SimulatedDnd.eventTriggeringInterval.drag);
      await simulator.dragenter(dropzone);
      vi.advanceTimersByTime(SimulatedDnd.eventTriggeringInterval.dragover);
      await simulator.dragleave();
      await simulator.dragend(false);

      expect(handlers.onDrag).toHaveBeenCalled();
      expect(handlers.onDragOver).toHaveBeenCalled();
      expect(handlers.onDragStart).toHaveBeenCalledTimes(1);
      expect(handlers.onDragEnter).toHaveBeenCalledTimes(1);
      expect(handlers.onDragLeave).toHaveBeenCalledTimes(1);
      expect(handlers.onDragEnd).toHaveBeenCalledTimes(1);
    }

    async function testMouse() {
      const envs = [
        createTestEnv(false, null, null, mouseOptions),
        createTestEnv(false, null, null, mouseOptions),
      ];

      for (const env of envs) {
        await test(env);
        releaseTestEnv(env);
      }
    }

    async function testTouch() {
      const envs = [
        createTestEnv(false, null, null, touchOptions),
        createTestEnv(false, null, null, touchOptions),
      ];

      for (const env of envs) {
        await test(env);
        releaseTestEnv(env);
      }
    }

    await testMouse();
    await testTouch();
  });
});
