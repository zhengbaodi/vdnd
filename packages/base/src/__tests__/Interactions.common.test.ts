import { beforeEach, describe, it, vi, expect, afterEach } from 'vitest';
import SimulatedDnd from '../SimulatedDnd';
import {
  mouseOptions,
  touchOptions,
  nativeOptions,
} from './__helpers__/constants';
import { createTestEnvIterator, TestEnvIterator } from './__helpers__/test-env';

let _isDraggable = true;
let _isDroppable = true;
function setIsDraggable(draggable: boolean) {
  _isDraggable = draggable;
}
function setIsDroppable(droppable: boolean) {
  _isDroppable = droppable;
}
let iterate: TestEnvIterator;
beforeEach(() => {
  iterate = createTestEnvIterator(null, [
    {
      ...nativeOptions,
      isDraggable: () => _isDraggable,
      isDroppable: () => _isDroppable,
    },
    {
      ...mouseOptions,
      isDraggable: () => _isDraggable,
      isDroppable: () => _isDroppable,
    },
    {
      ...touchOptions,
      isDraggable: () => _isDraggable,
      isDroppable: () => _isDroppable,
    },
  ]);
});
afterEach(() => {
  setIsDraggable(true);
  setIsDroppable(true);
});

describe('drags a draggable source', () => {
  beforeEach(() => {
    setIsDraggable(true);
  });

  it("should not emit 'drag:prevent'", async () => {
    await iterate(async ({ source, simulator, handlers }) => {
      await simulator.dragstart(source);

      expect(handlers.onDragPrevent).not.toHaveBeenCalled();
    });
  });

  it("should emit 'drag:start'", async () => {
    await iterate(async ({ source, simulator, handlers }) => {
      await simulator.dragstart(source);

      expect(handlers.onDragStart).toHaveBeenCalled();
    });
  });

  it("check payload of 'drag:start'", async () => {
    await iterate(async ({ source, simulator, handlers }) => {
      await simulator.dragstart(source);

      const [[e]] = handlers.onDragStart.mock.calls;
      expect(e.source).toBe(source);
    });
  });

  it("should emit 'drag:enter' when the source is a dropzone", async () => {
    await iterate(async ({ source, simulator, handlers }) => {
      source.classList.add('dropzone');
      await simulator.dragstart(source);

      expect(handlers.onDragEnter).toHaveBeenCalled();
    });
  });

  it("check payload of 'drag:enter'", async () => {
    await iterate(async ({ source, simulator, handlers }) => {
      source.classList.add('dropzone');
      await simulator.dragstart(source);

      const [[e]] = handlers.onDragEnter.mock.calls;
      expect(e.source).toBe(source);
      expect(e.enter).toBe(source);
    });
  });
});

describe('drags a not draggable soure', () => {
  beforeEach(() => {
    setIsDraggable(false);
  });

  it("should not emit 'drag:start'", async () => {
    await iterate(async ({ source, simulator, handlers }) => {
      await simulator.dragstart(source);

      expect(handlers.onDragStart).not.toHaveBeenCalled();
    });
  });

  it("should emit 'drag:prevent'", async () => {
    await iterate(async ({ source, simulator, handlers }) => {
      await simulator.dragstart(source);

      expect(handlers.onDragPrevent).toHaveBeenCalled();
    });
  });

  it("check payload of 'drag:prevent'", async () => {
    await iterate(async ({ source, simulator, handlers }) => {
      await simulator.dragstart(source);

      const [e] = handlers.onDragPrevent.mock.lastCall!;
      expect(e.source).toBe(source);
    });
  });

  it('should not initiate drag-flow', async () => {
    await iterate(async ({ source, simulator, handlers }) => {
      await simulator.dragstart(source);
      await simulator.dragend(false);

      expect(handlers.onDragEnd).not.toHaveBeenCalled();
    });
  });

  it('we can drag again', async () => {
    await iterate(async ({ simulator, source, handlers }) => {
      await simulator.dragstart(source);
      await simulator.dragend(false);
      await simulator.dragstart(source);

      expect(handlers.onDragPrevent).toHaveBeenCalledTimes(2);
    });
  });
});

