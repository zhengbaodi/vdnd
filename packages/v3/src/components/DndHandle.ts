import { defineComponent, h, inject } from 'vue';
import {
  DndContextSymbol,
  DndParentElementSymbol,
} from '../compositions/Symbols';

import type DndElement from '../DndElement';
import type { DndContext } from '../compositions/UseDndProvider';

const DndHandle = defineComponent({
  name: 'DndHandle',
  props: {
    tag: {
      type: String,
      default: 'div',
    },
  },
  setup(props, { slots }) {
    const ctx = inject<DndContext>(DndContextSymbol);

    if (!ctx) {
      console.error(
        '[vdnd error]: DndHandle must be descendant of DndProvider(NativeDnd, MouseDnd, TouchDnd)'
      );
      const v2_render = () => h(props.tag, slots.default?.());
      // @ts-ignore vue2 used
      const v3_render = () => h(props.tag, null, { default: slots.default });
      return IS_VUE2 ? v2_render : v3_render;
    }

    const host = inject<DndElement>(DndParentElementSymbol);

    if (!host || host.parent === null /** root element */) {
      console.warn(
        `[vdnd warn]: DndHandle only functions as descendant of DndSource`
      );
    }

    const _classs = () => ctx.classnamesOf('handle');
    const _attrs = () => {
      const result: Record<string, any> = {};
      if (ctx.instance.type === 'native') {
        result.draggable = true;
      }
      return result;
    };

    const v2_render = () => {
      return h(
        props.tag,
        {
          attrs: _attrs(),
          class: _classs(),
        },
        slots.default?.()
      );
    };
    const v3_render = () => {
      return h(
        props.tag,
        {
          ..._attrs(),
          class: _classs(),
        },
        // @ts-ignore vue2 used
        { default: slots.default }
      );
    };
    return IS_VUE2 ? v2_render : v3_render;
  },
});

export default DndHandle;
