import { it, vi, afterAll, beforeAll, describe, expect } from 'vitest';
import { DOMWrapper, mount } from '@vue/test-utils';
import { TouchDragSimulator, waitForPromisesToResolve } from '@vdnd/test-utils';
import {
  createSimulators,
  createTestEnvIterator,
} from '../__helpers__/test-env';
import { h, nextTick, ref } from 'vue';
import { ensureArray } from '@vdnd/shared';
import { SimulatedDnd, DefaultEventSuppressor } from '@vdnd/base';
import {
  DndType,
  DndProvider,
  defaultDndClasses,
  MouseDnd,
  TouchDnd,
  NativeDnd,
  DndHandle,
  DndSource,
  useDnd,
  DndClasses,
  DndDropzone,
  MirrorOptions,
  DragEvent,
  DragEndEvent,
} from '../..';

const body = new DOMWrapper(document.body);

beforeAll(() => {
  vi.spyOn(DefaultEventSuppressor, 'isTrustedEvent').mockImplementation(
    () => true
  );
});

afterAll(() => {
  vi.clearAllMocks();
});

const Providers = [MouseDnd, TouchDnd, NativeDnd];

function getDndType(provider: DndProvider): DndType {
  switch (provider) {
    case MouseDnd:
      return 'mouse';
    case TouchDnd:
      return 'touch';
    case NativeDnd:
    default:
      return 'native';
  }
}