describe('while dragging', () => {
  describe("should emit 'drag' at interval whether the current drop target exists or not", () => {
    const INTERVAL = SimulatedDnd.eventTriggeringInterval.drag;
    it('exists', async () => {
      await iterate(async ({ simulator, source, dropzone, handlers }) => {
        await simulator.dragstart(source);
        await simulator.dragenter(dropzone);
        vi.advanceTimersByTime(INTERVAL * 2);

        expect(handlers.onDrag).toHaveBeenCalledTimes(2);
      });
    });

    it('does not exist', async () => {
      await iterate(async ({ simulator, source, handlers }) => {
        await simulator.dragstart(source);
        vi.advanceTimersByTime(INTERVAL * 2);

        expect(handlers.onDrag).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe("check payload of 'drag'", () => {
    const INTERVAL = SimulatedDnd.eventTriggeringInterval.drag;
    it('the current drop target exists', async () => {
      await iterate(async ({ simulator, source, handlers }) => {
        await simulator.dragstart(source);
        vi.advanceTimersByTime(INTERVAL);

        const [e] = handlers.onDrag.mock.lastCall!;
        expect(e.source).toBe(source);
        expect(e.over).toBeNull();
      });
    });

    it('the current drop target does not exist', async () => {
      await iterate(async ({ simulator, source, dropzone, handlers }) => {
        await simulator.dragstart(source);
        await simulator.dragenter(dropzone);
        vi.advanceTimersByTime(INTERVAL);

        const [e] = handlers.onDrag.mock.lastCall!;
        expect(e.source).toBe(source);
        expect(e.over).toBe(dropzone);
      });
    });
  });

  describe("should emit 'drag:over' at interval when staying a dropzone", () => {
    const INTERVAL = SimulatedDnd.eventTriggeringInterval.dragover;
    it('staying a dropzone', async () => {
      await iterate(async ({ simulator, source, handlers }) => {
        await simulator.dragstart(source);
        vi.advanceTimersByTime(INTERVAL * 2);

        expect(handlers.onDragOver).not.toHaveBeenCalled();
      });
    });

    it('not staying a dropzone', async () => {
      await iterate(async ({ simulator, source, dropzone, handlers }) => {
        await simulator.dragstart(source);
        await simulator.dragenter(dropzone);
        vi.advanceTimersByTime(INTERVAL * 2);

        expect(handlers.onDragOver).toHaveBeenCalledTimes(2);
      });
    });
  });

  it("check payload of 'drag:over'", async () => {
    const INTERVAL = SimulatedDnd.eventTriggeringInterval.dragover;
    await iterate(async ({ simulator, source, dropzone, handlers }) => {
      await simulator.dragstart(source);
      await simulator.dragenter(dropzone);
      vi.advanceTimersByTime(INTERVAL);

      const [e] = handlers.onDragOver.mock.lastCall!;
      expect(e.source).toBe(source);
      expect(e.over).toBe(dropzone);
    });
  });

  describe('the current drop target does not exist, indicates a dropzone as the current drop traget ', () => {
    it("should emit 'drag:enter'", async () => {
      await iterate(async ({ simulator, source, dropzone, handlers }) => {
        await simulator.dragstart(source);
        await simulator.dragenter(dropzone);

        expect(handlers.onDragEnter).toHaveBeenCalled();
      });
    });

    it("check payload of 'drag:enter'", async () => {
      await iterate(async ({ simulator, source, dropzone, handlers }) => {
        await simulator.dragstart(source);
        await simulator.dragenter(dropzone);

        const [e] = handlers.onDragEnter.mock.lastCall!;
        expect(e.source).toBe(source);
        expect(e.enter).toBe(dropzone);
      });
    });
  });

  describe('the current drop target exists, indicates a other dropzone as the current drop traget', () => {
    it("should emit 'drag:leave'", async () => {
      await iterate(async ({ simulator, source, dropzone, handlers }) => {
        source.classList.add('dropzone');
        await simulator.dragstart(source);
        await simulator.dragenter(dropzone);

        expect(handlers.onDragLeave).toHaveBeenCalled();
      });
    });

    it("check payload of 'drag:leave'", async () => {
      await iterate(async ({ simulator, source, dropzone, handlers }) => {
        source.classList.add('dropzone');
        await simulator.dragstart(source);
        await simulator.dragenter(dropzone);

        const [e] = handlers.onDragLeave.mock.lastCall!;
        expect(e.source).toBe(source);
        expect(e.leave).toBe(source);
      });
    });

    it("should emit 'drag:enter'", async () => {
      await iterate(async ({ simulator, source, dropzone, handlers }) => {
        source.classList.add('dropzone');
        await simulator.dragstart(source);
        await simulator.dragenter(dropzone);

        expect(handlers.onDragEnter).toHaveBeenCalledTimes(2);
      });
    });

    it("check payload of 'drag:enter'", async () => {
      await iterate(async ({ simulator, source, dropzone, handlers }) => {
        source.classList.add('dropzone');
        await simulator.dragstart(source);
        await simulator.dragenter(dropzone);

        const [e] = handlers.onDragEnter.mock.lastCall!;
        expect(e.source).toBe(source);
        expect(e.enter).toBe(dropzone);
      });
    });
  });

  describe('indicates a non-dropzone as the current drop traget', () => {
    it("should emit 'drag:leave'", async () => {
      await iterate(async ({ simulator, source, dropzone, handlers }) => {
        await simulator.dragstart(source);
        await simulator.dragenter(dropzone);
        await simulator.dragleave();

        expect(handlers.onDragLeave).toHaveBeenCalled();
      });
    });

    it("check payload of 'drag:leave'", async () => {
      await iterate(async ({ simulator, source, dropzone, handlers }) => {
        await simulator.dragstart(source);
        await simulator.dragenter(dropzone);
        await simulator.dragleave();

        const [e] = handlers.onDragLeave.mock.lastCall!;
        expect(e.source).toBe(source);
        expect(e.leave).toBe(dropzone);
      });
    });
  });
});

describe('ends the drag by normal interaction', () => {
  describe("should emit 'drag:end' whether the current drop target exists or not", () => {
    it('exists', async () => {
      await iterate(async ({ simulator, source, dropzone, handlers }) => {
        await simulator.dragstart(source);
        await simulator.dragenter(dropzone);
        await simulator.dragend(false);

        expect(handlers.onDragEnd).toHaveBeenCalled();
      });
    });

    it('does not exist', async () => {
      await iterate(async ({ simulator, source, handlers }) => {
        await simulator.dragstart(source);
        await simulator.dragend(false);

        expect(handlers.onDragEnd).toHaveBeenCalled();
      });
    });
  });

  describe("check payload of 'drag:end'", () => {
    it('the current drop target exists', async () => {
      await iterate(async ({ simulator, source, handlers }) => {
        await simulator.dragstart(source);
        await simulator.dragend(false);

        const [e] = handlers.onDragEnd.mock.lastCall!;
        expect(e.source).toBe(source);
        expect(e.over).toBeNull();
      });
    });

    it('the current drop target does not exist', async () => {
      await iterate(async ({ simulator, source, dropzone, handlers }) => {
        await simulator.dragstart(source);
        await simulator.dragenter(dropzone);
        await simulator.dragend(true);

        const [e] = handlers.onDragEnd.mock.lastCall!;
        expect(e.source).toBe(source);
        expect(e.over).toBe(dropzone);
      });
    });
  });

  it("should emit 'drop' if the current drop target is droppable, and should not emit 'drag:leave'", async () => {
    await iterate(async ({ simulator, source, dropzone, handlers }) => {
      setIsDroppable(true);
      await simulator.dragstart(source);
      await simulator.dragenter(dropzone);
      await simulator.dragend(true);

      expect(handlers.onDragLeave).not.toHaveBeenCalled();
      expect(handlers.onDrop).toHaveBeenCalled();
    });
  });

  it("check payload of 'drop'", async () => {
    await iterate(async ({ simulator, source, dropzone, handlers }) => {
      setIsDroppable(true);
      await simulator.dragstart(source);
      await simulator.dragenter(dropzone);
      await simulator.dragend(true);

      const [e] = handlers.onDrop.mock.lastCall!;
      expect(e.source).toBe(source);
      expect(e.dropzone).toBe(dropzone);
    });
  });

  it("should emit 'drag:leave' if the current drop target is not droppable, and should not emit 'drop'", async () => {
    await iterate(async ({ simulator, source, dropzone, handlers }) => {
      setIsDroppable(false);
      await simulator.dragstart(source);
      await simulator.dragenter(dropzone);
      await simulator.dragend(false);

      expect(handlers.onDrop).not.toHaveBeenCalled();
      expect(handlers.onDragLeave).toHaveBeenCalled();
    });
  });

  it("check payload of 'drag:leave'", async () => {
    await iterate(async ({ simulator, source, dropzone, handlers }) => {
      setIsDroppable(false);
      await simulator.dragstart(source);
      await simulator.dragenter(dropzone);
      await simulator.dragend(false);

      const [e] = handlers.onDragLeave.mock.lastCall!;
      expect(e.source).toBe(source);
      expect(e.leave).toBe(dropzone);
    });
  });

  it('we can drag again', async () => {
    await iterate(async ({ simulator, source, dropzone, handlers }) => {
      await simulator.dragstart(source);
      await simulator.dragend(false);
      await simulator.dragstart(source);
      await simulator.dragenter(dropzone);

      expect(handlers.onDragEnter).toHaveBeenCalled();
      expect(handlers.onDragStart).toHaveBeenCalledTimes(2);
    });
  });
});

describe("ends the drag by pressing down 'esc', only for mouse and native", () => {
  beforeEach(() => {
    iterate = createTestEnvIterator(null, [
      {
        ...nativeOptions,
        isDraggable: () => _isDraggable,
        isDroppable: () => _isDroppable,
      },
      {
        ...mouseOptions,
        isDraggable: () => _isDraggable,
        isDroppable: () => _isDroppable,
      },
    ]);
  });

  describe("should emit 'drag:end' whether the current drop target exists or not", () => {
    it('exists', async () => {
      await iterate(async ({ source, dropzone, simulator, handlers }) => {
        await simulator.dragstart(source);
        await simulator.dragstart(dropzone);
        await simulator.esc();

        expect(handlers.onDragEnd).toHaveBeenCalled();
      });
    });

    it('dose not exist', async () => {
      await iterate(async ({ source, simulator, handlers }) => {
        await simulator.dragstart(source);
        await simulator.esc();

        expect(handlers.onDragEnd).toHaveBeenCalled();
      });
    });
  });

  describe("check payload of 'drag:end'", () => {
    it('the current drop target exists', async () => {
      await iterate(async ({ source, dropzone, simulator, handlers }) => {
        await simulator.dragstart(source);
        await simulator.dragenter(dropzone);
        await simulator.esc();

        const [e] = handlers.onDragEnd.mock.lastCall!;
        expect(e.source).toBe(source);
        expect(e.over).toBe(dropzone);
      });
    });

    it('the current drop target does not exist', async () => {
      await iterate(async ({ source, simulator, handlers }) => {
        await simulator.dragstart(source);
        await simulator.esc();

        const [e] = handlers.onDragEnd.mock.lastCall!;
        expect(e.source).toBe(source);
        expect(e.over).toBeNull();
      });
    });
  });

  it("should emit 'drag:leave' if the current drop target exists", async () => {
    await iterate(async ({ source, simulator, dropzone, handlers }) => {
      await simulator.dragstart(source);
      await simulator.dragenter(dropzone);
      await simulator.esc();

      expect(handlers.onDragLeave).toHaveBeenCalled();
    });
  });

  it("check payload of 'drag:leave'", async () => {
    await iterate(async ({ source, simulator, dropzone, handlers }) => {
      await simulator.dragstart(source);
      await simulator.dragenter(dropzone);
      await simulator.esc();

      const [e] = handlers.onDragLeave.mock.lastCall!;
      expect(e.source).toBe(source);
      expect(e.leave).toBe(dropzone);
    });
  });

  it("should not emit 'drop' even if the current drop target exists", async () => {
    await iterate(async ({ source, simulator, dropzone, handlers }) => {
      await simulator.dragstart(source);
      await simulator.dragenter(dropzone);
      await simulator.esc();

      expect(handlers.onDrop).not.toHaveBeenCalled();
    });
  });

  it('we can drag again', async () => {
    await iterate(async ({ simulator, source, dropzone, handlers }) => {
      await simulator.dragstart(source);
      await simulator.esc();
      await simulator.dragstart(source);
      await simulator.dragenter(dropzone);

      expect(handlers.onDragEnter).toHaveBeenCalled();
      expect(handlers.onDragStart).toHaveBeenCalledTimes(2);
    });
  });
});

it("should not initiate drag-flow when meeting invalid 'drag:start'", async () => {
  await iterate(async ({ simulator, handlers, source }) => {
    const handle = document.createElement('div');
    handle.classList.add('handle');
    // to avoid error log
    // see 'checkHandleIsDraggable' in base/NativeDnd.ts
    handle.setAttribute('draggable', 'true');
    const handleSibling = document.createElement('div');
    source.appendChild(handle);
    source.appendChild(handleSibling);

    await simulator.dragstart(handleSibling);
    expect(handlers.onDragStart).not.toHaveBeenCalled();

    simulator.reset();
    await simulator.dragstart(handle);
    expect(handlers.onDragStart).toHaveBeenCalled();
  });
});
