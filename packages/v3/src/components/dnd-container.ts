import {
  h,
  provide,
  shallowRef,
  watchSyncEffect,
  watchPostEffect,
  onMounted,
  onBeforeUnmount,
  defineComponent,
  type SetupContext,
  type HTMLAttributes,
} from 'vue';
import {
  NativeDnd,
  type DragEvent as $DragEvent,
  type DragStartEvent as $DragStartEvent,
  type DragEnterEvent as $DragEnterEvent,
  type DragOverEvent as $DragOverEvent,
  type DragLeaveEvent as $DragLeaveEvent,
  type DropEvent as $DropEvent,
  type DragEndEvent as $DragEndEvent,
} from '@vdnd/native';
import type { DndElement } from '../dnd-element';
import { DndModelSymbol, type DndModel } from '../dnd-model';
import {
  DragEvent,
  DragStartEvent,
  DragPreventEvent,
  DragEnterEvent,
  DragOverEvent,
  DragLeaveEvent,
  DropEvent,
  DragEndEvent,
} from '../dnd-events';
import { validateHandle } from './dnd-handle';
import {
  inferDropEffect,
  unwrapDropEffect,
  type EffectAllowed,
} from '../dnd-interaction';

type NonNullableProps<O extends object> = {
  [K in keyof O]: NonNullable<O[K]>;
};

export type DndContainerProps<
  Source extends DndElement = DndElement,
  Dropzone extends DndElement = DndElement,
> = HTMLAttributes & {
  tag?: string;
  model: DndModel<Source, Dropzone>;
};

