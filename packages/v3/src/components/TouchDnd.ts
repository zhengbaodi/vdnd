import {
  h,
  defineComponent,
  shallowRef,
  onBeforeUnmount,
  onMounted,
} from 'vue';
import { TouchSimulator, SimulatedDnd } from '@vdnd/base';
import {
  useBaseDnd,
  useBaseDndBridge,
  useContextInjector,
  useInternalDndOptions,
} from '../compositions/UseDndProvider';

import type { PropType } from 'vue';
import type { SimulatedDndOptions } from '@vdnd/base';
import type {
  DndInstance,
  DndEventTableForTouch,
  MirrorAppendTo,
  TouchDndOptions,
} from '../types';

const TouchDnd = defineComponent({
  name: 'TouchDnd',
  props: {
    tag: {
      type: String,
      default: 'div',
    },
    instance: {
      type: Object as PropType<DndInstance<TouchDndOptions>>,
      required: true,
    },
  },
  emits: {
    drag: (_e: DndEventTableForTouch['drag']) => true,
    'drag:start': (_e: DndEventTableForTouch['drag:start']) => true,
    'drag:prevent': (_e: DndEventTableForTouch['drag:prevent']) => true,
    'drag:enter': (_e: DndEventTableForTouch['drag:enter']) => true,
    'drag:over': (_e: DndEventTableForTouch['drag:over']) => true,
    'drag:leave': (_e: DndEventTableForTouch['drag:leave']) => true,
    drop: (_e: DndEventTableForTouch['drop']) => true,
    'drag:end': (_e: DndEventTableForTouch['drag:end']) => true,
    initialized: () => true,
  },
  setup(props, { emit, slots }) {
    const instance = props.instance;
    const options = useInternalDndOptions<TouchDndOptions>(instance);
    const containerRef = shallowRef<HTMLElement>();
    const context = useContextInjector(instance, options, containerRef);

    const baseDndOptions = (): SimulatedDndOptions => {
      const { source, dropzone, handle, mirror, delay } = options.value;
      const { isDraggable, isDroppable, getDndElementByNativeEl } = context;

      return {
        source,
        dropzone,
        handle,
        delay,
        eventSuppressor: void 0,
        simulator: TouchSimulator,
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
                      originalEvent: event.originalEvent as TouchEvent,
                    }
                  );
                },
          create({ source, event }) {
            return mirror.create({
              source: getDndElementByNativeEl(source)!,
              container: containerRef.value!,
              originalEvent: event.originalEvent as TouchEvent,
            });
          },
        },
        isDraggable,
        isDroppable,
      };
    };

    const constructBaseDnd = (options: SimulatedDndOptions) =>
      new SimulatedDnd(containerRef.value!, options);
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

    const v2_render = () => {
      return h(
        props.tag,
        {
          ref: containerRef,
        },
        slots.default?.()
      );
    };
    const v3_render = () => {
      return h(
        props.tag,
        {
          ref: containerRef,
        },
        {
          // @ts-ignore vue2 used
          default: slots.default,
        }
      );
    };
    return IS_VUE2 ? v2_render : v3_render;
  },
});

export default TouchDnd;
