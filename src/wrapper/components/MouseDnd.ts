import {
  h,
  defineComponent,
  shallowRef,
  onBeforeUnmount,
  onMounted,
} from 'vue';

import { MouseSimulator } from '@base/simulators';
import { DefaultEventSuppressor } from '@base/EventSuppressor';
import BaseSimulatedDnd from '@base/SimulatedDnd';

import {
  useBaseDnd,
  useBaseDndBridge,
  useContextInjector,
  useInternalDndOptions,
} from '../compositions/UseDndProvider';

import type { PropType, SlotsType } from 'vue';
import type { EventSuppressor } from '@base/EventSuppressor';
import type {
  MirrorAppendTo,
  MouseDndOptions,
  BaseSimulatedDndOptions,
} from '../types';
import type {
  DndInstance,
  DndEventTableForMouse,
} from '../compositions/UseDndInstance';

/** @__NO_SIDE_EFFECTS__ */
function initEventSuppressor<T extends EventSuppressor = EventSuppressor>(
  suppressor: T
) {
  // The Declaration：
  // ActualUIEvent: the event was generated by the user agent
  // (https://developer.mozilla.org/en-US/docs/Web/API/Event/isTrusted)
  // SimulatedUIEvent: the event was generated by 'Event' and triggered by 'dispatchEvent'
  // (https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent)

  // Browser will suppress UI events while dragging,
  // after testing, it was found that browser only suppresses ActualUIEvent except 'focus', 'focusin', 'focusout', 'blur'

  // The known UI events: dblclick,mousedown,mouseenter,mouseout,mouseleave,mouseover,mousemove,mouseup,touchstart,touchmove,touchend,touchcancel,blur,focusout,focus,focusin,keypress,keydown,keyup,mousewheel,beforeinput,input,compositionstart,compositionupdate,compositionend
  // https://developer.mozilla.org/en-US/docs/Web/API/UIEvent

  // However, in actual scene,
  // the following UI events can only be triggered by 'dispatchEvent', cannot actually occur：
  // click,dblclick,mousedown,mouseup,touchstart,touchend,touchcancel,blur,focusout,focus,focusin,beforeinput,input,compositionstart,compositionupdate,compositionend
  // such as, we can't type the word while dragging, except release the mouse

  // So we just suppress the following events:

  // MouseEvent
  suppressor.suppress('mouseenter', {
    preventDefault: true,
    stopPropagation: true,
    stopImmediatePropagation: true,
  });
  suppressor.suppress('mouseout', {
    preventDefault: true,
    stopPropagation: true,
    stopImmediatePropagation: true,
  });
  suppressor.suppress('mouseleave', {
    preventDefault: true,
    stopPropagation: true,
    stopImmediatePropagation: true,
  });
  suppressor.suppress('mouseover', {
    preventDefault: true,
    stopPropagation: true,
    stopImmediatePropagation: true,
  });
  suppressor.suppress('mousemove', {
    // MouseSimulaor depends on default action of 'mousemove'
    preventDefault: false,
    stopPropagation: true,
    stopImmediatePropagation: true,
  });

  // TouchEvent
  // suppressor.suppress("touchmove", {
  //   // TouchSimulaor depends on default action of 'touchmove'
  //   preventDefault: false,
  //   stopPropagation: true,
  //   stopImmediatePropagation: true,
  // });

  // FocusEvent

  // KeyboardEvent
  suppressor.suppress('keypress', {
    preventDefault: true,
    stopPropagation: true,
    stopImmediatePropagation: true,
  });
  suppressor.suppress('keydown', {
    preventDefault: true,
    stopPropagation: true,
    stopImmediatePropagation: true,
  });
  suppressor.suppress('keyup', {
    preventDefault: true,
    stopPropagation: true,
    stopImmediatePropagation: true,
  });

  // WheelEvent
  suppressor.suppress('mousewheel', {
    preventDefault: true,
    stopPropagation: true,
    stopImmediatePropagation: true,
  });

  // InputEvent

  // CompositionEvent

  return suppressor;
}

// initEventSuppressor should be called as early as possible
const defaultEventSuppressor = initEventSuppressor(
  new DefaultEventSuppressor(document)
);

const MouseDnd = defineComponent({
  name: 'MouseDnd',
  props: {
    tag: {
      type: String,
      default: 'div',
    },
    instance: {
      type: Object as PropType<DndInstance<MouseDndOptions>>,
      required: true,
    },
  },
  slots: Object as SlotsType<{
    default: {};
  }>,
  emits: {
    drag: (_e: DndEventTableForMouse['drag']) => true,
    'drag:start': (_e: DndEventTableForMouse['drag:start']) => true,
    'drag:prevent': (_e: DndEventTableForMouse['drag:prevent']) => true,
    'drag:enter': (_e: DndEventTableForMouse['drag:enter']) => true,
    'drag:over': (_e: DndEventTableForMouse['drag:over']) => true,
    'drag:leave': (_e: DndEventTableForMouse['drag:leave']) => true,
    drop: (_e: DndEventTableForMouse['drop']) => true,
    'drag:end': (_e: DndEventTableForMouse['drag:end']) => true,
    initialized: () => true,
  },
  setup(props, { emit, slots }) {
    const instance = props.instance;
    const containerRef = shallowRef<HTMLElement>();
    const options = useInternalDndOptions<MouseDndOptions>(instance);
    const context = useContextInjector(instance, options, containerRef);

    const baseDndOptions = (): BaseSimulatedDndOptions => {
      const { source, dropzone, handle, mirror, suppressUIEvent } =
        options.value;
      const { isDraggable, isDroppable, getDndElementByNativeEl } = context;

      return {
        source,
        dropzone,
        handle,
        simulator: MouseSimulator,
        eventSuppressor: suppressUIEvent ? defaultEventSuppressor : void 0,
        mirror: {
          ...mirror,
          appendTo:
            typeof mirror.appendTo !== 'function'
              ? mirror.appendTo
              : ({ source, event }) => {
                  return (mirror.appendTo as Extract<MirrorAppendTo, Function>)(
                    {
                      source: getDndElementByNativeEl(source)!,
                      container: containerRef.value!,
                      originalEvent: event.originalEvent as MouseEvent,
                    }
                  );
                },
          create({ source, event }) {
            return mirror.create({
              source: getDndElementByNativeEl(source)!,
              container: containerRef.value!,
              originalEvent: event.originalEvent as MouseEvent,
            });
          },
        },
        isDraggable,
        isDroppable,
      };
    };
    const constructBaseDnd = (options: BaseSimulatedDndOptions) =>
      new BaseSimulatedDnd(containerRef.value!, options);
    const baseDnd = useBaseDnd(constructBaseDnd, baseDndOptions);

    useBaseDndBridge(context, baseDnd);

    instance.on('drag', (e) => emit('drag', e));
    instance.on('drag:start', (e) => emit('drag:start', e));
    instance.on('drag:prevent', (e) => emit('drag:prevent', e));
    instance.on('drag:enter', (e) => emit('drag:enter', e));
    instance.on('drag:leave', (e) => emit('drag:leave', e));
    instance.on('drag:over', (e) => emit('drag:over', e));
    instance.on('drag:end', (e) => emit('drag:end', e));
    instance.on('drop', (e) => emit('drop', e));

    onMounted(() => {
      emit('initialized');
    });

    onBeforeUnmount(() => {
      instance.$destroy();
    });

    return () =>
      h(
        props.tag,
        {
          ref: containerRef,
        },
        {
          default: slots.default,
        }
      );
  },
});

export default MouseDnd;