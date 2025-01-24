import type { Plugin as VuePlugin } from 'vue';
// components
import NativeDnd from './components/NativeDnd';
import MouseDnd from './components/MouseDnd';
import TouchDnd from './components/TouchDnd';
import DndSource from './components/DndSource';
import DndDropzone from './components/DndDropzone';
import DndHandle from './components/DndHandle';

export { NativeDnd, MouseDnd, TouchDnd, DndSource, DndDropzone, DndHandle };

// constants
export {
  defaultDndClasses,
  defaultMirrorOptions,
} from './compositions/UseDndProvider';

// dnd element
export { default as DndElement } from './DndElement';
export type { DndElementMatcher } from './DndElement';

// dnd options
export type {
  DndType,
  CommonDndOptions,
  SimulatedDndOptions,
  NativeDndOptions,
  MouseDndOptions,
  TouchDndOptions,
  DndOptions,
  DndClasses,
  MirrorOptions,
  MirrorCreator,
  MirrorAppendTo,
  BaseMirrorOptions,
} from './types';

// dnd events
export type {
  DndEvent,
  DragEvent,
  DragStartEvent,
  DragPreventEvent,
  DragEnterEvent,
  DragLeaveEvent,
  DragOverEvent,
  DragEndEvent,
  DropEvent,
} from './types';

// composition apis
export { default as useDnd } from './compositions/UseDndInstance';
export {
  useNativeDnd,
  useMouseDnd,
  useTouchDnd,
} from './compositions/UseDndInstance';
export type { DndInstance } from './compositions/UseDndInstance';

export * from './array-utils';

/**
 * Registers global components: NativeDnd、MouseDnd、TouchDnd、DndSource、DndDropzone、DndHandle.
 */
export const VueDndPlugin: VuePlugin = {
  install(app) {
    app.component(NativeDnd.name!, NativeDnd);
    app.component(MouseDnd.name!, MouseDnd);
    app.component(TouchDnd.name!, TouchDnd);
    app.component(DndSource.name!, DndSource);
    app.component(DndDropzone.name!, DndDropzone);
    app.component(DndHandle.name!, DndHandle);
  },
};
