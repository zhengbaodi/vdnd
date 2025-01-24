import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { h, nextTick, ref, reactive } from 'vue';
import {
  TouchDragSimulator,
  renderDndProvider,
  createDndProviderUtilIterator,
} from 'test-utils';
import { DndSource, DndElement, DndDropzone } from '../..';

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

it('Construction of DndElementTree', async () => {
  await iterate(async ({ Provider }) => {
    const shouldRenderElements = ref(true);
    const renderElements = () =>
      h(DndSource, { label: '1' }, () => [
        h(DndDropzone, { label: '1.1' }, () =>
          h(DndSource, { label: '1.1.1' })
        ),
        h(DndSource, { label: '1.2' }, () =>
          h(DndDropzone, { label: '1.2.1' })
        ),
      ]);

    const { instance } = renderDndProvider(
      Provider,
      h(() => (shouldRenderElements.value ? renderElements() : null))
    );

    expect(instance.rootDndElement).toMatchObject({
      parent: null,
      children: [
        {
          label: '1',
          children: [
            {
              label: '1.1',
              children: [
                {
                  label: '1.1.1',
                  children: [],
                },
              ],
            },
            {
              label: '1.2',
              children: [
                {
                  label: '1.2.1',
                  children: [],
                },
              ],
            },
          ],
        },
      ],
    } satisfies DeepPartial<DndElement>);

    shouldRenderElements.value = false;
    await nextTick();
    expect(instance.rootDndElement).toMatchObject({
      parent: null,
      children: [],
    } satisfies DeepPartial<DndElement>);
  });
});

describe('DndSource', () => {
  it('check default props configuration', async () => {
    await iterate(async ({ Provider }) => {
      const { source } = renderDndProvider(Provider, h(DndSource));
      const props = source.props();

      expect(props.tag).toBe('div');
      expect(props.label).toBeUndefined();
      expect(props.value).toBeUndefined();
      expect(props.draggable).toBe(true);
      expect(props.dropzone).toBe(false);
      expect(props.droppable).toBeUndefined();
    });
  });

  it('should render default slot', async () => {
    await iterate(async ({ Provider }) => {
      const { source } = renderDndProvider(
        Provider,
        h(DndSource, { draggable: true }, () => 'text')
      );

      expect(source.html()).toContain('text');
    });
  });

  it("should use 'props.tag' as tag of the root element", async () => {
    await iterate(async ({ Provider }) => {
      const { sources } = renderDndProvider(
        Provider,
        h(DndSource, { tag: 'ul' })
      );

      expect(sources[0].html()).toContain('ul');
    });
  });

  it('should synchronize changes of props to the DndElement in DndElementTree', async () => {
    await iterate(async ({ Provider }) => {
      const props = reactive({
        label: 'label',
        value: 'value',
        draggable: false,
        dropzone: false,
        droppable: false,
      });
      const { instance } = renderDndProvider(Provider, () =>
        h(DndSource, {
          ...props,
        })
      );
      const el = instance.rootDndElement!.children[0];

      expect(el.draggable).toBe(false);
      expect(el.droppable).toBe(false);
      expect(el.role).toEqual({
        source: true,
        dropzone: false,
      });
      expect(el.label).toBe('label');
      expect(el.value).toBe('value');

      props.label = 'Label';
      props.value = 'Value';
      props.draggable = true;
      props.dropzone = true;
      props.droppable = true;
      await nextTick();

      expect(el.draggable).toBe(true);
      expect(el.droppable).toBe(true);
      expect(el.role).toEqual({
        source: true,
        dropzone: true,
      });
      expect(el.label).toBe('Label');
      expect(el.value).toBe('Value');
    });
  });
});

describe('DndDropzone', () => {
  it('check default props configuration', async () => {
    await iterate(async ({ Provider }) => {
      const { dropzone } = renderDndProvider(Provider, h(DndDropzone));
      const props = dropzone!.props();

      expect(props.tag).toBe('div');
      expect(props.label).toBeUndefined();
      expect(props.value).toBeUndefined();
      expect(props.droppable).toBe(true);
    });
  });

  it('should render default slot', async () => {
    await iterate(async ({ Provider }) => {
      const { dropzone } = renderDndProvider(
        Provider,
        h(DndDropzone, () => 'text')
      );

      expect(dropzone!.html()).toContain('text');
    });
  });

  it("should use 'props.tag' as tag of the root element", async () => {
    await iterate(async ({ Provider }) => {
      const { dropzones } = renderDndProvider(
        Provider,
        h(DndDropzone, { tag: 'ul' })
      );

      expect(dropzones[0].html()).toContain('ul');
    });
  });

  it('should synchronize changes of props to the DndElement in DndElementTree', async () => {
    await iterate(async ({ Provider }) => {
      const props = reactive({
        label: 'label',
        value: 'value',
        droppable: false,
      });
      const { instance } = renderDndProvider(Provider, () =>
        h(DndDropzone, {
          ...props,
        })
      );
      const el = instance.rootDndElement!.children[0];

      expect(el.droppable).toBe(false);
      expect(el.role).toEqual({
        source: false,
        dropzone: true,
      });
      expect(el.label).toBe('label');
      expect(el.value).toBe('value');

      props.label = 'Label';
      props.value = 'Value';
      props.droppable = true;
      await nextTick();

      expect(el.droppable).toBe(true);
      expect(el.role).toEqual({
        source: false,
        dropzone: true,
      });
      expect(el.label).toBe('Label');
      expect(el.value).toBe('Value');
    });
  });
});
