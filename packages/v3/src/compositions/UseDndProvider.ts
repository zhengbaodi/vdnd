import {
  nextTick,
  onMounted,
  onUpdated,
  provide,
  shallowRef,
  toRef,
  unref,
  watch,
  watchEffect,
} from 'vue';
import DndElement from '../DndElement';
import { ensureArray, isDef, emptyFn } from '@vdnd/shared';
import { DndContextSymbol, DndParentElementSymbol } from './Symbols';

import type { ShallowRef } from 'vue';
import type {
  DndOptions,
  DndClasses,
  InternalDndOptions,
  MirrorOptions,
  DndInstance,
  DndEventTable,
} from '../types';
import {
  AbstractDnd,
  AbstractDndOptions,
  DragEvent as BaseDragEvent,
  DragStartEvent as BaseDragStartEvent,
  DragPreventEvent as BaseDragPreventEvent,
  DragEnterEvent as BaseDragEnterEvent,
  DragOverEvent as BaseDragOverEvent,
  DragLeaveEvent as BaseDragLeaveEvent,
  DragEndEvent as BaseDragEndEvent,
  DropEvent as BaseDropEvent,
} from '@vdnd/base';

export const defaultDndClasses: DndClasses = {
  'source:dragging': 'dnd-source--dragging',
  'source:draggable': 'dnd-source--draggable',
  'source:disabled': 'dnd-source--disabled',
  'dropzone:over': 'dnd-dropzone--over',
  'dropzone:droppable': 'dnd-dropzone--droppable',
  'dropzone:disabled': 'dnd-dropzone--disabled',
};

export const defaultMirrorOptions: MirrorOptions = {
  create: ({ source }) => source.nativeEl!.cloneNode(true),
  appendTo: ({ source }) => source.nativeEl!.parentNode || document.body,
};

export function useInternalDndOptions<O extends DndOptions>(
  instance: DndInstance<O>
) {
  const type = instance.type;
  const options = shallowRef<InternalDndOptions<O>>();

  function updateInternalOptionsBy(_options: O) {
    const internalOptions = { ..._options };
    internalOptions.debug ??= false;
    internalOptions.strict ??= false;
    internalOptions.source ??= 'dnd-source';
    internalOptions.dropzone ??= 'dnd-dropzone';
    internalOptions.handle ??= 'dnd-handle';

    internalOptions.classes = {
      ...defaultDndClasses,
      ...(internalOptions.classes || {}),
    };

    if (internalOptions.type === 'mouse' || internalOptions.type === 'touch') {
      internalOptions.mirror = {
        ...defaultMirrorOptions,
        ...(internalOptions.mirror || {}),
      };
    }

    if (internalOptions.type === 'mouse') {
      internalOptions.suppressUIEvent ??= false;
    }

    if (internalOptions.type === 'touch') {
      internalOptions.delay ??= 100;
    }

    options.value = internalOptions as any;
  }

  updateInternalOptionsBy({
    type,
    ...(instance.options as object),
  } as O);

  let shouldUpdateInternalOptions = false;
  const watchPublicOptions = () => {
    const unwatch = watch(
      toRef(instance, 'options'),
      () => {
        if (instance.isDragging()) {
          shouldUpdateInternalOptions = true;
          // optimization
          unwatch();
        } else {
          updateInternalOptionsBy({
            type,
            ...(instance.options as object),
          } as O);
        }
      },
      {
        flush: 'pre',
        deep: true,
      }
    );
  };

  watchPublicOptions();

  instance.on('drag:end', () => {
    if (shouldUpdateInternalOptions) {
      shouldUpdateInternalOptions = false;
      updateInternalOptionsBy({
        type,
        ...(instance.options as object),
      } as O);
      watchPublicOptions();
    }
  });

  return options as ShallowRef<InternalDndOptions<O>>;
}

export type DndContext<O extends DndOptions = DndOptions> = {
  options: InternalDndOptions<O>;
  instance: DndInstance<O>;
  classnamesOf: (
    id: keyof DndClasses | 'source' | 'dropzone' | 'handle'
  ) => string[];
  isDraggable: (source: Element) => boolean;
  isDroppable: (dropzone: Element) => boolean;
} & ReturnType<typeof useDndElementMap>;

