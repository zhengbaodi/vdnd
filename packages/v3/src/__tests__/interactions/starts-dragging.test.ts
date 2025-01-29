import { describe, expect, vi, it } from 'vitest';
import { TouchDragSimulator } from '@vdnd/test-utils';
import {
  createSimulators,
  createTestEnvIterator,
} from '../__helpers__/test-env';
import { h } from 'vue';
import { ensureArray } from '@vdnd/shared';
import {
  DndSource,
  DragStartEvent,
  defaultDndClasses,
  DndDropzone,
  DragEnterEvent,
  DragPreventEvent,
} from '../..';

describe('drags a draggable source', () => {
  it("should emit 'drag:start'", async () => {
    const iterate = createTestEnvIterator(
      createSimulators(),
      h(DndSource, { draggable: true })
    );
    await iterate(async ({ simulator, provider, source }) => {
      await simulator.dragstart(source);
      expect(provider.emitted()).toHaveProperty('drag:start');
    });
  });

  it("check payload of 'drag:start'", async () => {
    const iterate = createTestEnvIterator(
      createSimulators(),
      h(DndSource, {
        label: 'source',
        draggable: true,
      })
    );
    await iterate(async ({ simulator, provider, source }) => {
      await simulator.dragstart(source);

      const [payload] = provider.emitted('drag:start')!;
      const e = payload[0] as DragStartEvent;
      expect(e.source).toMatchObject({
        label: 'source',
      });
    });
  });

  it("should not emit 'drag:prevent'", async () => {
    const iterate = createTestEnvIterator(
      createSimulators(),
      h(DndSource, { draggable: true })
    );
    await iterate(async ({ simulator, provider, source }) => {
      await simulator.dragstart(source);
      expect(provider.emitted()).not.toHaveProperty('drag:prevent');
    });
  });

  describe('when the source is a dropzone', () => {
    it("should emit 'drag:enter'", async () => {
      const iterate = createTestEnvIterator(
        createSimulators(),
        h(DndSource, { draggable: true, dropzone: true })
      );
      await iterate(async ({ simulator, provider, source }) => {
        await simulator.dragstart(source);
        expect(provider.emitted()).toHaveProperty('drag:enter');
      });
    });

    it("check payload of 'drag:enter'", async () => {
      const iterate = createTestEnvIterator(
        createSimulators(),
        h(DndSource, { label: 'source', draggable: true, dropzone: true })
      );
      await iterate(async ({ simulator, provider, source }) => {
        await simulator.dragstart(source);

        const [e] = provider.emitted('drag:enter')![0] as [DragEnterEvent];
        expect(e.source.label).toBe('source');
        expect(e.enter.label).toBe('source');
      });
    });

    it("should set 'instance.over' to the source", async () => {
      const iterate = createTestEnvIterator(
        createSimulators(),
        h(DndSource, {
          label: 'source',
          draggable: true,
          dropzone: true,
        })
      );
      await iterate(async ({ simulator, instance, source }) => {
        await simulator.dragstart(source);
        expect(instance.over?.label).toBe('source');
      });
    });

    it("should add 'dropzone:over' class to the source", async () => {
      const iterate = createTestEnvIterator(
        createSimulators(),
        h(DndSource, {
          label: 'source',
          draggable: true,
          dropzone: true,
        })
      );
      await iterate(async ({ simulator, source }) => {
        await simulator.dragstart(source);
        expect(source.classes()).toBeSuperSetOf(
          ensureArray(defaultDndClasses['dropzone:over'])
        );
      });
    });
  });

  it("should set 'instance.source' to the source", async () => {
    const iterate = createTestEnvIterator(
      createSimulators(),
      h(DndSource, { label: 'source', draggable: true })
    );
    await iterate(async ({ simulator, instance, source }) => {
      await simulator.dragstart(source);
      expect(instance.source?.label).toBe('source');
    });
  });

  it("should add 'source:dragging' class to the source", async () => {
    const iterate = createTestEnvIterator(
      createSimulators(),
      h(DndSource, { draggable: true, dropzone: false })
    );
    await iterate(async ({ simulator, source }) => {
      await simulator.dragstart(source);
      expect(source.classes()).toBeSuperSetOf(
        ensureArray(defaultDndClasses['source:dragging'])
      );
    });
  });

  it("should add 'dropzone:droppable' class to all droppable dropzones", async () => {
    const iterate = createTestEnvIterator(createSimulators(), [
      h(DndSource, {
        draggable: true,
        dropzone: true,
        droppable: true,
      }),
      h(DndDropzone, { droppable: true }),
      h(DndDropzone, { droppable: false }),
    ]);
    await iterate(async ({ simulator, source, dropzones }) => {
      await simulator.dragstart(source);

      const classNames = ensureArray(defaultDndClasses['dropzone:droppable']);
      for (const dropzone of dropzones) {
        if (dropzone.props().droppable) {
          expect(dropzone.attributes('class')).toBeSuperSetOf(classNames);
        } else {
          expect(dropzone.attributes('class')).not.toBeSuperSetOf(classNames);
        }
      }
    });
  });

  it("should add 'dropzone:disabled' class to all not droppable dropzones", async () => {
    const iterate = createTestEnvIterator(createSimulators(), [
      h(DndSource, { draggable: true, dropzone: true, droppable: false }),
      h(DndDropzone, { droppable: true }),
      h(DndDropzone, { droppable: false }),
    ]);
    await iterate(async ({ simulator, source, dropzones }) => {
      await simulator.dragstart(source);

      const className = ensureArray(defaultDndClasses['dropzone:disabled']);
      for (const dropzone of dropzones) {
        if (!dropzone.props().droppable) {
          expect(dropzone.attributes('class')).toBeSuperSetOf(className);
        } else {
          expect(dropzone.attributes('class')).not.toBeSuperSetOf(className);
        }
      }
    });
  });
});

