import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { h } from 'vue';
import {
  createDndProviderUtilIterator,
  renderDndProvider,
  TouchDragSimulator,
} from 'test-utils';
import BaseSimulatedDnd from '@base/SimulatedDnd';
import {
  DndSource,
  DragEvent,
  DragOverEvent,
  DragEnterEvent,
  DragLeaveEvent,
  defaultDndClasses,
  DndDropzone,
} from '../..';
import ensureArray from '@shared/ensureArray';

let iterate: ReturnType<typeof createDndProviderUtilIterator>;
beforeEach(() => {
  iterate = createDndProviderUtilIterator();
  vi.useFakeTimers();
  TouchDragSimulator.USE_FAKE_TIMERS = true;
});

afterEach(() => {
  vi.useRealTimers();
  TouchDragSimulator.USE_FAKE_TIMERS = false;
});

it("should emit 'drag' at interval", async () => {
  const INTERVAL = BaseSimulatedDnd.eventTriggeringInterval.drag;
  await iterate(async ({ Provider, simualtor }) => {
    const { provider, source } = renderDndProvider(
      Provider,
      h(DndSource, { draggable: true })
    );

    await simualtor.dragstart(source);
    vi.advanceTimersByTime(INTERVAL * 2);

    expect(provider.emitted('drag')).toHaveLength(2);
  });
});

it("check payload of 'drag'", async () => {
  const INTERVAL = BaseSimulatedDnd.eventTriggeringInterval.drag;
  await iterate(async ({ Provider, native, simualtor }) => {
    const { provider, source } = renderDndProvider(
      Provider,
      h(DndSource, {
        label: 'source',
        draggable: true,
        dropzone: true,
        droppable: true,
      })
    );

    await simualtor.dragstart(source);
    vi.advanceTimersByTime(INTERVAL);

    const [e] = provider.emitted('drag')![0] as [DragEvent];
    expect(e.source.label).toBe('source');
    expect(e.over?.label).toBe('source');
    if (native) {
      expect(e.originalEvent).not.toBeNull();
    } else {
      expect(e.originalEvent).toBeNull();
    }
  });
});

it("should emit 'drag:over' at interval when staying a dropzone", async () => {
  const INTERVAL = BaseSimulatedDnd.eventTriggeringInterval.dragover;
  await iterate(async ({ Provider, simualtor }) => {
    const { provider, source } = renderDndProvider(
      Provider,
      h(DndSource, {
        draggable: true,
        dropzone: true,
        droppable: true,
      })
    );

    await simualtor.dragstart(source);
    vi.advanceTimersByTime(INTERVAL * 2);

    expect(provider.emitted('drag:over')).toHaveLength(2);
  });
});

it("check payload of 'drag:over'", async () => {
  const INTERVAL = BaseSimulatedDnd.eventTriggeringInterval.dragover;
  await iterate(async ({ Provider, native, simualtor }) => {
    const { provider, source } = renderDndProvider(
      Provider,
      h(DndSource, {
        label: 'source',
        draggable: true,
        dropzone: true,
        droppable: true,
      })
    );

    await simualtor.dragstart(source);
    vi.advanceTimersByTime(INTERVAL);

    const [e] = provider.emitted('drag:over')![0] as [DragOverEvent];
    expect(e.source.label).toBe('source');
    expect(e.over?.label).toBe('source');
    if (native) {
      expect(e.originalEvent).not.toBeNull();
    } else {
      expect(e.originalEvent).toBeNull();
    }
  });
});