function useDndElementMap() {
  // native -> DndElement
  const map = new Map<Element, DndElement>();
  const getDndElementByNativeEl = (nativeEl: Element) =>
    map.get(nativeEl) || null;

  const storeDndElement = (nativeEl: Element, dndEl: DndElement) =>
    map.set(nativeEl, dndEl);
  const deleteDndElementByNativeEl = (nativeEl: Element) =>
    map.delete(nativeEl);
  return {
    storeDndElement,
    getDndElementByNativeEl,
    deleteDndElementByNativeEl,
  };
}

export function useContextInjector<O extends DndOptions>(
  instance: DndInstance<O>,
  options: ShallowRef<InternalDndOptions<O>>,
  container: ShallowRef<HTMLElement | undefined>
) {
  provide(DndParentElementSymbol, instance.rootDndElement);
  instance.$setRootDndElement(instance.rootDndElement);
  onMounted(() => {
    instance.rootDndElement.nativeEl = container.value || null;
    if (instance.rootDndElement.nativeEl) {
      instance.rootDndElement.nativeEl;
    }
  });

  const {
    storeDndElement,
    getDndElementByNativeEl,
    deleteDndElementByNativeEl,
  } = useDndElementMap();
  const isDraggable = (source: Element) => {
    const internalEl = getDndElementByNativeEl(source);
    return internalEl?.draggable ?? false;
  };
  const isDroppable = (dropzone: Element) => {
    const internalEl = getDndElementByNativeEl(dropzone);
    if (!internalEl) return false;
    return internalEl.droppable
      ? options.value.strict
        ? !instance.isDragging({ id: internalEl.id })
        : true
      : false;
  };

  const context: DndContext<O> = {
    instance,
    get options() {
      return options.value;
    },
    storeDndElement,
    getDndElementByNativeEl,
    deleteDndElementByNativeEl,
    classnamesOf: (id) => {
      if (id === 'source' || id === 'dropzone' || id === 'handle') {
        return ensureArray(unref(options)[id]);
      }
      return ensureArray(unref(options).classes[id]);
    },
    isDraggable,
    isDroppable,
  };
  provide(DndContextSymbol, context);

  return context;
}

export function useBaseDnd<O extends AbstractDndOptions>(
  constructBaseDnd: (options: O) => AbstractDnd,
  options: () => O
) {
  const baseDnd = shallowRef<AbstractDnd | null>(null);

  onMounted(() => {
    watchEffect((onCleanup) => {
      baseDnd.value = constructBaseDnd(options());
      onCleanup(() => {
        baseDnd.value?.destroy();
        baseDnd.value = null;
      });
    });
  });

  return baseDnd;
}

