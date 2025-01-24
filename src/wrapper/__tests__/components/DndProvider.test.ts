import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { h, nextTick, ref } from 'vue';
import {
  TouchDragSimulator,
  renderDndProvider,
  createDndProviderUtilIterator,
  DndProvider,
  MouseDragSimulator,
  DndType,
} from 'test-utils';
import { DOMWrapper, mount } from '@vue/test-utils';
import ensureArray from '@shared/ensureArray';
import { DefaultEventSuppressor } from '@base/EventSuppressor';
import {
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
import BaseSimulatedDnd from '@base/SimulatedDnd';

const body = new DOMWrapper(document.body);
const nextAnimationFrame = async () => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(void 0));
  });
};

beforeEach(() => {
  vi.useFakeTimers();
  TouchDragSimulator.USE_FAKE_TIMERS = true;
  vi.spyOn(DefaultEventSuppressor, 'isTrustedEvent').mockImplementation(
    () => true
  );
});

afterEach(() => {
  vi.clearAllMocks();
  vi.useRealTimers();
  TouchDragSimulator.USE_FAKE_TIMERS = false;
});

let iterate: ReturnType<typeof createDndProviderUtilIterator>;
beforeEach(() => {
  iterate = createDndProviderUtilIterator();
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
    await iterate(async ({ Provider }) => {
      const { sources } = renderDndProvider(
        Provider,
        {
          source: 'my-source',
        },
        [h(DndSource, { draggable: true }), h(DndSource, { draggable: false })]
      );
      for (const source of sources) {
        expect(source.classes()).toContain('my-source');
      }
    });
  });

  it("'dropzone' option should work properly", async () => {
    await iterate(async ({ Provider }) => {
      const { dropzones } = renderDndProvider(
        Provider,
        {
          dropzone: 'my-dropzone',
        },
        [
          h(DndSource, { draggable: true, dropzone: true }),
          h(DndDropzone, { droppable: true }),
          h(DndDropzone, { droppable: false }),
        ]
      );
      for (const dropzone of dropzones) {
        expect(dropzone.classes()).toContain('my-dropzone');
      }
    });
  });

  it("'handle' option should work properly", async () => {
    await iterate(async ({ Provider }) => {
      const { handles } = renderDndProvider(
        Provider,
        {
          handle: 'my-handle',
        },
        [h(DndSource, { draggable: true, dropzone: false }, () => h(DndHandle))]
      );
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
    await iterate(async ({ Provider, simualtor }) => {
      const { source, sources, dropzone, dropzones } = renderDndProvider(
        Provider,
        {
          classes: myClasses,
        },
        [
          h(DndSource, { draggable: true, dropzone: false }),
          h(DndDropzone, { droppable: true }),
          h(DndDropzone, { droppable: false }),
        ]
      );

      for (const source of sources) {
        expect(source.classes()).toBeSuperSetOf(
          ensureArray(
            source.props().draggable
              ? myClasses['source:draggable']
              : myClasses['source:disabled']
          )
        );
      }

      await simualtor.dragstart(source);
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

      await simualtor.dragenter(dropzone);
      expect(dropzone.classes()).toBeSuperSetOf(
        ensureArray(myClasses['dropzone:over'])
      );
    });
  });

  it("'debug' option should work properly", async () => {
    await iterate(async ({ Provider }) => {
      const { source } = renderDndProvider(
        Provider,
        { debug: true },
        h(DndSource, {
          label: 'label',
          value: 'value',
          draggable: true,
          dropzone: true,
          droppable: false,
        })
      );

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
    await iterate(async ({ Provider, simualtor }) => {
      const droppable = ref(true);
      const { provider, source, dropzones } = renderDndProvider(
        Provider,
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
      const dropzone = dropzones[1];

      await simualtor.dragstart(source);
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

      vi.advanceTimersByTime(BaseSimulatedDnd.eventTriggeringInterval.drag);
      expect((provider.emitted('drag')![0][0] as DragEvent).over).toBeNull();

      vi.advanceTimersByTime(BaseSimulatedDnd.eventTriggeringInterval.dragover);
      expect(provider.emitted()).not.toHaveProperty('drag:over');

      await simualtor.dragenter(dropzone);
      expect(provider.emitted('drag:enter')).toHaveLength(1);
      expect(provider.emitted()).not.toHaveProperty('drag:leave');

      await simualtor.dragenter(source);
      expect(provider.emitted('drag:enter')).toHaveLength(1);
      expect(provider.emitted('drag:leave')).toHaveLength(1);

      await simualtor.dragend(true);
      expect(provider.emitted()).not.toHaveProperty('drop');
      expect(provider.emitted('drag:leave')).toHaveLength(1);
      expect(
        (provider.emitted('drag:end')![0][0] as DragEndEvent).over
      ).toBeNull();
    });
  });

  it('if the interaction is in progress, should not react immediately when updating options, but reacts after ending the dnd', async () => {
    await iterate(async ({ Provider, simualtor }) => {
      const { provider, instance, source } = renderDndProvider(
        Provider,
        h(DndSource, { draggable: true, dropzone: true, droppable: true })
      );

      await simualtor.dragstart(source);
      instance.options.strict = true;
      await nextTick();
      await simualtor.dragend(true);
      expect(provider.emitted('drop')).toHaveLength(1);

      await simualtor.dragstart(source);
      await simualtor.dragend(true);
      expect(provider.emitted('drop')).toHaveLength(1);
    });
  });

  it('else, reacts immediately', async () => {
    await iterate(async ({ Provider, simualtor }) => {
      const { provider, instance, source } = renderDndProvider(
        Provider,
        h(DndSource, { draggable: true, dropzone: true, droppable: true })
      );

      instance.options.strict = true;
      await nextTick();
      await simualtor.dragstart(source);
      await simualtor.dragend(true);
      expect(provider.emitted()).not.toHaveProperty('drop');
    });
  });
});

describe('mouse and touch', () => {
  it("'mirror' option should work properly", async () => {
    vi.useRealTimers();
    TouchDragSimulator.USE_FAKE_TIMERS = false;
    iterate = createDndProviderUtilIterator([
      MouseDragSimulator,
      TouchDragSimulator,
    ]);
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

    await iterate(async ({ Provider, simualtor }) => {
      const { source } = renderDndProvider(
        Provider,
        {
          mirror: mirrorOptions,
        },
        h(DndSource, { draggable: true, dropzone: false })
      );

      await simualtor.dragstart(source);
      await nextAnimationFrame();
      const mirror = body.find<HTMLElement>('.my-mirror');

      expect(mirror.attributes().id).toBe('mirror');
      expect(mirror.element.parentElement).toBe(document.body);
    });
  });
});

describe('mouse', () => {
  it("'suppressEvent' option should work properly", async () => {
    iterate = createDndProviderUtilIterator([MouseDragSimulator]);
    await iterate(async ({ Provider, simualtor }) => {
      const onKeyDown = vi.fn();
      document.body.addEventListener('keydown', onKeyDown);
      const { source } = renderDndProvider(
        Provider,
        {
          suppressUIEvent: true,
        },
        h(DndSource, { draggable: true, dropzone: false })
      );

      await simualtor.dragstart(source);
      await source.trigger('keydown');

      expect(onKeyDown).not.toHaveBeenCalled();
    });

    vi.useFakeTimers();
    TouchDragSimulator.USE_FAKE_TIMERS = true;
  });
});

describe('touch', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("'delay' option should work properly", async () => {
    const OLD_DELAY = TouchDragSimulator.DRAG_DELAY;
    const DELAY = Math.round(OLD_DELAY / 2);
    vi.useRealTimers();
    TouchDragSimulator.DRAG_DELAY = DELAY;
    TouchDragSimulator.USE_FAKE_TIMERS = false;

    iterate = createDndProviderUtilIterator([TouchDragSimulator]);
    await iterate(async ({ Provider, simualtor }) => {
      const { source } = renderDndProvider(
        Provider,
        {
          delay: DELAY,
        },
        h(DndSource, { draggable: true, dropzone: false })
      );

      const timeStart = Date.now();
      await simualtor.dragstart(source);
      const timeEnd = Date.now();

      expect((timeEnd - timeStart) / 1000).toBeLessThan(OLD_DELAY);
    });

    TouchDragSimulator.DRAG_DELAY = OLD_DELAY;
  });
});
