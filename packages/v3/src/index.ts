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

export type {
  // dnd options
  DndType,
  CommonDndOptions,
  NativeDndOptions,
  MouseDndOptions,
  TouchDndOptions,
  DndOptions,
  DndClasses,
  MirrorOptions,
  MirrorCreator,
  MirrorAppendTo,

  // dnd events
  DndEvent,
  DragEvent,
  DragStartEvent,
  DragPreventEvent,
  DragEnterEvent,
  DragLeaveEvent,
  DragOverEvent,
  DragEndEvent,
  DropEvent,

  //
  DndInstance,
} from './types';

// composition apis
export { default as useDnd } from './compositions/UseDndInstance';
export {
  useNativeDnd,
  useMouseDnd,
  useTouchDnd,
} from './compositions/UseDndInstance';

export * from './array.utils';

export type DndProvider = typeof NativeDnd | typeof MouseDnd | typeof TouchDnd;
