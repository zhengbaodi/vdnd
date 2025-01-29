import { describe, expect, it } from 'vitest';
import {
  createSimulators,
  createTestEnvIterator,
} from '../__helpers__/test-env';
import { h, nextTick, ref, reactive } from 'vue';
import { DndSource, DndElement, DndDropzone } from '../..';

it('Construction of DndElementTree', async () => {
  const shouldRenderElements = ref(true);
  const renderElements = () =>
    h(DndSource, { label: '1' }, () => [
      h(DndDropzone, { label: '1.1' }, () => h(DndSource, { label: '1.1.1' })),
      h(DndSource, { label: '1.2' }, () => h(DndDropzone, { label: '1.2.1' })),
    ]);
  const iterate = createTestEnvIterator(
    createSimulators(),
    h(() => (shouldRenderElements.value ? renderElements() : null))
  );

  await iterate(async ({ instance }) => {
    shouldRenderElements.value = true;
    await nextTick();

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
    const iterate = createTestEnvIterator(createSimulators(), h(DndSource));
    await iterate(async ({ source }) => {
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
    const iterate = createTestEnvIterator(
      createSimulators(),
      h(DndSource, { draggable: true }, () => 'text')
    );
    await iterate(async ({ source }) => {
      expect(source.html()).toContain('text');
    });
  });

  it("should use 'props.tag' as tag of the root element", async () => {
    const iterate = createTestEnvIterator(
      createSimulators(),
      h(DndSource, { tag: 'ul' })
    );
    await iterate(async ({ sources }) => {
      expect(sources[0].html()).toContain('ul');
    });
  });

  it('should synchronize changes of props to the DndElement in DndElementTree', async () => {
    const initialProps = {
      label: 'label',
      value: 'value',
      draggable: false,
      dropzone: false,
      droppable: false,
    };
    const props = reactive({ ...initialProps });
    const iterate = createTestEnvIterator(createSimulators(), () =>
      h(DndSource, {
        ...props,
      })
    );
    await iterate(async ({ instance }) => {
      Object.assign(props, initialProps);
      await nextTick();

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
    const iterate = createTestEnvIterator(createSimulators(), h(DndDropzone));
    await iterate(async ({ dropzone }) => {
      const props = dropzone!.props();

      expect(props.tag).toBe('div');
      expect(props.label).toBeUndefined();
      expect(props.value).toBeUndefined();
      expect(props.droppable).toBe(true);
    });
  });

  it('should render default slot', async () => {
    const iterate = createTestEnvIterator(
      createSimulators(),
      h(DndDropzone, () => 'text')
    );
    await iterate(async ({ dropzone }) => {
      expect(dropzone!.html()).toContain('text');
    });
  });

  it("should use 'props.tag' as tag of the root element", async () => {
    const iterate = createTestEnvIterator(
      createSimulators(),
      h(DndDropzone, { tag: 'ul' })
    );
    await iterate(async ({ dropzones }) => {
      expect(dropzones[0].html()).toContain('ul');
    });
  });

  it('should synchronize changes of props to the DndElement in DndElementTree', async () => {
    const initialProps = {
      label: 'label',
      value: 'value',
      droppable: false,
    };
    const props = reactive({ ...initialProps });
    const iterate = createTestEnvIterator(createSimulators(), () =>
      h(DndDropzone, {
        ...props,
      })
    );
    await iterate(async ({ instance }) => {
      Object.assign(props, initialProps);
      await nextTick();

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
