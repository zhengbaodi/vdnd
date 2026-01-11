import {
  h,
  shallowRef,
  onMounted,
  watchPostEffect,
  defineComponent,
} from 'vue';
import { injectDndModel } from '../dnd-model';

/**
 * Check if a handle is a descendant element of the specified sources
 */
export function validateHandle(handle: HTMLElement, sources: HTMLElement[]) {
  let parent: HTMLElement | null = handle.parentElement;
  while (parent) {
    if (sources.includes(parent)) {
      return true;
    }
    parent = parent.parentElement;
  }
  return false;
}

export const DndHandle = defineComponent({
  name: 'DndHandle',
  props: {
    tag: {
      type: String,
      default: 'div',
    },
  },
  setup(props, { slots }) {
    const model = injectDndModel();
    const roolElRef = shallowRef<HTMLElement>();

    if (!model) {
      onMounted(() => {
        console.warn(
          '[vdnd warn]: If the <DndHandle />(%o) is not nested within the <DndContainer />, it will not function as expected.',
          roolElRef.value
        );
      });
      return () => {
        return h(props.tag!, { ref: roolElRef }, slots.default?.());
      };
    }

    watchPostEffect((onCleanup) => {
      if (!roolElRef.value) return;
      model.$addNativeElement('handle', roolElRef.value!, void 0);
      onCleanup(() => {
        model.$removeNativeElement('handle', roolElRef.value!);
      });
    });

    onMounted(() => {
      if (model.initialized) {
        const sources = model.findHTMLElements('source');
        if (!validateHandle(roolElRef.value!, sources)) {
          console.warn(
            '[vdnd warn]: If the <DndHandle />(%o) is not nested within the <DndSource />, it will not function as expected.',
            roolElRef.value
          );
        }
      }
    });

    return () => {
      return h(
        props.tag,
        {
          ref: roolElRef,
          attrs: {
            draggable: true,
          },
          class: model.classes.handle,
        },
        slots.default?.()
      );
    };
  },
});
