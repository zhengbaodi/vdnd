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

function createDndSource<T extends DndElement = DndElement>() {
  return defineComponent({
    name: 'DndSource',
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
            '[vdnd warn]: If the <DndSource />(%o) is not nested within the <DndContainer />, it will not function as expected.',
            roolElRef.value
          );
        });
        return () => {
          return h(props.tag!, { ref: roolElRef }, slots.default?.());
        };
      }

      watchPostEffect((onCleanup) => {
        if (!roolElRef.value) return;
        model.$addNativeElement('source', roolElRef.value!, {
          label: props.label as T['label'],
          data: (props as any).data,
        });
        onCleanup(() => {
          model.$removeNativeElement('source', roolElRef.value!);
        });
      });

      const classes = computed(() => {
        const cls = model.classes;
        const result: string[] = [];
        result.push(cls.source);
        if (model.isDraggable(props.label as T['label'], (props as any).data)) {
          result.push(...ensureArray(cls['source:draggable']));
          if (
            model.isDragging(props.label as T['label'], (props as any).data)
          ) {
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
            attrs: {
              draggable: true,
            },
            class: classes.value,
          },
          slots.default?.()
        );
      };
    },
  });
}

export type DistributeDndSourceDefinition<T extends DndElement = DndElement> =
  T extends any ? ReturnType<typeof createDndSource<T>> : never;

export const DndSource = createDndSource();
