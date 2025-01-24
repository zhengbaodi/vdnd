import { afterEach, beforeEach, describe, expect, vi, it } from 'vitest';
import { h } from 'vue';
import {
  TouchDragSimulator,
  renderDndProvider,
  createDndProviderUtilIterator,
} from 'test-utils';
import {
  DndSource,
  DragStartEvent,
  defaultDndClasses,
  DndDropzone,
  DragEnterEvent,
  DragPreventEvent,
} from '../..';
import ensureArray from '@shared/ensureArray';

beforeEach(() => {
  vi.useFakeTimers();
  TouchDragSimulator.USE_FAKE_TIMERS = true;
});

afterEach(() => {
  vi.useRealTimers();
  TouchDragSimulator.USE_FAKE_TIMERS = false;
});

let iterate: ReturnType<typeof createDndProviderUtilIterator>;
beforeEach(() => {
  iterate = createDndProviderUtilIterator();
});

describe('drags a draggable source', () => {
  it("should emit 'drag:start'", async () => {
    await iterate(async ({ Provider, simualtor }) => {
      const { provider, source } = renderDndProvider(
        Provider,
        h(DndSource, { draggable: true })
      );

      await simualtor.dragstart(source);

      expect(provider.emitted()).toHaveProperty('drag:start');
    });
  });

  it("check payload of 'drag:start'", async () => {
    await iterate(async ({ Provider, simualtor }) => {
      const { provider, source } = renderDndProvider(
        Provider,
        h(DndSource, {
          label: 'source',
          draggable: true,
        })
      );

      await simualtor.dragstart(source);

      const [payload] = provider.emitted('drag:start')!;
      const e = payload[0] as DragStartEvent;
      expect(e.source).toMatchObject({
        label: 'source',
      });
    });
  });

  it("should not emit 'drag:prevent'", async () => {
    await iterate(async ({ Provider, simualtor }) => {
      const { provider, source } = renderDndProvider(
        Provider,
        h(DndSource, { draggable: true })
      );

      await simualtor.dragstart(source);

      expect(provider.emitted()).not.toHaveProperty('drag:prevent');
    });
  });

  describe('when the source is a dropzone', () => {
    it("should emit 'drag:enter'", async () => {
      await iterate(async ({ Provider, simualtor }) => {
        const { provider, source } = renderDndProvider(
          Provider,
          h(DndSource, { draggable: true, dropzone: true })
        );

        await simualtor.dragstart(source);

        expect(provider.emitted()).toHaveProperty('drag:enter');
      });
    });

    it("check payload of 'drag:enter'", async () => {
      await iterate(async ({ Provider, simualtor }) => {
        const { provider, source } = renderDndProvider(
          Provider,
          h(DndSource, { label: 'source', draggable: true, dropzone: true })
        );

        await simualtor.dragstart(source);

        const [e] = provider.emitted('drag:enter')![0] as [DragEnterEvent];
        expect(e.source.label).toBe('source');
        expect(e.enter.label).toBe('source');
      });
    });

    it("should set 'instance.over' to the source", async () => {
      await iterate(async ({ Provider, simualtor }) => {
        const { instance, source } = renderDndProvider(
          Provider,
          h(DndSource, {
            label: 'source',
            draggable: true,
            dropzone: true,
          })
        );

        await simualtor.dragstart(source);

        expect(instance.over?.label).toBe('source');
      });
    });

    it("should add 'dropzone:over' class to the source", async () => {
      await iterate(async ({ Provider, simualtor }) => {
        const { source } = renderDndProvider(
          Provider,
          h(DndSource, {
            label: 'source',
            draggable: true,
            dropzone: true,
          })
        );

        await simualtor.dragstart(source);

        expect(source.classes()).toBeSuperSetOf(
          ensureArray(defaultDndClasses['dropzone:over'])
        );
      });
    });
  });

  it("should set 'instance.source' to the source", async () => {
    await iterate(async ({ Provider, simualtor }) => {
      const { instance, source } = renderDndProvider(
        Provider,
        h(DndSource, { label: 'source', draggable: true })
      );

      await simualtor.dragstart(source);

      expect(instance.source?.label).toBe('source');
    });
  });

  it("should add 'source:dragging' class to the source", async () => {
    await iterate(async ({ Provider, simualtor }) => {
      const { source } = renderDndProvider(
        Provider,
        h(DndSource, { draggable: true, dropzone: false })
      );

      await simualtor.dragstart(source);

      expect(source.classes()).toBeSuperSetOf(
        ensureArray(defaultDndClasses['source:dragging'])
      );
    });
  });

  it("should add 'dropzone:droppable' class to all droppable dropzones", async () => {
    await iterate(async ({ Provider, simualtor }) => {
      const { dropzones, source } = renderDndProvider(Provider, [
        h(DndSource, {
          draggable: true,
          dropzone: true,
          droppable: true,
        }),
        h(DndDropzone, { droppable: true }),
        h(DndDropzone, { droppable: false }),
      ]);

      await simualtor.dragstart(source);

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
    await iterate(async ({ Provider, simualtor }) => {
      const { dropzones, source } = renderDndProvider(Provider, [
        h(DndSource, { draggable: true, dropzone: true, droppable: false }),
        h(DndDropzone, { droppable: true }),
        h(DndDropzone, { droppable: false }),
      ]);

      await simualtor.dragstart(source);

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
    await iterate(async ({ Provider, simualtor }) => {
      const { provider, source } = renderDndProvider(
        Provider,
        h(DndSource, { draggable: false })
      );

      await simualtor.dragstart(source);

      expect(provider.emitted()).toHaveProperty('drag:prevent');
    });
  });

  it("check payload of 'drag:prevent'", async () => {
    await iterate(async ({ Provider, simualtor }) => {
      const { provider, source } = renderDndProvider(
        Provider,
        h(DndSource, {
          label: 'source',
          draggable: false,
        })
      );

      await simualtor.dragstart(source);

      const [e] = provider.emitted('drag:prevent')![0] as [DragPreventEvent];
      expect(e.source.label).toBe('source');
    });
  });

  it("should not emit 'drag:start'", async () => {
    await iterate(async ({ Provider, simualtor }) => {
      const { provider, source } = renderDndProvider(
        Provider,
        h(DndSource, { draggable: false })
      );

      await simualtor.dragstart(source);

      expect(provider.emitted()).not.toHaveProperty('drag:start');
    });
  });

  it('should not initiate drag-flow', async () => {
    vi.useRealTimers();
    TouchDragSimulator.USE_FAKE_TIMERS = false;
    const vnodes = [
      h(DndSource, { draggable: false, dropzone: true, droppable: true }),
      h(DndDropzone, { droppable: true }),
      h(DndDropzone, { droppable: true }),
      h(DndDropzone, { droppable: true }),
    ];

    await iterate(async ({ Provider, simualtor }) => {
      const { provider, instance, source, dropzones } = renderDndProvider(
        Provider,
        vnodes
      );

      await simualtor.dragstart(source);
      await simualtor.dragenter(source);

      expect(provider.emitted()).not.toHaveProperty('drag:enter');
      expect(instance.source).toBeNull();
      for (const dropzone of dropzones) {
        expect(dropzone.attributes('class')).not.toBeSuperSetOf(
          ensureArray(defaultDndClasses['dropzone:droppable'])
        );
      }
    });
  });

  it('we can drag again', async () => {
    vi.useRealTimers();
    TouchDragSimulator.USE_FAKE_TIMERS = false;

    await iterate(async ({ Provider, simualtor }) => {
      const { provider, source } = renderDndProvider(
        Provider,
        h(DndSource, { draggable: false })
      );

      await simualtor.dragstart(source);
      await simualtor.dragend(false);
      await simualtor.dragstart(source);

      expect(provider.emitted('drag:prevent')).toHaveLength(2);
    });
  });
});
