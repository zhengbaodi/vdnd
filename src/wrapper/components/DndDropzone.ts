import { h, defineComponent, shallowRef } from 'vue';
import useDndElement from '../compositions/UseDndElement';

import type { SlotsType } from 'vue';

const DndDropzone = defineComponent({
  name: 'DndDropzone',
  props: {
    tag: {
      type: String,
      default: 'div',
    },
    label: String,
    value: null,
    droppable: {
      type: Boolean,
      default: true,
    },
  },
  slots: Object as SlotsType<{
    default: {};
  }>,
  setup(props, { slots }) {
    const containerRef = shallowRef<HTMLElement>();
    const element = useDndElement('DndDropzone', {
      source: false,
      draggable: false,
      dropzone: true,
      label: () => props.label,
      value: () => props.value,
      droppable: () => props.droppable,
      element: () => containerRef.value!,
    });
    if (!element) {
      return () => h(props.tag, null, { default: slots.default });
    }
    const { attrs, classes } = element;
    const _props = () => ({
      ref: containerRef,
      ...attrs.value,
      class: classes.value,
    });
    return () => h(props.tag, _props(), { default: slots.default });
  },
});

export default DndDropzone;