describe('common', () => {
  it('check default props configuration', () => {
    function test(Provider: DndProvider) {
      const instance = useDnd({ type: getDndType(Provider) });
      const provider = mount(Provider, {
        props: {
          // @ts-ignore
          instance,
        },
      });
      const props = provider.props();

      expect(props.tag).toBe('div');
    }
    for (const Provider of Providers) {
      test(Provider);
    }
  });

  it("should use 'props.tag' as tag of the root element", () => {
    function test(Provider: DndProvider) {
      const instance = useDnd({ type: getDndType(Provider) });
      const provider = mount(Provider, {
        props: {
          tag: 'ul',
          // @ts-ignore
          instance,
        },
      });

      expect(provider.html()).toContain('ul');
    }
    for (const Provider of Providers) {
      test(Provider);
    }
  });

  it('should render default slot', async () => {
    function test(Provider: DndProvider) {
      const instance = useDnd({ type: getDndType(Provider) });
      const provider = mount(Provider, {
        props: {
          // @ts-ignore
          instance,
        },
        slots: {
          default: 'text',
        },
      });

      expect(provider.html()).toContain('text');
    }
    for (const Provider of Providers) {
      test(Provider);
    }
  });

  it("'source' option should work properly", async () => {
    const iterate = createTestEnvIterator(
      createSimulators(),
      { source: 'my-source' },
      [(h(DndSource, { draggable: true }), h(DndSource, { draggable: false }))]
    );
    await iterate(async ({ sources }) => {
      for (const source of sources) {
        expect(source.classes()).toContain('my-source');
      }
    });
  });

  it("'dropzone' option should work properly", async () => {
    const iterate = createTestEnvIterator(
      createSimulators(),
      { dropzone: 'my-dropzone' },
      [
        h(DndSource, { draggable: true, dropzone: true }),
        h(DndDropzone, { droppable: true }),
        h(DndDropzone, { droppable: false }),
      ]
    );
    await iterate(async ({ dropzones }) => {
      for (const dropzone of dropzones) {
        expect(dropzone.classes()).toContain('my-dropzone');
      }
    });
  });

  it("'handle' option should work properly", async () => {
    const iterate = createTestEnvIterator(
      createSimulators(),
      { handle: 'my-handle' },
      [h(DndSource, { draggable: true, dropzone: false }, () => h(DndHandle))]
    );
    await iterate(async ({ handles }) => {
      for (const handle of handles) {
        expect(handle.classes()).toContain('my-handle');
      }
    });
  });

  it("'classes' option should work properly", async () => {
    const myClasses: DndClasses = {
      'source:dragging': ['my-source:dragging', 'dragging'],
      'source:draggable': ['my-source:draggable', 'draggable'],
      'source:disabled': ['my-source:disabled', 'disabled'],
      'dropzone:over': ['my-dropzone:over', 'over'],
      'dropzone:droppable': ['my-dropzone:droppable', 'droppable'],
      'dropzone:disabled': ['my-dropzone:disabled', 'disabled'],
    };
    const iterate = createTestEnvIterator(
      createSimulators(['mouse']),
      { classes: myClasses },
      [
        h(DndSource, { draggable: true, dropzone: false }),
        h(DndDropzone, { droppable: true }),
        h(DndDropzone, { droppable: false }),
      ]
    );
    await iterate(
      async ({ simulator, source, sources, dropzone, dropzones }) => {
        for (const source of sources) {
          expect(source.classes()).toBeSuperSetOf(
            ensureArray(
              source.props().draggable
                ? myClasses['source:draggable']
                : myClasses['source:disabled']
            )
          );
        }

        await simulator.dragstart(source);
        expect(source.classes()).toBeSuperSetOf(
          ensureArray(myClasses['source:dragging'])
        );
        for (const dropzone of dropzones) {
          expect(dropzone.classes()).toBeSuperSetOf(
            ensureArray(
              dropzone.props().droppable
                ? myClasses['dropzone:droppable']
                : myClasses['dropzone:disabled']
            )
          );
        }

        await simulator.dragenter(dropzone);
        expect(dropzone.classes()).toBeSuperSetOf(
          ensureArray(myClasses['dropzone:over'])
        );
      }
    );
  });

  it("'debug' option should work properly", async () => {
    const iterate = createTestEnvIterator(
      createSimulators(),
      { debug: true },
      h(DndSource, {
        label: 'label',
        value: 'value',
        draggable: true,
        dropzone: true,
        droppable: false,
      })
    );
    await iterate(async ({ source }) => {
      const attributes = source.attributes();
      expect(attributes['data-dnd-id']).not.toBeUndefined();
      expect(attributes['data-dnd-label']).toBe('label');
      expect(attributes['data-dnd-value']).toBe('value');
      expect(attributes['data-dnd-value-type']).toBe('string');
      expect(attributes['data-dnd-role']).toBe('source,dropzone');
      expect(attributes['data-dnd-draggable']).toBe('true');
      expect(attributes['data-dnd-droppable']).toBe('false');
    });
  });

  it("'strict' option should work properly", async () => {
    const droppable = ref(true);
    const iterate = createTestEnvIterator(
      createSimulators(),
      { strict: true },
      () => [
        h(DndSource, {
          draggable: true,
          dropzone: true,
          droppable: droppable.value,
        }),
        h(DndDropzone),
      ]
    );
    await iterate(async ({ simulator, provider, source, dropzones }) => {
      droppable.value = true;
      await nextTick();
      const dropzone = dropzones[1];

      await simulator.dragstart(source);
      expect(provider.emitted()).not.toHaveProperty('drag:enter');
      expect(source.classes()).not.toBeSuperSetOf(
        ensureArray(defaultDndClasses['dropzone:over'])
      );
      expect(source.classes()).not.toBeSuperSetOf(
        ensureArray(defaultDndClasses['dropzone:droppable'])
      );
      droppable.value = false;
      await nextTick();
      expect(source.classes()).not.toBeSuperSetOf(
        ensureArray(defaultDndClasses['dropzone:disabled'])
      );

      vi.advanceTimersByTime(SimulatedDnd.eventTriggeringInterval.drag);
      expect((provider.emitted('drag')![0][0] as DragEvent).over).toBeNull();

      vi.advanceTimersByTime(SimulatedDnd.eventTriggeringInterval.dragover);
      expect(provider.emitted()).not.toHaveProperty('drag:over');

      await simulator.dragenter(dropzone);
      expect(provider.emitted('drag:enter')).toHaveLength(1);
      expect(provider.emitted()).not.toHaveProperty('drag:leave');

      await simulator.dragenter(source);
      expect(provider.emitted('drag:enter')).toHaveLength(1);
      expect(provider.emitted('drag:leave')).toHaveLength(1);

      await simulator.dragend(true);
      expect(provider.emitted()).not.toHaveProperty('drop');
      expect(provider.emitted('drag:leave')).toHaveLength(1);
      expect(
        (provider.emitted('drag:end')![0][0] as DragEndEvent).over
      ).toBeNull();
    });
  });

  it('if the interaction is in progress, should not react immediately when updating options, but reacts after ending the dnd', async () => {
    const iterate = createTestEnvIterator(
      createSimulators(),
      h(DndSource, { draggable: true, dropzone: true, droppable: true })
    );
    await iterate(async ({ simulator, provider, instance, source }) => {
      await simulator.dragstart(source);
      instance.options.strict = true;
      await nextTick();
      await simulator.dragend(true);
      expect(provider.emitted('drop')).toHaveLength(1);

      await simulator.dragstart(source);
      await simulator.dragend(true);
      expect(provider.emitted('drop')).toHaveLength(1);
    });
  });

  it('else, reacts immediately', async () => {
    const iterate = createTestEnvIterator(
      createSimulators(),
      h(DndSource, { draggable: true, dropzone: true, droppable: true })
    );
    await iterate(async ({ simulator, provider, instance, source }) => {
      instance.options.strict = true;
      await nextTick();
      await simulator.dragstart(source);
      await simulator.dragend(true);
      expect(provider.emitted()).not.toHaveProperty('drop');
    });
  });
});

