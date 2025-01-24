import { afterAll, beforeAll, beforeEach, expect, it, vi } from 'vitest';
import { h } from 'vue';
import {
  TouchDragSimulator,
  renderDndProvider,
  createDndProviderUtilIterator,
} from 'test-utils';
import { DndHandle, DndSource } from '../..';

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

it('check default props configuration', async () => {
  await iterate(async ({ Provider }) => {
    const { handle } = renderDndProvider(
      Provider,
      h(DndSource, () => h(DndHandle))
    );
    const props = handle!.props();

    expect(props.tag).toBe('div');
  });
});

it('should render default slot', async () => {
  await iterate(async ({ Provider }) => {
    const { handle } = renderDndProvider(
      Provider,
      h(DndSource, () => h(DndHandle, () => 'text'))
    );

    expect(handle!.html()).toContain('text');
  });
});

it("should use 'props.tag' as tag of the root element", async () => {
  await iterate(async ({ Provider }) => {
    const { handles } = renderDndProvider(
      Provider,
      h(DndSource, () => h(DndHandle, { tag: 'ul' }))
    );

    expect(handles[0].html()).toContain('ul');
  });
});

it('should work as expected', async () => {
  await iterate(async ({ Provider, simualtor }) => {
    const { provider, source, handle } = renderDndProvider(
      Provider,
      h(DndSource, { draggable: true }, () => [
        h(DndHandle),
        h('div', { class: 'not-handle' }),
      ])
    );

    await simualtor.dragstart(source.find('.not-handle')!);
    expect(provider.emitted()).not.toHaveProperty('drag:start');

    simualtor.reset();
    await simualtor.dragstart(handle!);

    expect(provider.emitted('drag:start')).toHaveLength(1);
  });
});
