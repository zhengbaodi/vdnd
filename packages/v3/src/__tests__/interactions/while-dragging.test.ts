import { it, vi, describe, expect } from 'vitest';
import {
  createSimulators,
  createTestEnvIterator,
} from '../__helpers__/test-env';
import { h } from 'vue';
import { SimulatedDnd } from '@vdnd/base';
import { ensureArray } from '@vdnd/shared';
import {
  DndSource,
  DragEvent,
  DragOverEvent,
  DragEnterEvent,
  DragLeaveEvent,
  defaultDndClasses,
  DndDropzone,
} from '../..';

it("should emit 'drag' at interval", async () => {
  const INTERVAL = SimulatedDnd.eventTriggeringInterval.drag;
  const iterate = createTestEnvIterator(
    createSimulators(),
    h(DndSource, { draggable: true })
  );
  await iterate(async ({ simulator, provider, source }) => {
    await simulator.dragstart(source);
    vi.advanceTimersByTime(INTERVAL * 2);

    expect(provider.emitted('drag')).toHaveLength(2);
  });
});

it("check payload of 'drag'", async () => {
  const INTERVAL = SimulatedDnd.eventTriggeringInterval.drag;
  const iterate = createTestEnvIterator(
    createSimulators(),
    h(DndSource, {
      label: 'source',
      draggable: true,
      dropzone: true,
      droppable: true,
    })
  );
  await iterate(async ({ native, simulator, provider, source }) => {
    await simulator.dragstart(source);
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
  const INTERVAL = SimulatedDnd.eventTriggeringInterval.dragover;
  const iterate = createTestEnvIterator(
    createSimulators(),
    h(DndSource, {
      draggable: true,
      dropzone: true,
      droppable: true,
    })
  );
  await iterate(async ({ simulator, provider, source }) => {
    await simulator.dragstart(source);
    vi.advanceTimersByTime(INTERVAL * 2);

    expect(provider.emitted('drag:over')).toHaveLength(2);
  });
});

it("check payload of 'drag:over'", async () => {
  const INTERVAL = SimulatedDnd.eventTriggeringInterval.dragover;
  const iterate = createTestEnvIterator(
    createSimulators(),
    h(DndSource, {
      label: 'source',
      draggable: true,
      dropzone: true,
      droppable: true,
    })
  );
  await iterate(async ({ native, simulator, provider, source }) => {
    await simulator.dragstart(source);
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
    const iterate = createTestEnvIterator(createSimulators(), [
      h(DndSource, {
        draggable: true,
        dropzone: false,
      }),
      h(DndDropzone),
    ]);
    await iterate(async ({ simulator, provider, source, dropzone }) => {
      await simulator.dragstart(source);
      await simulator.dragenter(dropzone);

      expect(provider.emitted()).toHaveProperty('drag:enter');
    });
  });

  it("check payload of 'drag:enter'", async () => {
    const iterate = createTestEnvIterator(createSimulators(), [
      h(DndSource, {
        label: 'source',
        draggable: true,
        dropzone: false,
      }),
      h(DndDropzone, { label: 'dropzone' }),
    ]);
    await iterate(async ({ simulator, provider, source, dropzone }) => {
      await simulator.dragstart(source);
      await simulator.dragenter(dropzone);

      const [e] = provider.emitted('drag:enter')![0] as [DragEnterEvent];
      expect(e.source.label).toBe('source');
      expect(e.enter.label).toBe('dropzone');
    });
  });

  it("should set 'instance.over' to the dropzone", async () => {
    const iterate = createTestEnvIterator(createSimulators(), [
      h(DndSource, {
        draggable: true,
        dropzone: false,
      }),
      h(DndDropzone, { label: 'dropzone' }),
    ]);
    await iterate(async ({ simulator, instance, source, dropzone }) => {
      await simulator.dragstart(source);
      await simulator.dragenter(dropzone);

      expect(instance.over?.label).toBe('dropzone');
    });
  });

  it("should add 'dropzone:over' class to the dropzone", async () => {
    const iterate = createTestEnvIterator(createSimulators(), [
      h(DndSource, {
        draggable: true,
        dropzone: false,
      }),
      h(DndDropzone),
    ]);
    await iterate(async ({ simulator, source, dropzone }) => {
      await simulator.dragstart(source);
      await simulator.dragenter(dropzone);

      expect(dropzone.classes()).toBeSuperSetOf(
        ensureArray(defaultDndClasses['dropzone:over'])
      );
    });
  });
});

describe('the current drop target exists, then indicates a other dropzone as the current drop traget', () => {
  it("should emit 'drag:leave'", async () => {
    const iterate = createTestEnvIterator(createSimulators(), [
      h(DndSource, {
        draggable: true,
        dropzone: false,
      }),
      h(DndDropzone),
      h(DndDropzone),
    ]);
    await iterate(async ({ simulator, provider, source, dropzones }) => {
      await simulator.dragstart(source);
      await simulator.dragenter(dropzones[0]);
      await simulator.dragenter(dropzones[1]);

      expect(provider.emitted()).toHaveProperty('drag:leave');
    });
  });

  it("check payload of 'drag:leave'", async () => {
    const iterate = createTestEnvIterator(createSimulators(), [
      h(DndSource, {
        label: 'source',
        draggable: true,
        dropzone: false,
      }),
      h(DndDropzone, { label: 'old-dropzone' }),
      h(DndDropzone),
    ]);

    await iterate(async ({ simulator, provider, source, dropzones }) => {
      await simulator.dragstart(source);
      await simulator.dragenter(dropzones[0]);
      await simulator.dragenter(dropzones[1]);

      const [e] = provider.emitted('drag:leave')![0] as [DragLeaveEvent];
      expect(e.source.label).toBe('source');
      expect(e.leave.label).toBe('old-dropzone');
    });
  });

  it("should emit 'drag:enter'", async () => {
    const iterate = createTestEnvIterator(createSimulators(), [
      h(DndSource, {
        draggable: true,
        dropzone: false,
      }),
      h(DndDropzone),
      h(DndDropzone),
    ]);
    await iterate(async ({ simulator, provider, source, dropzones }) => {
      await simulator.dragstart(source);
      await simulator.dragenter(dropzones[0]);
      await simulator.dragenter(dropzones[1]);

      expect(provider.emitted('drag:enter')).toHaveLength(2);
    });
  });

  it("check payload of 'drag:enter'", async () => {
    const iterate = createTestEnvIterator(createSimulators(), [
      h(DndSource, {
        label: 'source',
        draggable: true,
        dropzone: false,
      }),
      h(DndDropzone),
      h(DndDropzone, { label: 'new-dropzone' }),
    ]);
    await iterate(async ({ simulator, provider, source, dropzones }) => {
      await simulator.dragstart(source);
      await simulator.dragenter(dropzones[0]);
      await simulator.dragenter(dropzones[1]);

      const [e] = provider.emitted('drag:enter')![1] as [DragEnterEvent];
      expect(e.source.label).toBe('source');
      expect(e.enter.label).toBe('new-dropzone');
    });
  });

  it("should set 'instance.over' to the new dropzone", async () => {
    const iterate = createTestEnvIterator(createSimulators(), [
      h(DndSource, {
        draggable: true,
        dropzone: false,
      }),
      h(DndDropzone),
      h(DndDropzone, { label: 'new-dropzone' }),
    ]);
    await iterate(async ({ simulator, instance, source, dropzones }) => {
      await simulator.dragstart(source);
      await simulator.dragenter(dropzones[0]);
      await simulator.dragenter(dropzones[1]);

      expect(instance.over?.label).toBe('new-dropzone');
    });
  });

  it("should remove 'dropzone:over' class from the old dropzone ", async () => {
    const iterate = createTestEnvIterator(createSimulators(), [
      h(DndSource, {
        draggable: true,
        dropzone: false,
      }),
      h(DndDropzone),
      h(DndDropzone),
    ]);
    await iterate(async ({ simulator, source, dropzones }) => {
      await simulator.dragstart(source);
      await simulator.dragenter(dropzones[0]);
      expect(dropzones[0].classes()).toBeSuperSetOf(
        ensureArray(defaultDndClasses['dropzone:over'])
      );

      await simulator.dragenter(dropzones[1]);
      expect(dropzones[0].classes()).not.toBeSuperSetOf(
        ensureArray(defaultDndClasses['dropzone:over'])
      );
    });
  });

  it("should add 'dropzone:over' class to the new dropzone ", async () => {
    const iterate = createTestEnvIterator(createSimulators(), [
      h(DndSource, {
        draggable: true,
        dropzone: false,
      }),
      h(DndDropzone),
      h(DndDropzone),
    ]);
    await iterate(async ({ simulator, source, dropzones }) => {
      await simulator.dragstart(source);
      await simulator.dragenter(dropzones[0]);
      await simulator.dragenter(dropzones[1]);

      expect(dropzones[1].classes()).toBeSuperSetOf(
        ensureArray(defaultDndClasses['dropzone:over'])
      );
    });
  });
});

describe('indicates a non-dropzone as the current drop traget', () => {
  it("should emit 'drag:leave'", async () => {
    const iterate = createTestEnvIterator(createSimulators(), [
      h(DndSource, {
        draggable: true,
        dropzone: false,
      }),
      h(DndDropzone),
    ]);
    await iterate(async ({ simulator, provider, source, dropzone }) => {
      await simulator.dragstart(source);
      await simulator.dragenter(dropzone);
      await simulator.dragleave();

      expect(provider.emitted()).toHaveProperty('drag:leave');
    });
  });

  it("check payload of 'drag:leave'", async () => {
    const iterate = createTestEnvIterator(createSimulators(), [
      h(DndSource, {
        label: 'source',
        draggable: true,
        dropzone: false,
      }),
      h(DndDropzone, { label: 'dropzone' }),
    ]);
    await iterate(async ({ simulator, provider, source, dropzone }) => {
      await simulator.dragstart(source);
      await simulator.dragenter(dropzone);
      await simulator.dragleave();

      const [e] = provider.emitted('drag:leave')![0] as [DragLeaveEvent];
      expect(e.source.label).toBe('source');
      expect(e.leave.label).toBe('dropzone');
    });
  });

  it("should set 'instance.over' to null", async () => {
    const iterate = createTestEnvIterator(createSimulators(), [
      h(DndSource, {
        draggable: true,
        dropzone: false,
      }),
      h(DndDropzone),
    ]);
    await iterate(async ({ simulator, instance, source, dropzone }) => {
      await simulator.dragstart(source);
      await simulator.dragenter(dropzone);
      expect(instance.over).not.toBeNull();

      await simulator.dragleave();
      expect(instance.over).toBeNull();
    });
  });
});