describe('mouse and touch', () => {
  it("'mirror' option should work properly", async () => {
    const mirrorOptions: MirrorOptions = {
      className: 'my-mirror',
      create({ source }) {
        const el = source.nativeEl!.cloneNode(true) as HTMLElement;
        el.id = 'mirror';
        return el;
      },
      appendTo() {
        return document.body;
      },
    };
    const iterate = createTestEnvIterator(
      createSimulators(['mouse', 'touch']),
      { mirror: mirrorOptions },
      h(DndSource, { draggable: true, dropzone: false })
    );
    await iterate(async ({ simulator, source }) => {
      vi.useRealTimers();
      TouchDragSimulator.USE_FAKE_TIMERS = false;
      await simulator.dragstart(source);
      await waitForPromisesToResolve();
      const mirror = body.find<HTMLElement>('.my-mirror');

      expect(mirror.attributes().id).toBe('mirror');
      expect(mirror.element.parentElement).toBe(document.body);
    });
  });
});

describe('mouse', () => {
  it("'suppressEvent' option should work properly", async () => {
    const iterate = createTestEnvIterator(
      createSimulators(['mouse']),
      { suppressUIEvent: true },
      h(DndSource, { draggable: true, dropzone: false })
    );
    await iterate(async ({ simulator, source }) => {
      const onKeyDown = vi.fn();
      document.body.addEventListener('keydown', onKeyDown);

      await simulator.dragstart(source);
      await source.trigger('keydown');

      expect(onKeyDown).not.toHaveBeenCalled();
    });

    vi.useFakeTimers();
    TouchDragSimulator.USE_FAKE_TIMERS = true;
  });
});

describe('touch', () => {
  it("'delay' option should work properly", async () => {
    const OLD_DELAY = TouchDragSimulator.DRAG_DELAY;
    const DELAY = Math.round(OLD_DELAY / 2);
    vi.useRealTimers();
    TouchDragSimulator.DRAG_DELAY = DELAY;
    TouchDragSimulator.USE_FAKE_TIMERS = false;
    const iterate = createTestEnvIterator(
      createSimulators(['touch']),
      { delay: DELAY },
      h(DndSource, { draggable: true, dropzone: false })
    );

    await iterate(async ({ simulator, source }) => {
      const timeStart = Date.now();
      await simulator.dragstart(source);
      const timeEnd = Date.now();

      expect((timeEnd - timeStart) / 1000).toBeLessThan(OLD_DELAY);
    });

    TouchDragSimulator.DRAG_DELAY = OLD_DELAY;
  });
});
