import { afterEach, beforeEach, describe, it, vi, expect } from 'vitest';
import { NativeDragSimulator, BaseTestUtils, BaseTestEnv } from 'test-utils';
import NativeDnd from '../NativeDnd';
import SimulatedDnd from '../SimulatedDnd';

const {
  _afterEach,
  _beforeEach,
  createTestEnv,
  createMockHandlers,
  nativeOptions,
} = BaseTestUtils;

let env: BaseTestEnv;
beforeEach(() => {
  _beforeEach();
});
afterEach(async () => {
  env && (await _afterEach(env));
});

describe('methods', () => {
  let source: HTMLElement;
  let dropzone: HTMLElement;
  let dnd: NativeDnd;
  let simulator: NativeDragSimulator;
  let handlers: BaseTestEnv['handlers'];
  beforeEach(() => {
    env = createTestEnv(true, null, null, nativeOptions);
    source = env.source;
    dropzone = env.dropzone;
    dnd = env.dnd as NativeDnd;
    simulator = env.simulator as NativeDragSimulator;
    handlers = env.handlers;
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
      await simulator.dragenter(dropzone);

      expect(handlers.onDragEnter).toHaveBeenCalled();
    });

    it('will not initiate drag-flow again after it', async () => {
      dnd.destroy();
      await simulator.dragstart(source);

      expect(handlers.onDragStart).not.toHaveBeenCalled();
    });
  });
});

describe('multiple `NativeDnd` instances should each work properly without conflict', () => {
  it('instances interfere with each other', async () => {
    async function test(a: BaseTestEnv, b: BaseTestEnv) {
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

    const [a, b] = [
      createTestEnv(true, null, createMockHandlers(), nativeOptions),
      createTestEnv(true, null, createMockHandlers(), nativeOptions),
    ];

    _beforeEach();
    await test(a, b);
    _afterEach(a);
    _afterEach(b);
  });

  it("instances don't interfere with each other", async () => {
    async function test(env: BaseTestEnv) {
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

    const envs = [
      createTestEnv(true, null, createMockHandlers(), nativeOptions),
      createTestEnv(true, null, createMockHandlers(), nativeOptions),
    ];

    for (const env of envs) {
      _beforeEach();
      await test(env);
      _afterEach(env);
    }
  });
});