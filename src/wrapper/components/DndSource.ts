import { h, defineComponent, shallowRef } from 'vue';
import useDndElement from '../compositions/UseDndElement';

import type { SlotsType } from 'vue';

const DndSource = defineComponent({
  name: 'DndSource',
  props: {
    tag: {
      type: String,
      default: 'div',
    },
    label: String,
    value: null,
    draggable: {
      type: Boolean,
      default: true,
    },
    dropzone: Boolean,
    droppable: {
      type: Boolean,
      default: void 0,
    },
  },
  slots: Object as SlotsType<{
    default: {};
  }>,
  setup(props, { slots }) {
    const containerRef = shallowRef<HTMLElement>();
    const el = useDndElement('DndSource', {
      source: true,
      label: () => props.label,
      value: () => props.value,
      draggable: () => props.draggable,
      dropzone: () => props.dropzone,
      droppable: () =>
        typeof props.droppable === 'undefined'
          ? props.dropzone
            ? true
            : false
          : props.droppable,
      element: () => containerRef.value!,
    });
    if (!el) {
      return () => h(props.tag, null, { default: slots.default });
    }
    const { attrs, classes } = el;
    const _props = () => ({
      ref: containerRef,
      ...attrs.value,
      class: classes.value,
    });
    return () => h(props.tag, _props(), { default: slots.default });
  },
});

export default DndSource;
