import { defineComponent, h, inject } from 'vue';
import {
  DndContextSymbol,
  DndParentElementSymbol,
} from '../compositions/Symbols';

import type { SlotsType } from 'vue';
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
  slots: Object as SlotsType<{
    default: {};
  }>,
  setup(props, { slots }) {
    const ctx = inject<DndContext>(DndContextSymbol);

    if (!ctx) {
      console.error(
        '[vdnd error]: DndHandle must be descendant of DndProvider(NativeDnd, MouseDnd, TouchDnd)'
      );
      return () => h(props.tag, null, { default: slots.default });
    }

    const host = inject<DndElement>(DndParentElementSymbol);

    if (!host || host.parent === null /** root element */) {
      console.warn(
        `[vdnd warn]: DndHandle only functions as descendant of DndSource`
      );
    }

    const _props = () => {
      const result: Record<string, unknown> = {
        class: ctx.classnamesOf('handle'),
      };
      if (ctx.instance.type === 'native') {
        result.draggable = true;
      }
      return result;
    };

    return () => h(props.tag, _props(), { default: slots.default });
  },
});

export default DndHandle;
