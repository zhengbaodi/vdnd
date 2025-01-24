import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { h } from 'vue';
import {
  createDndProviderUtilIterator,
  renderDndProvider,
  TouchDragSimulator,
} from 'test-utils';
import {
  DndSource,
  DndDropzone,
  defaultDndClasses,
  DragLeaveEvent,
  DragEndEvent,
  DropEvent,
} from '../..';

beforeAll(() => {
  vi.useFakeTimers();
  TouchDragSimulator.USE_FAKE_TIMERS = true;
});

afterAll(() => {
  vi.useRealTimers();
  TouchDragSimulator.USE_FAKE_TIMERS = false;
});

let iterate: ReturnType<typeof createDndProviderUtilIterator>;
beforeEach(() => {
  iterate = createDndProviderUtilIterator();
});

describe("should emit 'drag:end' whether the current drop target exists or not", () => {
  it('exists', async () => {
    await iterate(async ({ Provider, simualtor }) => {
      const { provider, source } = renderDndProvider(
        Provider,
        h(DndSource, { draggable: true, dropzone: true })
      );

      await simualtor.dragstart(source);
      await simualtor.dragend(false);

      expect(provider.emitted()).toHaveProperty('drag:end');
    });
  });

  it('does not exist', async () => {
    await iterate(async ({ Provider, simualtor }) => {
      const { provider, source } = renderDndProvider(
        Provider,
        h(DndSource, { draggable: true, dropzone: false })
      );

      await simualtor.dragstart(source);
      await simualtor.dragend(false);

      expect(provider.emitted()).toHaveProperty('drag:end');
    });
  });
});

it("check payload of 'drag:end'", async () => {
  await iterate(async ({ Provider, simualtor }) => {
    const { provider, source } = renderDndProvider(
      Provider,
      h(DndSource, {
        label: 'source',
        draggable: true,
        dropzone: true,
      })
    );

    await simualtor.dragstart(source);
    await simualtor.dragend(false);

    const [[e]] = provider.emitted('drag:end') as [DragEndEvent][];
    expect(e.source.label).toBe('source');
    expect(e.over?.label).toBe('source');
  });
});

it("should emit 'drop' if the the current drop target is droppable, and should not emit 'drag:leave'", async () => {
  await iterate(async ({ Provider, simualtor }) => {
    const { provider, source, dropzone } = renderDndProvider(Provider, [
      h(DndSource, { draggable: true, dropzone: false }),
      h(DndDropzone, { droppable: true }),
    ]);

    await simualtor.dragstart(source);
    await simualtor.dragenter(dropzone);
    await simualtor.dragend(true);

    expect(provider.emitted()).toHaveProperty('drop');
    expect(provider.emitted()).not.toHaveProperty('drag:leav');
  });
});

it("check payload of 'drop'", async () => {
  await iterate(async ({ Provider, simualtor }) => {
    const { provider, source, dropzone } = renderDndProvider(Provider, [
      h(DndSource, { label: 'source', draggable: true, dropzone: false }),
      h(DndDropzone, { label: 'dropzone', droppable: true }),
    ]);

    await simualtor.dragstart(source);
    await simualtor.dragenter(dropzone);
    await simualtor.dragend(true);

    const [e] = provider.emitted('drop')![0] as [DropEvent];
    expect(e.source.label).toBe('source');
    expect(e.dropzone.label).toBe('dropzone');
  });
});

it("should emit 'drag:leave' if the current drop target is not droppable, and should not emit 'drop'", async () => {
  await iterate(async ({ Provider, simualtor }) => {
    const { provider, source, dropzone } = renderDndProvider(Provider, [
      h(DndSource, { draggable: true, dropzone: false }),
      h(DndDropzone, { droppable: false }),
    ]);

    await simualtor.dragstart(source);
    await simualtor.dragenter(dropzone);
    await simualtor.dragend(false);

    expect(provider.emitted()).toHaveProperty('drag:leave');
    expect(provider.emitted()).not.toHaveProperty('drop');
  });
});