describe('the current drop target does not exist, then indicates a dropzone as the current drop traget', () => {
  it("should emit 'drag:enter'", async () => {
    await iterate(async ({ Provider, simualtor }) => {
      const { provider, source, dropzone } = renderDndProvider(Provider, [
        h(DndSource, {
          draggable: true,
          dropzone: false,
        }),
        h(DndDropzone),
      ]);

      await simualtor.dragstart(source);
      await simualtor.dragenter(dropzone);

      expect(provider.emitted()).toHaveProperty('drag:enter');
    });
  });

  it("check payload of 'drag:enter'", async () => {
    await iterate(async ({ Provider, simualtor }) => {
      const { provider, source, dropzone } = renderDndProvider(Provider, [
        h(DndSource, {
          label: 'source',
          draggable: true,
          dropzone: false,
        }),
        h(DndDropzone, { label: 'dropzone' }),
      ]);

      await simualtor.dragstart(source);
      await simualtor.dragenter(dropzone);

      const [e] = provider.emitted('drag:enter')![0] as [DragEnterEvent];
      expect(e.source.label).toBe('source');
      expect(e.enter.label).toBe('dropzone');
    });
  });

  it("should set 'instance.over' to the dropzone", async () => {
    await iterate(async ({ Provider, simualtor }) => {
      const { instance, source, dropzone } = renderDndProvider(Provider, [
        h(DndSource, {
          draggable: true,
          dropzone: false,
        }),
        h(DndDropzone, { label: 'dropzone' }),
      ]);

      await simualtor.dragstart(source);
      await simualtor.dragenter(dropzone);

      expect(instance.over?.label).toBe('dropzone');
    });
  });

  it("should add 'dropzone:over' class to the dropzone", async () => {
    await iterate(async ({ Provider, simualtor }) => {
      const { source, dropzone } = renderDndProvider(Provider, [
        h(DndSource, {
          draggable: true,
          dropzone: false,
        }),
        h(DndDropzone),
      ]);

      await simualtor.dragstart(source);
      await simualtor.dragenter(dropzone);

      expect(dropzone.classes()).toBeSuperSetOf(
        ensureArray(defaultDndClasses['dropzone:over'])
      );
    });
  });
});

describe('the current drop target exists, then indicates a other dropzone as the current drop traget', () => {
  it("should emit 'drag:leave'", async () => {
    await iterate(async ({ Provider, simualtor }) => {
      const { provider, source, dropzones } = renderDndProvider(Provider, [
        h(DndSource, {
          draggable: true,
          dropzone: false,
        }),
        h(DndDropzone),
        h(DndDropzone),
      ]);

      await simualtor.dragstart(source);
      await simualtor.dragenter(dropzones[0]);
      await simualtor.dragenter(dropzones[1]);

      expect(provider.emitted()).toHaveProperty('drag:leave');
    });
  });

  it("check payload of 'drag:leave'", async () => {
    await iterate(async ({ Provider, simualtor }) => {
      const { provider, source, dropzones } = renderDndProvider(Provider, [
        h(DndSource, {
          label: 'source',
          draggable: true,
          dropzone: false,
        }),
        h(DndDropzone, { label: 'old-dropzone' }),
        h(DndDropzone),
      ]);

      await simualtor.dragstart(source);
      await simualtor.dragenter(dropzones[0]);
      await simualtor.dragenter(dropzones[1]);

      const [e] = provider.emitted('drag:leave')![0] as [DragLeaveEvent];
      expect(e.source.label).toBe('source');
      expect(e.leave.label).toBe('old-dropzone');
    });
  });

  it("should emit 'drag:enter'", async () => {
    await iterate(async ({ Provider, simualtor }) => {
      const { provider, source, dropzones } = renderDndProvider(Provider, [
        h(DndSource, {
          draggable: true,
          dropzone: false,
        }),
        h(DndDropzone),
        h(DndDropzone),
      ]);

      await simualtor.dragstart(source);
      await simualtor.dragenter(dropzones[0]);
      await simualtor.dragenter(dropzones[1]);

      expect(provider.emitted('drag:enter')).toHaveLength(2);
    });
  });

  it("check payload of 'drag:enter'", async () => {
    await iterate(async ({ Provider, simualtor }) => {
      const { provider, source, dropzones } = renderDndProvider(Provider, [
        h(DndSource, {
          label: 'source',
          draggable: true,
          dropzone: false,
        }),
        h(DndDropzone),
        h(DndDropzone, { label: 'new-dropzone' }),
      ]);

      await simualtor.dragstart(source);
      await simualtor.dragenter(dropzones[0]);
      await simualtor.dragenter(dropzones[1]);

      const [e] = provider.emitted('drag:enter')![1] as [DragEnterEvent];
      expect(e.source.label).toBe('source');
      expect(e.enter.label).toBe('new-dropzone');
    });
  });

  it("should set 'instance.over' to the new dropzone", async () => {
    await iterate(async ({ Provider, simualtor }) => {
      const { instance, source, dropzones } = renderDndProvider(Provider, [
        h(DndSource, {
          draggable: true,
          dropzone: false,
        }),
        h(DndDropzone),
        h(DndDropzone, { label: 'new-dropzone' }),
      ]);

      await simualtor.dragstart(source);
      await simualtor.dragenter(dropzones[0]);
      await simualtor.dragenter(dropzones[1]);

      expect(instance.over?.label).toBe('new-dropzone');
    });
  });

  it("should remove 'dropzone:over' class from the old dropzone ", async () => {
    await iterate(async ({ Provider, simualtor }) => {
      const { source, dropzones } = renderDndProvider(Provider, [
        h(DndSource, {
          draggable: true,
          dropzone: false,
        }),
        h(DndDropzone),
        h(DndDropzone),
      ]);

      await simualtor.dragstart(source);
      await simualtor.dragenter(dropzones[0]);
      expect(dropzones[0].classes()).toBeSuperSetOf(
        ensureArray(defaultDndClasses['dropzone:over'])
      );

      await simualtor.dragenter(dropzones[1]);
      expect(dropzones[0].classes()).not.toBeSuperSetOf(
        ensureArray(defaultDndClasses['dropzone:over'])
      );
    });
  });

  it("should add 'dropzone:over' class to the new dropzone ", async () => {
    await iterate(async ({ Provider, simualtor }) => {
      const { source, dropzones } = renderDndProvider(Provider, [
        h(DndSource, {
          draggable: true,
          dropzone: false,
        }),
        h(DndDropzone),
        h(DndDropzone),
      ]);

      await simualtor.dragstart(source);
      await simualtor.dragenter(dropzones[0]);
      await simualtor.dragenter(dropzones[1]);

      expect(dropzones[1].classes()).toBeSuperSetOf(
        ensureArray(defaultDndClasses['dropzone:over'])
      );
    });
  });
});