export function useBaseDndBridge(
  context: DndContext,
  baseDnd: ShallowRef<AbstractDnd | null>
) {
  const { instance, getDndElementByNativeEl } = context;
  const { isDragging } = instance;
  const strict = () => context.options.strict;

  const onDrag = (e: BaseDragEvent) => {
    const { over, container, originalEvent } = e;
    const _over = over && getDndElementByNativeEl(over);
    instance.$emit('drag', {
      type: 'drag',
      source: instance.source!,
      container,
      over: _over
        ? strict() && isDragging({ id: _over.id })
          ? null
          : _over
        : null,
      originalEvent: originalEvent as any,
    });
  };

  const onDragStart = (e: BaseDragStartEvent) => {
    const { container, originalEvent } = e;
    const source = getDndElementByNativeEl(e.source)!;
    instance.$setSource(source);
    instance.$emit('drag:start', {
      type: 'drag:start',
      source,
      container,
      originalEvent: originalEvent as any,
    });
  };

  const onDragPrevent = (e: BaseDragPreventEvent) => {
    const { container, originalEvent } = e;
    const source = getDndElementByNativeEl(e.source);
    if (!isDef(source)) {
      console.warn(
        `[vdnd warn]: currently attempting to drag an uncontrolled 'source', this means that the 'source' was not created through '<DndSource />', vdnd will ignore it`
      );
      return;
    }
    instance.$emit('drag:prevent', {
      type: 'drag:prevent',
      source,
      container,
      originalEvent: originalEvent as any,
    });
  };

  const onDragEnter = (e: BaseDragEnterEvent) => {
    const enter = getDndElementByNativeEl(e.enter);
    if (!isDef(enter)) {
      console.warn(
        `[vdnd warn]: currently attempting to indicate an uncontrolled 'dropzone' as the current drop target, this means that the 'dropzone' was not created through '<DndDropzone />', vdnd will ignore it`
      );
      return;
    }
    if (strict() && isDragging({ id: enter.id })) return;
    instance.$setOver(enter);
    const { container, originalEvent } = e;
    instance.$emit('drag:enter', {
      type: 'drag:enter',
      source: instance.source!,
      enter,
      container,
      originalEvent: originalEvent as any,
    });
  };

  const onDragOver = (e: BaseDragOverEvent) => {
    const over = getDndElementByNativeEl(e.over);
    if (!isDef(over)) return;
    if (strict() && isDragging({ id: over.id })) return;
    const { container, originalEvent } = e;
    instance.$emit('drag:over', {
      type: 'drag:over',
      source: instance.source!,
      over,
      container,
      originalEvent: originalEvent as any,
    });
  };

  const onDragLeave = (e: BaseDragLeaveEvent) => {
    const leave = getDndElementByNativeEl(e.leave);
    if (!isDef(leave)) return;
    if (strict() && isDragging({ id: leave.id })) return;
    const { container, originalEvent } = e;
    if (leave.id === instance.over?.id) {
      instance.$setOver(null);
    }
    instance.$emit('drag:leave', {
      type: 'drag:leave',
      source: instance.source!,
      leave,
      container,
      originalEvent: originalEvent as any,
    });
  };

  // vdnd only ensure that updating dom is safe on 'drop' or 'drag:end' event handler.

  // In the native dnd, browser will not dispatch 'dragend' event,
  // if we remove the current source from dom before 'dragend' event is dispatched by browser.

  // Therefor, vdnd will emit 'drop' event on 'drag:end' event handler to avoid it.
  let deferredOnDrop = emptyFn;
  const onDrop = (e: BaseDropEvent) => {
    const { container, originalEvent } = e;
    const dropzone = getDndElementByNativeEl(e.dropzone)!;
    if (strict() && isDragging({ id: dropzone.id })) return;
    const dropEventPayload: DndEventTable['drop'] = {
      type: 'drop',
      dropzone,
      source: instance.source!,
      container,
      originalEvent: originalEvent as any,
    };

    // For throwing possible exceptions on this handler, 'deferredOnDrop' only performs the core function.
    deferredOnDrop = () => instance.$emit('drop', dropEventPayload);
  };

  const onDragEnd = (e: BaseDragEndEvent) => {
    deferredOnDrop();
    deferredOnDrop = emptyFn;

    const { container, originalEvent } = e;
    const source = instance.source!;
    const over = e.over && getDndElementByNativeEl(e.over);
    const isDraggingOver = isDragging({ id: over?.id });

    instance.$setOver(null);
    instance.$setSource(null);
    nextTick(() => {
      instance.$emit('drag:end', {
        type: 'drag:end',
        source,
        over: over ? (strict() && isDraggingOver ? null : over) : null,
        container,
        originalEvent: originalEvent as any,
      });
    });
  };

  const connectBaseDnd = (dnd: AbstractDnd) => {
    dnd
      .on('drag', onDrag)
      .on('drag:prevent', onDragPrevent)
      .on('drag:start', onDragStart)
      .on('drag:enter', onDragEnter)
      .on('drag:over', onDragOver)
      .on('drag:leave', onDragLeave)
      .on('drag:end', onDragEnd)
      .on('drop', onDrop);
  };

  watchEffect(
    () => {
      const dnd = baseDnd.value;
      dnd && connectBaseDnd(dnd);
    },
    {
      flush: 'sync',
    }
  );

  onUpdated(() => {
    if (!instance.isDragging()) return;

    const { getDndElementByNativeEl } = context;
    if (instance.source?.nativeEl) {
      const internal = getDndElementByNativeEl(instance.source.nativeEl);
      if (!internal) {
        console.error(
          '[vdnd error]: the current source was removed while dragging, this may lead to bugs'
        );
      }
    }

    if (instance.over?.nativeEl) {
      const internal = getDndElementByNativeEl(instance.over.nativeEl);
      if (!internal) {
        console.error(
          '[vdnd error]: the current drop target was removed while dragging, this may lead to bugs'
        );
      }
    }
  });
}