it("check payload of 'drag:leave'", async () => {
  await iterate(async ({ Provider, simualtor }) => {
    const { provider, source, dropzone } = renderDndProvider(Provider, [
      h(DndSource, { label: 'source', draggable: true, dropzone: false }),
      h(DndDropzone, { label: 'dropzone', droppable: false }),
    ]);

    await simualtor.dragstart(source);
    await simualtor.dragenter(dropzone);
    await simualtor.dragend(false);

    const [e] = provider.emitted('drag:leave')![0] as [DragLeaveEvent];
    expect(e.source.label).toBe('source');
    expect(e.leave.label).toBe('dropzone');
  });
});

it("should set 'instance.source' and 'instance.over' to null", async () => {
  await iterate(async ({ Provider, simualtor }) => {
    const { instance, source } = renderDndProvider(
      Provider,
      h(DndSource, { draggable: true, dropzone: true })
    );

    await simualtor.dragstart(source);
    expect(instance.source).not.toBeNull();
    expect(instance.over).not.toBeNull();

    await simualtor.dragend(false);
    expect(instance.source).toBeNull();
    expect(instance.over).toBeNull();
  });
});

it("should remove 'source:dragging' class from the source", async () => {
  await iterate(async ({ Provider, simualtor }) => {
    const { source } = renderDndProvider(
      Provider,
      h(DndSource, { draggable: true, dropzone: false })
    );

    await simualtor.dragstart(source);
    expect(source.classes()).toContain(defaultDndClasses['source:dragging']);

    await simualtor.dragend(false);
    expect(source.classes()).not.toContain(
      defaultDndClasses['source:dragging']
    );
  });
});

it("should remove 'dropzone:over' class from the current drop target", async () => {
  await iterate(async ({ Provider, simualtor }) => {
    const { source, dropzone } = renderDndProvider(Provider, [
      h(DndSource, { draggable: true, dropzone: false }),
      h(DndDropzone, { droppable: true }),
    ]);

    await simualtor.dragstart(source);
    await simualtor.dragenter(dropzone);
    expect(dropzone.classes()).toContain(defaultDndClasses['dropzone:over']);

    await simualtor.dragend(false);
    expect(dropzone.classes()).not.toContain(
      defaultDndClasses['dropzone:over']
    );
  });
});

it("should remove 'dropzone:droppable' class from all droppable dropzones", async () => {
  await iterate(async ({ Provider, simualtor }) => {
    const { source, dropzones } = renderDndProvider(Provider, [
      h(DndSource, { draggable: true, dropzone: false }),
      h(DndDropzone, { droppable: true }),
      h(DndDropzone, { droppable: true }),
    ]);

    await simualtor.dragstart(source);
    for (const dropzone of dropzones) {
      expect(dropzone!.classes()).toContain(
        defaultDndClasses['dropzone:droppable']
      );
    }

    await simualtor.dragend(false);
    for (const dropzone of dropzones) {
      expect(dropzone!.classes()).not.toContain(
        defaultDndClasses['dropzone:droppable']
      );
    }
  });
});

it("should remove 'dropzone:disabled' class from all not droppable dropzones", async () => {
  await iterate(async ({ Provider, simualtor }) => {
    const { source, dropzones } = renderDndProvider(Provider, [
      h(DndSource, { draggable: true, dropzone: false }),
      h(DndDropzone, { droppable: false }),
      h(DndDropzone, { droppable: false }),
    ]);

    await simualtor.dragstart(source);
    for (const dropzone of dropzones) {
      expect(dropzone!.classes()).toContain(
        defaultDndClasses['dropzone:disabled']
      );
    }

    await simualtor.dragend(false);
    for (const dropzone of dropzones) {
      expect(dropzone!.classes()).not.toContain(
        defaultDndClasses['dropzone:disabled']
      );
    }
  });
});

it('we can drag again', async () => {
  await iterate(async ({ Provider, simualtor }) => {
    const { provider, instance, source, dropzone } = renderDndProvider(
      Provider,
      [h(DndSource, { draggable: true }), h(DndDropzone)]
    );

    await simualtor.dragstart(source);
    await simualtor.dragend(false);
    await simualtor.dragstart(source);
    await simualtor.dragenter(dropzone);

    expect(instance.source).not.toBeNull();
    expect(instance.over).not.toBeNull();
    expect(provider.emitted('drag:start')).toHaveLength(2);
    expect(provider.emitted()).toHaveProperty('drag:enter');
  });
});