describe('indicates a non-dropzone as the current drop traget', () => {
  it("should emit 'drag:leave'", async () => {
    await iterate(async ({ Provider, simualtor }) => {
      const { provider, source, dropzone } = renderDndProvider(Provider, [
        h(DndSource, {
          draggable: true,
          dropzone: false,
        }),
        h(DndDropzone),
      ]);

      await simualtor.dragstart(source);
      await simualtor.dragenter(dropzone);
      await simualtor.dragleave();

      expect(provider.emitted()).toHaveProperty('drag:leave');
    });
  });

  it("check payload of 'drag:leave'", async () => {
    await iterate(async ({ Provider, simualtor }) => {
      const { provider, source, dropzone } = renderDndProvider(Provider, [
        h(DndSource, {
          label: 'source',
          draggable: true,
          dropzone: false,
        }),
        h(DndDropzone, { label: 'dropzone' }),
      ]);

      await simualtor.dragstart(source);
      await simualtor.dragenter(dropzone);
      await simualtor.dragleave();

      const [e] = provider.emitted('drag:leave')![0] as [DragLeaveEvent];
      expect(e.source.label).toBe('source');
      expect(e.leave.label).toBe('dropzone');
    });
  });

  it("should set 'instance.over' to null", async () => {
    await iterate(async ({ Provider, simualtor }) => {
      const { instance, source, dropzone } = renderDndProvider(Provider, [
        h(DndSource, {
          draggable: true,
          dropzone: false,
        }),
        h(DndDropzone),
      ]);

      await simualtor.dragstart(source);
      await simualtor.dragenter(dropzone);
      expect(instance.over).not.toBeNull();

      await simualtor.dragleave();
      expect(instance.over).toBeNull();
    });
  });
});
