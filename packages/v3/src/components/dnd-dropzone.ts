import {
  h,
  computed,
  shallowRef,
  watchPostEffect,
  onMounted,
  defineComponent,
  type SetupContext,
  type HTMLAttributes,
} from 'vue';
import type { DndElement } from '../dnd-element';
import { injectDndModel } from '../dnd-model';

function ensureArray<T = unknown>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value];
}

export type DndDropzoneProps<T extends DndElement> = HTMLAttributes &
  (T['data'] extends undefined
    ? {
        tag?: string;
        label: T['label'];
        data?: T['data'];
      }
    : {
        tag?: string;
        label: T['label'];
        /**
         * Don't pass `undefined` as `data`.
         *
         * The union with `undefined` here is to ensure that the type inferring of the `label` is friendly enough.
         */
        data: T['data'] | undefined;
      });

export type DistributeDndDropzoneProps<T extends DndElement = DndElement> =
  T extends any ? DndDropzoneProps<T> : never;

export const DndDropzone = defineComponent(
  <T extends DndElement = DndElement>(
    props: DistributeDndDropzoneProps<T>,
    { slots }: SetupContext
  ) => {
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
        return h(props.tag!, { ref: roolElRef }, { default: slots.default });
      };
    }

    watchPostEffect((onCleanup) => {
      if (!roolElRef.value) return;
      model.$addNativeElement('dropzone', roolElRef.value!, {
        label: props.label,
        data: props.data,
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
        { default: slots.default }
      );
    };
  },
  {
    name: 'DndDropzone',
    props: {
      tag: {
        type: String,
        default: 'div',
      },
      label: {
        type: String,
        required: true,
      },
      data: {
        type: null,
        default: void 0,
      },
    },
  }
);
