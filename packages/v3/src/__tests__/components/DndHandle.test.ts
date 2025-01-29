import { expect, it } from 'vitest';
import {
  createSimulators,
  createTestEnvIterator,
} from '../__helpers__/test-env';
import { h } from 'vue';
import { DndHandle, DndSource } from '../..';

it('check default props configuration', async () => {
  const iterate = createTestEnvIterator(
    createSimulators(),
    h(DndSource, () => h(DndHandle))
  );
  await iterate(async ({ handle }) => {
    const props = handle!.props();
    expect(props.tag).toBe('div');
  });
});

it('should render default slot', async () => {
  const iterate = createTestEnvIterator(
    createSimulators(),
    h(DndSource, () => h(DndHandle, () => 'text'))
  );
  await iterate(async ({ handle }) => {
    expect(handle!.html()).toContain('text');
  });
});

it("should use 'props.tag' as tag of the root element", async () => {
  const iterate = createTestEnvIterator(
    createSimulators(),
    h(DndSource, () => h(DndHandle, { tag: 'ul' }))
  );
  await iterate(async ({ handles }) => {
    expect(handles[0].html()).toContain('ul');
  });
});

it('should work as expected', async () => {
  const iterate = createTestEnvIterator(
    createSimulators(),
    h(DndSource, { draggable: true }, () => [
      h(DndHandle),
      h('div', { class: 'not-handle' }),
    ])
  );
  await iterate(async ({ provider, source, handle, simulator }) => {
    await simulator.dragstart(source.find('.not-handle')!);
    expect(provider.emitted()).not.toHaveProperty('drag:start');

    simulator.reset();
    await simulator.dragstart(handle!);

    expect(provider.emitted('drag:start')).toHaveLength(1);
  });
});
