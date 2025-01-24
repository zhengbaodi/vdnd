import {
  h,
  defineComponent,
  shallowRef,
  onBeforeUnmount,
  onMounted,
} from 'vue';
import BaseNativeDnd from '@base/NativeDnd';
import {
  useBaseDnd,
  useBaseDndBridge,
  useContextInjector,
  useInternalDndOptions,
} from '../compositions/UseDndProvider';

import type { PropType, SlotsType } from 'vue';
import type { NativeDndOptions, BaseNativeDndOptions } from '../types';
import type {
  DndInstance,
  DndEventTableForNative,
} from '../compositions/UseDndInstance';

const NativeDnd = defineComponent({
  name: 'NativeDnd',
  props: {
    tag: {
      type: String,
      default: 'div',
    },
    instance: {
      type: Object as PropType<DndInstance<NativeDndOptions>>,
      required: true,
    },
  },
  slots: Object as SlotsType<{
    default: {};
  }>,
  emits: {
    drag: (_e: DndEventTableForNative['drag']) => true,
    'drag:start': (_e: DndEventTableForNative['drag:start']) => true,
    'drag:prevent': (_e: DndEventTableForNative['drag:prevent']) => true,
    'drag:enter': (_e: DndEventTableForNative['drag:enter']) => true,
    'drag:over': (_e: DndEventTableForNative['drag:over']) => true,
    'drag:leave': (_e: DndEventTableForNative['drag:leave']) => true,
    drop: (_e: DndEventTableForNative['drop']) => true,
    'drag:end': (_e: DndEventTableForNative['drag:end']) => true,
    initialized: () => true,
  },
  setup(props, { emit, slots }) {
    const instance = props.instance;
    const options = useInternalDndOptions<NativeDndOptions>(instance);
    const containerRef = shallowRef<HTMLElement>();
    const context = useContextInjector(instance, options, containerRef);

    const baseDndOptions = (): BaseNativeDndOptions => {
      const { source, dropzone, handle } = options.value;
      const { isDraggable, isDroppable } = context;
      return {
        source,
        dropzone,
        handle,
        isDraggable,
        isDroppable,
      };
    };
    const constructBaseDnd = (options: BaseNativeDndOptions) =>
      new BaseNativeDnd(containerRef.value!, options);
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

export default NativeDnd;