describe('drags a not draggable source', () => {
  it("should emit 'drag:prevent'", async () => {
    const iterate = createTestEnvIterator(
      createSimulators(),
      h(DndSource, { draggable: false })
    );
    await iterate(async ({ simulator, provider, source }) => {
      await simulator.dragstart(source);
      expect(provider.emitted()).toHaveProperty('drag:prevent');
    });
  });

  it("check payload of 'drag:prevent'", async () => {
    const iterate = createTestEnvIterator(
      createSimulators(),
      h(DndSource, { label: 'source', draggable: false })
    );
    await iterate(async ({ simulator, provider, source }) => {
      await simulator.dragstart(source);
      const [e] = provider.emitted('drag:prevent')![0] as [DragPreventEvent];
      expect(e.source.label).toBe('source');
    });
  });

  it("should not emit 'drag:start'", async () => {
    const iterate = createTestEnvIterator(
      createSimulators(),
      h(DndSource, { draggable: false })
    );
    await iterate(async ({ simulator, provider, source }) => {
      await simulator.dragstart(source);
      expect(provider.emitted()).not.toHaveProperty('drag:start');
    });
  });

  it('should not initiate drag-flow', async () => {
    const iterate = createTestEnvIterator(createSimulators(), [
      h(DndSource, { draggable: false, dropzone: true, droppable: true }),
      h(DndDropzone, { droppable: true }),
      h(DndDropzone, { droppable: true }),
      h(DndDropzone, { droppable: true }),
    ]);

    await iterate(
      async ({ simulator, provider, instance, source, dropzones }) => {
        vi.useRealTimers();
        TouchDragSimulator.USE_FAKE_TIMERS = false;

        await simulator.dragstart(source);
        await simulator.dragenter(source);

        expect(provider.emitted()).not.toHaveProperty('drag:enter');
        expect(instance.source).toBeNull();
        for (const dropzone of dropzones) {
          expect(dropzone.attributes('class')).not.toBeSuperSetOf(
            ensureArray(defaultDndClasses['dropzone:droppable'])
          );
        }
      }
    );
  });

  it('we can drag again', async () => {
    const iterate = createTestEnvIterator(
      createSimulators(),
      h(DndSource, { draggable: false })
    );

    await iterate(async ({ simulator, provider, source }) => {
      vi.useRealTimers();
      TouchDragSimulator.USE_FAKE_TIMERS = false;

      await simulator.dragstart(source);
      await simulator.dragend(false);
      await simulator.dragstart(source);

      expect(provider.emitted('drag:prevent')).toHaveLength(2);
    });
  });
});
