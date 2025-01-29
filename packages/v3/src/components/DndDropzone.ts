import { h, defineComponent, shallowRef } from 'vue';
import useDndElement from '../compositions/UseDndElement';

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
  setup(props, { slots }) {
    const containerRef = shallowRef<HTMLElement>();
    const element = useDndElement('DndDropzone', {
      source: () => false,
      draggable: () => false,
      dropzone: () => true,
      label: () => props.label,
      value: () => props.value,
      droppable: () => props.droppable,
      element: () => containerRef.value!,
    });
    if (!element) {
      const v2_render = () => h(props.tag, slots.default?.());
      // @ts-ignore vue2 used
      const v3_render = () => h(props.tag, null, { default: slots.default });
      return IS_VUE2 ? v2_render : v3_render;
    }
    const { attrs, style, classes } = element;

    const v2_render = () => {
      return h(
        props.tag,
        {
          ref: containerRef,
          // @ts-ignore vue2 used
          style: style.value,
          attrs: attrs.value,
          class: classes.value,
        },
        slots.default?.()
      );
    };

    const v3_render = () => {
      return h(
        props.tag,
        {
          ref: containerRef,
          ...attrs.value,
          // @ts-ignore vue2 used
          style: style.value,
          class: classes.value,
        },
        // @ts-ignore vue2 used
        { default: slots.default }
      );
    };

    return IS_VUE2 ? v2_render : v3_render;
  },
});

export default DndDropzone;
