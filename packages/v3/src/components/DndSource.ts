import { h, defineComponent, shallowRef } from 'vue';
import useDndElement from '../compositions/UseDndElement';

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
  setup(props, { slots }) {
    const containerRef = shallowRef<HTMLElement>();
    const el = useDndElement('DndSource', {
      source: () => true,
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
      const v2_render = () => h(props.tag, slots.default?.());
      // @ts-ignore vue2 used
      const v3_render = () => h(props.tag, null, { default: slots.default });
      return IS_VUE2 ? v2_render : v3_render;
    }
    const { attrs, style, classes } = el;
    const v2_render = () => {
      return h(
        props.tag,
        {
          ref: containerRef,
          attrs: attrs.value,
          // @ts-ignore vue2 used
          style: style.value,
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

export default DndSource;
