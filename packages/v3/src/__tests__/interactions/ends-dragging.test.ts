import { it, describe, expect } from 'vitest';
import {
  createSimulators,
  createTestEnvIterator,
} from '../__helpers__/test-env';
import { h } from 'vue';
import {
  DndSource,
  DndDropzone,
  defaultDndClasses,
  DragLeaveEvent,
  DragEndEvent,
  DropEvent,
} from '../..';

describe("should emit 'drag:end' whether the current drop target exists or not", () => {
  it('exists', async () => {
    const iterate = createTestEnvIterator(
      createSimulators(),
      h(DndSource, { draggable: true, dropzone: true })
    );
    await iterate(async ({ simulator, provider, source }) => {
      await simulator.dragstart(source);
      await simulator.dragend(false);

      expect(provider.emitted()).toHaveProperty('drag:end');
    });
  });

  it('does not exist', async () => {
    const iterate = createTestEnvIterator(
      createSimulators(),
      h(DndSource, { draggable: true, dropzone: false })
    );
    await iterate(async ({ simulator, provider, source }) => {
      await simulator.dragstart(source);
      await simulator.dragend(false);

      expect(provider.emitted()).toHaveProperty('drag:end');
    });
  });
});

it("check payload of 'drag:end'", async () => {
  const iterate = createTestEnvIterator(
    createSimulators(),
    h(DndSource, {
      label: 'source',
      draggable: true,
      dropzone: true,
    })
  );
  await iterate(async ({ simulator, provider, source }) => {
    await simulator.dragstart(source);
    await simulator.dragend(false);

    const [[e]] = provider.emitted('drag:end') as [DragEndEvent][];
    expect(e.source.label).toBe('source');
    expect(e.over?.label).toBe('source');
  });
});

it("should emit 'drop' if the the current drop target is droppable, and should not emit 'drag:leave'", async () => {
  const iterate = createTestEnvIterator(createSimulators(), [
    h(DndSource, { draggable: true, dropzone: false }),
    h(DndDropzone, { droppable: true }),
  ]);
  await iterate(async ({ simulator, provider, source, dropzone }) => {
    await simulator.dragstart(source);
    await simulator.dragenter(dropzone);
    await simulator.dragend(true);

    expect(provider.emitted()).toHaveProperty('drop');
    expect(provider.emitted()).not.toHaveProperty('drag:leav');
  });
});

it("check payload of 'drop'", async () => {
  const iterate = createTestEnvIterator(createSimulators(), [
    h(DndSource, { label: 'source', draggable: true, dropzone: false }),
    h(DndDropzone, { label: 'dropzone', droppable: true }),
  ]);
  await iterate(async ({ simulator, provider, source, dropzone }) => {
    await simulator.dragstart(source);
    await simulator.dragenter(dropzone);
    await simulator.dragend(true);

    const [e] = provider.emitted('drop')![0] as [DropEvent];
    expect(e.source.label).toBe('source');
    expect(e.dropzone.label).toBe('dropzone');
  });
});

it("should emit 'drag:leave' if the current drop target is not droppable, and should not emit 'drop'", async () => {
  const iterate = createTestEnvIterator(createSimulators(), [
    h(DndSource, { draggable: true, dropzone: false }),
    h(DndDropzone, { droppable: false }),
  ]);
  await iterate(async ({ simulator, provider, source, dropzone }) => {
    await simulator.dragstart(source);
    await simulator.dragenter(dropzone);
    await simulator.dragend(false);

    expect(provider.emitted()).toHaveProperty('drag:leave');
    expect(provider.emitted()).not.toHaveProperty('drop');
  });
});

it("check payload of 'drag:leave'", async () => {
  const iterate = createTestEnvIterator(createSimulators(), [
    h(DndSource, { label: 'source', draggable: true, dropzone: false }),
    h(DndDropzone, { label: 'dropzone', droppable: false }),
  ]);
  await iterate(async ({ simulator, provider, source, dropzone }) => {
    await simulator.dragstart(source);
    await simulator.dragenter(dropzone);
    await simulator.dragend(false);

    const [e] = provider.emitted('drag:leave')![0] as [DragLeaveEvent];
    expect(e.source.label).toBe('source');
    expect(e.leave.label).toBe('dropzone');
  });
});

