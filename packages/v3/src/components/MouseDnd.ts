import {
  h,
  defineComponent,
  shallowRef,
  onBeforeUnmount,
  onMounted,
} from 'vue';
import {
  SimulatedDnd,
  MouseSimulator,
  DefaultEventSuppressor,
  initEventSuppressor,
} from '@vdnd/base';
import {
  useBaseDnd,
  useBaseDndBridge,
  useContextInjector,
  useInternalDndOptions,
} from '../compositions/UseDndProvider';

import type { PropType } from 'vue';
import type { SimulatedDndOptions } from '@vdnd/base';
import type {
  MirrorAppendTo,
  MouseDndOptions,
  DndInstance,
  DndEventTableForMouse,
} from '../types';

// initEventSuppressor should be called as early as possible
const eventSuppressor = initEventSuppressor(
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

    const baseDndOptions = (): SimulatedDndOptions => {
      const { source, dropzone, handle, mirror, suppressUIEvent } =
        options.value;
      const { isDraggable, isDroppable, getDndElementByNativeEl } = context;

      return {
        source,
        dropzone,
        handle,
        simulator: MouseSimulator,
        eventSuppressor: suppressUIEvent ? eventSuppressor : void 0,
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

export default MouseDnd;