export const DndContainer = defineComponent(
  <
    Source extends DndElement = DndElement,
    Dropzone extends DndElement = DndElement,
  >(
    props: DndContainerProps<Source, Dropzone>,
    { slots }: SetupContext
  ) => {
    const model = props.model;
    const cls = model.classes;
    const roolElRef = shallowRef<HTMLElement>();
    const nativeDndRef = shallowRef<NativeDnd>();

    provide(DndModelSymbol, model);
    // if (injectDndModel()) {
    //   console.warn(
    //     '[vdnd warn]: Nested <DndContainer /> is currently not supported. Therefore, unexpected behavior may occur.'
    //   );
    // }

    watchPostEffect((onCleanup) => {
      if (!roolElRef.value) return;
      model.$addNativeElement('container', roolElRef.value!, void 0);
      onCleanup(() => {
        model.$removeNativeElement('container', roolElRef.value!);
      });
    });

    const onDrag = (e: $DragEvent) => {
      // The e.source may be an uncontrolled source.
      if (!model.currentSource) return;
      const dragEvent: DragEvent<Source, Dropzone> = {
        type: 'drag',
        source: model.currentSource!,
        over: model.currentTarget,
        originalEvent: e.originalEvent,
      };
      for (const i of model.interactions) {
        if (i.scope === '*') {
          i.onDrag?.(dragEvent);
        } else if (i.scope === 's') {
          if (model.isDragging(i.source)) {
            i.onDrag?.(dragEvent);
          }
        } else if (i.scope === 'd') {
          if (model.isOver(i.dropzone)) {
            i.onDrag?.(
              dragEvent as NonNullableProps<DragEvent<Source, Dropzone>>
            );
          }
        } else {
          if (model.isDragging(i.source) && model.isOver(i.dropzone)) {
            i.onDrag?.(
              dragEvent as NonNullableProps<DragEvent<Source, Dropzone>>
            );
          }
        }
      }
    };

    const _onDragPrevent = (e: $DragStartEvent) => {
      const source = model.$findDndElement('source', e.source)!;
      const dragpreventEvent: DragPreventEvent<Source> = {
        type: 'dragprevent',
        source,
        originalEvent: e.originalEvent,
      };
      for (const i of model.interactions) {
        if (i.scope === '*') {
          i.onDragPrevent?.(dragpreventEvent);
        } else if (i.scope == 's') {
          if (i.source === source.label) {
            i.onDragPrevent?.(dragpreventEvent);
          }
        }
      }
    };
    const onDragStart = (e: $DragStartEvent) => {
      const source = model.$findDndElement('source', e.source);
      if (!source) {
        console.warn(
          '[vdnd warn]: Currently attempting to drag a source(%o) that was not created via the <DndSource />. ' +
            'vdnd will ignore such an uncontrolled source.',
          e.source
        );
        return;
      }
      if (!model.isDraggable(source)) {
        e.cancel();
        _onDragPrevent(e);
        return;
      }

      model.$setCurrentSource(source);

      const dragstartEvent: DragStartEvent<Source> = {
        type: 'dragstart',
        source,
        originalEvent: e.originalEvent,
      };
      for (const i of model.interactions) {
        if (i.scope === '*') {
          i.onDragStart?.(dragstartEvent);
        } else if (i.scope == 's') {
          if (model.isDragging(i.source)) {
            i.onDragStart?.(dragstartEvent);
          }
        }
      }

      const dataTransfer = e.originalEvent.dataTransfer!;
      const effectAllowed = dataTransfer.effectAllowed;
      if (effectAllowed !== 'all' && effectAllowed !== 'uninitialized') {
        dataTransfer.effectAllowed = 'all';
        const DEFINE_DROPEFFECT = `useDndModel().defineInteraction({ scope: 's+d', source: 'image', dropzone: 'canvas', dropEffect: 'copy' })`;
        console.warn(
          "[vdnd warn]: Don't modify the effectAllowed, vdnd will fix it as `all`. " +
            `If you want to control the drag-and-drop feedback, you can define the dropEffect using the \`${DEFINE_DROPEFFECT}\`.`
        );
      }
    };

    const onDragEnter = (e: $DragEnterEvent) => {
      // The e.source may be an uncontrolled source.
      if (!model.currentSource) return;
      const enter = model.$findDndElement('dropzone', e.enter);
      if (!enter) {
        console.warn(
          '[vdnd warn]: Currently attempting to indicate a dropzone(%o) that was not created via the <DndDropzone /> as the current drop target. ' +
            'vdnd will ignore such an uncontrolled dropzone.',
          e.enter
        );
        return;
      }

      model.$setCurrentTarget(enter);

      const droppable = model.isDroppable(enter);
      const dataTransfer = e.originalEvent.dataTransfer!;
      const effectAllowed = dataTransfer.effectAllowed as EffectAllowed;

      let dropEffect: DataTransfer['dropEffect'];
      if (!droppable) {
        dataTransfer.dropEffect = dropEffect = 'none';
      } else {
        for (const i of model.interactions) {
          if (i.scope !== 's+d') continue;
          if (!i.dropEffect || i.dropzone !== enter.label) continue;
          dropEffect = unwrapDropEffect(
            i.dropEffect,
            model.currentSource!,
            enter
          );
        }
        dropEffect ||= inferDropEffect(effectAllowed);
        dataTransfer.dropEffect = dropEffect;
      }

      const dragenterEvent: DragEnterEvent<Source, Dropzone> = {
        type: 'dragenter',
        source: model.currentSource!,
        enter,
        originalEvent: e.originalEvent,
      };
      for (const i of model.interactions) {
        if (i.scope === '*') {
          i.onDragEnter?.(dragenterEvent);
        } else if (i.scope === 's') {
          if (model.isDragging(i.source)) {
            i.onDragEnter?.(dragenterEvent);
          }
        } else if (i.scope === 'd') {
          if (model.isOver(i.dropzone)) {
            i.onDragEnter?.(dragenterEvent);
          }
        } else {
          if (model.isDragging(i.source) && model.isOver(i.dropzone)) {
            i.onDragEnter?.(dragenterEvent);
          }
        }
      }

      if (dropEffect !== dataTransfer.dropEffect) {
        const DEFINE_DROPEFFECT = `useDndModel().defineInteraction({ scope: 's+d', source: 'image', dropzone: 'canvas', dropEffect: 'copy' })`;

        const DO_NOT_MODIFY_DROPEFFECT_IN_HANDLERS =
          "[vdnd warn]: Don't modify the dropEffect in `dragover` or `dragenter` event handlers. " +
          `If you want to control the drag-and-drop feedback, you can define the dropEffect using the \`${DEFINE_DROPEFFECT}\`.`;
        console.warn(DO_NOT_MODIFY_DROPEFFECT_IN_HANDLERS);
      }

      if (droppable) {
        if (dataTransfer.dropEffect === 'none') {
          dataTransfer.dropEffect =
            dropEffect || inferDropEffect(effectAllowed);
          console.warn(
            `[vdnd warn]: The dropEffect for a droppable dropzone must not be \`none\`, ` +
              `vdnd will reset it to \`${dataTransfer.dropEffect}\`.`
          );
        }
      } else {
        if (dataTransfer.dropEffect !== 'none') {
          dataTransfer.dropEffect = 'none';
          console.warn(
            '[vdnd warn]: The dropEffect for a non-droppable dropzone must be `none`, vdnd will force it to be `none`.'
          );
        }
      }
    };

    const onDragOver = (e: $DragOverEvent) => {
      if (!model.currentSource || !model.currentTarget) return;

      const droppable = model.isDroppable(model.currentTarget!);
      const dataTransfer = e.originalEvent.dataTransfer!;
      const effectAllowed = dataTransfer.effectAllowed as EffectAllowed;

      // Just as onDragEnter does.
      let dropEffect: DataTransfer['dropEffect'];
      if (!droppable) {
        dataTransfer.dropEffect = dropEffect = 'none';
      } else {
        for (const i of model.interactions) {
          if (i.scope !== 's+d') continue;
          if (!i.dropEffect || i.dropzone !== model.currentTarget.label) {
            continue;
          }
          dropEffect = unwrapDropEffect(
            i.dropEffect,
            model.currentSource!,
            model.currentTarget
          );
        }
        dropEffect ||= inferDropEffect(effectAllowed);
        dataTransfer.dropEffect = dropEffect;
      }

      const dragoverEvent: DragOverEvent<Source, Dropzone> = {
        type: 'dragover',
        source: model.currentSource!,
        over: model.currentTarget,
        originalEvent: e.originalEvent,
      };
      for (const i of model.interactions) {
        if (i.scope === '*') {
          i.onDragOver?.(dragoverEvent);
        } else if (i.scope === 's') {
          if (model.isDragging(i.source)) {
            i.onDragOver?.(dragoverEvent);
          }
        } else if (i.scope === 'd') {
          if (model.isOver(i.dropzone)) {
            i.onDragOver?.(dragoverEvent);
          }
        } else {
          if (model.isDragging(i.source) && model.isOver(i.dropzone)) {
            i.onDragOver?.(dragoverEvent);
          }
        }
      }

      // Just as onDragEnter does, but without giving a warning.
      if (droppable) {
        if (dataTransfer.dropEffect === 'none') {
          dataTransfer.dropEffect = inferDropEffect(effectAllowed);
        }
      } else {
        if (dataTransfer.dropEffect !== 'none') {
          dataTransfer.dropEffect = 'none';
        }
      }
    };

    const onDragLeave = (e: $DragLeaveEvent) => {
      if (!model.currentSource || !model.currentTarget) return;
      const enter = e.enter
        ? model.$findDndElement('dropzone', e.enter)
        : void 0;
      if (e.enter) {
        if (!enter) {
          // The interaction has not ended yet, but a valid enter cannot be found.
          model.$setCurrentTarget(void 0);
        }
      } else {
        // The interaction has not ended yet, but a valid enter cannot be found.

        // The relatedTarget represents an element we've entered.
        // It's null when we press 'esc', or when we release the mouse with the dropEffect being 'none'.
        if (e.originalEvent.relatedTarget !== null) {
          model.$setCurrentTarget(void 0);
        }
      }
      const leave = model.$findDndElement('dropzone', e.leave)!;
      const dragleaveEvent: DragLeaveEvent<Source, Dropzone> = {
        type: 'dragleave',
        source: model.currentSource!,
        leave,
        enter,
        originalEvent: e.originalEvent,
      };
      for (const i of model.interactions) {
        if (i.scope === '*') {
          i.onDragLeave?.(dragleaveEvent);
        } else if (i.scope === 's') {
          if (model.isDragging(i.source)) {
            i.onDragLeave?.(dragleaveEvent);
          }
        } else if (i.scope === 'd') {
          if (leave.label === i.dropzone) {
            i.onDragLeave?.(dragleaveEvent);
          }
        } else {
          if (model.isDragging(i.source) && leave.label === i.dropzone) {
            i.onDragLeave?.(dragleaveEvent);
          }
        }
      }
    };

    const onDrop = (e: $DropEvent) => {
      if (!model.currentSource || !model.currentTarget) return;
      const dropEvent: DropEvent<Source, Dropzone> = {
        type: 'drop',
        source: model.currentSource!,
        dropzone: model.currentTarget,
        originalEvent: e.originalEvent,
      };
      for (const i of model.interactions) {
        if (i.scope === '*') {
          i.onDrop?.(dropEvent);
        } else if (i.scope == 's') {
          if (model.isDragging(i.source)) {
            i.onDrop?.(dropEvent);
          }
        } else if (i.scope === 'd') {
          if (model.isOver(i.dropzone)) {
            i.onDrop?.(dropEvent);
          }
        } else if (i.scope === 's+d') {
          if (model.isDragging(i.source) && model.isOver(i.dropzone)) {
            i.onDrop?.(dropEvent);
          }
        }
      }
    };

    const onDragEnd = (e: $DragEndEvent) => {
      // The e.source may be an uncontrolled source.
      if (!model.currentSource) return;
      const dragendEvent: DragEndEvent<Source, Dropzone> = {
        type: 'dragend',
        source: model.currentSource,
        over: model.currentTarget,
        originalEvent: e.originalEvent,
      };
      for (const i of model.interactions) {
        if (i.scope === '*') {
          i.onDragEnd?.(dragendEvent);
        } else if (i.scope === 's') {
          if (model.isDragging(i.source)) {
            i.onDragEnd?.(dragendEvent);
          }
        } else if (i.scope === 'd') {
          if (model.isOver(i.dropzone)) {
            i.onDragEnd?.(
              dragendEvent as NonNullableProps<DragEndEvent<Source, Dropzone>>
            );
          }
        } else {
          if (model.isDragging(i.source) && model.isOver(i.dropzone)) {
            i.onDragEnd?.(
              dragendEvent as NonNullableProps<DragEndEvent<Source, Dropzone>>
            );
          }
        }
      }
      model.$setCurrentSource(void 0);
      model.$setCurrentTarget(void 0);
    };

    onMounted(() => {
      const nativeDnd = new NativeDnd(roolElRef.value!, {
        source: cls.source,
        dropzone: cls.dropzone,
        handle: cls.handle,
        isRecognizedSource(source) {
          const sources = model.findHTMLElements('source');
          return sources.includes(source);
        },
        isRecognizedDropzone(dropzone) {
          const dropzones = model.findHTMLElements('dropzone');
          return dropzones.includes(dropzone);
        },
      });
      nativeDnd.on('drag', onDrag);
      nativeDnd.on('dragstart', onDragStart);
      nativeDnd.on('dragenter', onDragEnter);
      nativeDnd.on('dragover', onDragOver);
      nativeDnd.on('dragleave', onDragLeave);
      nativeDnd.on('drop', onDrop);
      nativeDnd.on('dragend', onDragEnd);
      nativeDndRef.value = nativeDnd;
    });
    onBeforeUnmount(() => {
      nativeDndRef.value!.destroy();
    });

    onMounted(() => {
      model.$setInitialized(true);
    });
    onBeforeUnmount(() => {
      model.$setInitialized(false);
      model.$setCurrentSource(void 0);
      model.$setCurrentTarget(void 0);
    });

    onMounted(() => {
      const container = roolElRef.value!;
      const observer = new MutationObserver((mutations) => {
        const source = model.findHTMLElement('source', model.currentSource!);
        const dropzone =
          model.currentTarget &&
          model.findHTMLElement('dropzone', model.currentTarget);
        for (const { removedNodes } of mutations) {
          removedNodes.forEach((removedNode) => {
            if (removedNode === source) {
              console.warn(
                '[vdnd warn]: The current source(%o) was removed from the document during the drag-and-drop operation, ' +
                  'which will result in the inability to dispatch the `drag` and `dragend` events.',
                removedNode
              );
            } else if (removedNode === dropzone) {
              console.warn(
                '[vdnd warn]: The current drop target(%o) was removed from the document during the drag-and-drop operation, ' +
                  'which will result in the inability to dispatch the relevant `dragover`, `dragleave` and `drop` events.',
                removedNode
              );
            }
          });
        }
      });
      watchSyncEffect((onCleanup) => {
        if (model.isDragging()) {
          observer.observe(container, {
            subtree: true,
            childList: true,
            attributes: false,
            characterData: false,
          });
          onCleanup(() => observer.disconnect());
        }
      });
    });

    onMounted(() => {
      const handles = model.findHTMLElements('handle');
      const sources = model.findHTMLElements('source');
      for (const handle of handles) {
        if (!validateHandle(handle, sources)) {
          console.warn(
            '[vdnd warn]: If the <DndHandle />(%o) is not nested within the <DndSource />, it will not function as expected.',
            handle
          );
        }
      }
    });

    return () => {
      return h(
        props.tag!,
        {
          ref: roolElRef,
          class: [cls.container],
        },
        {
          default: slots.default,
        }
      );
    };
  },
  {
    name: 'DndContainer',
    props: {
      tag: {
        type: String,
        default: 'div',
      },
      model: {
        type: Object,
        required: true,
      },
    },
  }
);