it("should set 'instance.source' and 'instance.over' to null", async () => {
  const iterate = createTestEnvIterator(
    createSimulators(),
    h(DndSource, { draggable: true, dropzone: true })
  );
  await iterate(async ({ simulator, instance, source }) => {
    await simulator.dragstart(source);
    expect(instance.source).not.toBeNull();
    expect(instance.over).not.toBeNull();

    await simulator.dragend(false);
    expect(instance.source).toBeNull();
    expect(instance.over).toBeNull();
  });
});

it("should remove 'source:dragging' class from the source", async () => {
  const iterate = createTestEnvIterator(
    createSimulators(),
    h(DndSource, { draggable: true, dropzone: false })
  );
  await iterate(async ({ simulator, source }) => {
    await simulator.dragstart(source);
    expect(source.classes()).toContain(defaultDndClasses['source:dragging']);

    await simulator.dragend(false);
    expect(source.classes()).not.toContain(
      defaultDndClasses['source:dragging']
    );
  });
});

it("should remove 'dropzone:over' class from the current drop target", async () => {
  const iterate = createTestEnvIterator(createSimulators(), [
    h(DndSource, { draggable: true, dropzone: false }),
    h(DndDropzone, { droppable: true }),
  ]);
  await iterate(async ({ simulator, source, dropzone }) => {
    await simulator.dragstart(source);
    await simulator.dragenter(dropzone);
    expect(dropzone.classes()).toContain(defaultDndClasses['dropzone:over']);

    await simulator.dragend(false);
    expect(dropzone.classes()).not.toContain(
      defaultDndClasses['dropzone:over']
    );
  });
});

it("should remove 'dropzone:droppable' class from all droppable dropzones", async () => {
  const iterate = createTestEnvIterator(createSimulators(), [
    h(DndSource, { draggable: true, dropzone: false }),
    h(DndDropzone, { droppable: true }),
    h(DndDropzone, { droppable: true }),
  ]);
  await iterate(async ({ simulator, source, dropzones }) => {
    await simulator.dragstart(source);
    for (const dropzone of dropzones) {
      expect(dropzone!.classes()).toContain(
        defaultDndClasses['dropzone:droppable']
      );
    }

    await simulator.dragend(false);
    for (const dropzone of dropzones) {
      expect(dropzone!.classes()).not.toContain(
        defaultDndClasses['dropzone:droppable']
      );
    }
  });
});

it("should remove 'dropzone:disabled' class from all not droppable dropzones", async () => {
  const iterate = createTestEnvIterator(createSimulators(), [
    h(DndSource, { draggable: true, dropzone: false }),
    h(DndDropzone, { droppable: false }),
    h(DndDropzone, { droppable: false }),
  ]);
  await iterate(async ({ simulator, source, dropzones }) => {
    await simulator.dragstart(source);
    for (const dropzone of dropzones) {
      expect(dropzone!.classes()).toContain(
        defaultDndClasses['dropzone:disabled']
      );
    }

    await simulator.dragend(false);
    for (const dropzone of dropzones) {
      expect(dropzone!.classes()).not.toContain(
        defaultDndClasses['dropzone:disabled']
      );
    }
  });
});

it('we can drag again', async () => {
  const iterate = createTestEnvIterator(createSimulators(), [
    h(DndSource, { draggable: true }),
    h(DndDropzone),
  ]);
  await iterate(async ({ simulator, provider, instance, source, dropzone }) => {
    await simulator.dragstart(source);
    await simulator.dragend(false);
    await simulator.dragstart(source);
    await simulator.dragenter(dropzone);

    expect(instance.source).not.toBeNull();
    expect(instance.over).not.toBeNull();
    expect(provider.emitted('drag:start')).toHaveLength(2);
    expect(provider.emitted()).toHaveProperty('drag:enter');
  });
});
