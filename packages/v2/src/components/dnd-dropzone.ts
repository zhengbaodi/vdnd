import {
  h,
  computed,
  shallowRef,
  watchPostEffect,
  onMounted,
  defineComponent,
  type PropType,
} from 'vue';
import type { DndElement } from '../dnd-element';
import { injectDndModel } from '../dnd-model';

function ensureArray<T = unknown>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value];
}

function createDndDropzone<T extends DndElement = DndElement>() {
  return defineComponent({
    name: 'DndDropzone',
    props: {
      tag: {
        type: String,
        default: 'div',
      },
      label: {
        type: String as PropType<T['label']>,
        required: true,
      },
      /**
       * Don't pass `undefined` as `data`.
       *
       * The union with `undefined` here is to ensure that the type inferring of the `label` is friendly enough.
       */
      data: {
        type: null,
        default: void 0,
      } as unknown as T['data'] extends undefined
        ? {
            type: PropType<T['data']>;
            required: false;
          }
        : {
            type: PropType<T['data'] | undefined>;
            required: true;
          },
    },
    setup(props, { slots }) {
      const model = injectDndModel();
      const roolElRef = shallowRef<HTMLElement>();

      if (!model) {
        onMounted(() => {
          console.warn(
            '[vdnd warn]: If the <DndDropzone />(%o) is not nested within the <DndContainer />, it will not function as expected.',
            roolElRef.value
          );
        });
        return () => {
          return h(props.tag!, { ref: roolElRef }, slots.default?.());
        };
      }

      watchPostEffect((onCleanup) => {
        if (!roolElRef.value) return;
        model.$addNativeElement('dropzone', roolElRef.value!, {
          label: props.label as T['label'],
          data: (props as any).data,
        });
        onCleanup(() => {
          model.$removeNativeElement('dropzone', roolElRef.value!);
        });
      });

      const classes = computed(() => {
        const cls = model.classes;
        const result: string[] = [];
        result.push(cls.dropzone);
        if (model.isDragging()) {
          const dropzone = model.$findDndElement('dropzone', roolElRef.value!)!;
          if (model.isDroppable(dropzone)) {
            result.push(...ensureArray(cls['dropzone:droppable']));
          } else {
            result.push(...ensureArray(cls['dropzone:disabled']));
          }
          if (model.isOver(dropzone)) {
            result.push(...ensureArray(cls['dropzone:over']));
          }
        }
        return result;
      });

      return () => {
        return h(
          props.tag!,
          {
            ref: roolElRef,
            class: classes.value,
          },
          slots.default?.()
        );
      };
    },
  });
}

export type DistributeDndDropzoneDefinition<T extends DndElement = DndElement> =
  T extends any ? ReturnType<typeof createDndDropzone<T>> : never;

export const DndDropzone = createDndDropzone();
