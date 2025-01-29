import {
  inject,
  computed,
  onScopeDispose,
  provide,
  watchSyncEffect,
} from 'vue';
import DndElement from '../DndElement';
import { DndContextSymbol, DndParentElementSymbol } from './Symbols';
import { isPrimitive, $typeof } from '@vdnd/shared';

import type { CommonDndOptions } from '../types';
import type { DndContext } from './UseDndProvider';

interface UseDndElementParams {
  label: () => string | undefined;
  value: () => any;
  source: () => boolean;
  dropzone: () => boolean;
  draggable: () => boolean;
  droppable: () => boolean;
  element: () => HTMLElement | null;
}

export default function useDndElement(
  ComponentName: string,
  params: UseDndElementParams
) {
  const ctx = inject<DndContext>(DndContextSymbol);

  if (!ctx) {
    console.error(
      `[vdnd error]: ${ComponentName} must be descendant of DndProvider(NativeDnd, MouseDnd, TouchDnd)`
    );
    return null;
  }

  const {
    source: isSource,
    dropzone: isDropzone,
    draggable: isDraggable,
    droppable: isDroppable,
  } = params;

  const parent = inject<DndElement>(DndParentElementSymbol) || null;
  const self = new DndElement(
    parent,
    document.body,
    void 0,
    void 0,
    false,
    false,
    false,
    false
  );
  if (parent) {
    parent.children.push(self);
  }
  provide(DndParentElementSymbol, self);
  onScopeDispose(() => {
    if (self.nativeEl) {
      ctx.deleteDndElementByNativeEl(self.nativeEl);
    }
    if (self.parent) {
      const index = self.parent.children.indexOf(self);
      if (index >= 0) {
        self.parent.children.splice(index, 1);
      }
    }
    self.children.length = 0;
  });

  watchSyncEffect(() => {
    self.role.source = isSource();
    self.role.dropzone = isDropzone();
    self.draggable = isDraggable();
    self.droppable = isDroppable();
    self.label = params.label();
    self.value = params.value();
    const el = params.element();
    if (el) {
      self.nativeEl = el;
      ctx.storeDndElement(self.nativeEl, self);
    }
  });

  const debug = (): NonNullable<
    Exclude<CommonDndOptions['debug'], boolean>
  > => {
    const debug = ctx.options.debug;
    if (typeof debug === 'boolean') {
      return debug
        ? [
            'id',
            'label',
            'value',
            'value-type',
            'role',
            'draggable',
            'droppable',
          ]
        : [];
    } else {
      return debug;
    }
  };

  const style = computed(() => {
    return ctx.options.type === 'native'
      ? {}
      : {
          'user-select': 'none',
        };
  });

  const attrs = computed(() => {
    const result: Record<string, unknown> = {};

    if (isSource()) {
      if (ctx.options.type === 'native') {
        result.draggable = true;
      }
    }

    for (const field of debug()) {
      switch (field) {
        case 'id':
        case 'label':
        case 'draggable':
        case 'droppable': {
          const value = self[field] ?? 'null';
          result[`data-dnd-${field}`] = value.toString();
          break;
        }
        case 'value': {
          result['data-dnd-value'] = isPrimitive(self.value)
            ? self.value
            : Object.prototype.toString.call(self.value);
          break;
        }
        case 'value-type': {
          result['data-dnd-value-type'] = $typeof(self.value);
          break;
        }
        case 'role': {
          const roles: string[] = [];
          if (isSource()) {
            roles.push('source');
          }
          if (isDropzone()) {
            roles.push('dropzone');
          }
          result['data-dnd-role'] = roles.join(',');
          break;
        }
      }
    }

    return result;
  });

  const classes = computed(() => {
    const source = ctx.instance.source;
    const over = ctx.instance.over;
    const result: string[] = [];

    const isDragging = (id?: number) =>
      typeof id === 'number' ? source?.id === id : source !== null;

    const isOver = (id?: number) =>
      typeof id === 'number' ? over?.id === id : over !== null;

    if (isSource()) {
      result.push(...ctx.classnamesOf('source'));
      if (isDragging(self.id)) {
        result.push(...ctx.classnamesOf('source:dragging'));
      }
      if (isDraggable()) {
        result.push(...ctx.classnamesOf('source:draggable'));
      } else {
        result.push(...ctx.classnamesOf('source:disabled'));
      }
    }

    if (isDropzone())
      attach_dropzone_classes: {
        result.push(...ctx.classnamesOf('dropzone'));
        if (!isDragging() || (ctx.options.strict && isDragging(self.id))) {
          break attach_dropzone_classes;
        }
        if (isOver(self.id)) {
          result.push(...ctx.classnamesOf('dropzone:over'));
        }
        if (isDroppable()) {
          result.push(...ctx.classnamesOf('dropzone:droppable'));
        } else {
          result.push(...ctx.classnamesOf('dropzone:disabled'));
        }
      }

    return result;
  });

  return {
    attrs,
    style,
    classes,
  };
}
