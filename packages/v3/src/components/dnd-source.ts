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

export type DndSourceProps<T extends DndElement> = HTMLAttributes &
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

export type DistributeDndSourceProps<T extends DndElement = DndElement> =
  T extends any ? DndSourceProps<T> : never;

export const DndSource = defineComponent(
  <T extends DndElement = DndElement>(
    props: DistributeDndSourceProps<T>,
    { slots }: SetupContext
  ) => {
    const model = injectDndModel();
    const roolElRef = shallowRef<HTMLElement>();

    if (!model) {
      onMounted(() => {
        console.warn(
          '[vdnd warn]: If the <DndSource />(%o) is not nested within the <DndContainer />, it will not function as expected.',
          roolElRef.value
        );
      });
      return () => {
        return h(props.tag!, { ref: roolElRef }, { default: slots.default });
      };
    }

    watchPostEffect((onCleanup) => {
      if (!roolElRef.value) return;
      model.$addNativeElement('source', roolElRef.value!, {
        label: props.label,
        data: props.data,
      });
      onCleanup(() => {
        model.$removeNativeElement('source', roolElRef.value!);
      });
    });

    const classes = computed(() => {
      const cls = model.classes;
      const result: string[] = [];
      result.push(cls.source);
      if (model.isDraggable(props.label, props.data)) {
        result.push(...ensureArray(cls['source:draggable']));
        if (model.isDragging(props.label, props.data)) {
          result.push(...ensureArray(cls['source:dragging']));
        }
      } else {
        result.push(...ensureArray(cls['source:disabled']));
      }
      return result;
    });

    return () => {
      return h(
        props.tag!,
        {
          ref: roolElRef,
          class: classes.value,
          draggable: true,
        },
        { default: slots.default }
      );
    };
  },
  {
    name: 'DndSource',
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
