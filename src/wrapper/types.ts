import type DndElement from './DndElement';
import type { MirrorOptions as BaseMirrorOptions } from '@base/plugins/Mirror';
export type {
  default as BaseAbstractDnd,
  AbstractDndOptions as BaseAbstractDndOptions,
} from '@base/AbstractDnd';
export type { NativeDndOptions as BaseNativeDndOptions } from '@base/NativeDnd';
export type { SimulatedDndOptions as BaseSimulatedDndOptions } from '@base/SimulatedDnd';

export type { BaseMirrorOptions };

export type {
  DragEvent as BaseDragEvent,
  DragStartEvent as BaseDragStartEvent,
  DragPreventEvent as BaseDragPreventEvent,
  DragEnterEvent as BaseDragEnterEvent,
  DragOverEvent as BaseDragOverEvent,
  DragLeaveEvent as BaseDragLeaveEvent,
  DragEndEvent as BaseDragEndEvent,
  DropEvent as BaseDropEvent,
} from '@base/DndEvent';

export type DeepRequired<T> = T extends Function
  ? T
  : T extends object
    ? {
        [P in keyof T]-?: DeepRequired<T[P]>;
      }
    : T;

export interface DndClasses {
  'source:dragging': string | string[];
  'source:draggable': string | string[];
  'source:disabled': string | string[];
  'dropzone:over': string | string[];
  'dropzone:droppable': string | string[];
  'dropzone:disabled': string | string[];
}

export type MirrorCreator<V = any, E extends Event = Event> = (params: {
  /** The current source. */
  source: DndElement<V>;

  /** The root element rendered by DndProvider(NativeDnd, MouseDnd, TouchDnd). */
  container: HTMLElement;

  originalEvent: E;
}) => Node;

type CSSSelector = string;

export type MirrorAppendTo<V = any, E extends Event = Event> =
  | CSSSelector
  | Node
  | ((params: {
      /** The current source. */
      source: DndElement<V>;

      /** The root element rendered by DndProvider(NativeDnd, MouseDnd, TouchDnd). */
      container: HTMLElement;

      originalEvent: E;
    }) => Node);

export type MirrorOptions<V = any, E extends Event = Event> = Omit<
  BaseMirrorOptions,
  'create' | 'appendTo'
> & {
  /**
   * Creates the mirror.
   */
  create?: MirrorCreator<V, E>;

  /**
   * The parent node used when inserting the mirror.
   */
  appendTo?: MirrorAppendTo<V, E>;
};

export type DndType = 'native' | 'mouse' | 'touch';

export interface CommonDndOptions {
  type: DndType;

  /**
   * Enables debugging mode or not,
   * debug mode: vdnd will display properties of `DndSource` and `DndDropzone` in DOM.
   */
  debug?:
    | boolean
    | (
        | 'id'
        | 'label'
        | 'value'
        | 'value-type'
        | 'role'
        | 'draggable'
        | 'droppable'
      )[];

  /**
   * Enables strict mode or not,
   * strict mode: the current source will not act as the current drop target.
   */
  strict?: boolean;

  /** Class of the root element rendered by `DndSource`. */
  source?: string;

  /** Class of the root element rendered by `DndDropzone`. */
  dropzone?: string;

  /** Class of the root element rendered by `DndHandle`. */
  handle?: string;

  /**
   * Classes attached to source or dropzone based on drag and drop interaction states.
   *
   * https://www.npmjs.com/package/vdnd
   */
  classes?: Partial<DndClasses>;
}

export interface SimulatedDndOptions<V = any, E extends Event = Event>
  extends CommonDndOptions {
  mirror?: MirrorOptions<V, E>;
}

export interface MouseDndOptions<V = any>
  extends SimulatedDndOptions<V, MouseEvent> {
  type: 'mouse';

  /**
   * @experimental
   * Suppresses `UIEvent` or not while dragging.
   */
  suppressUIEvent?: boolean;
}

export interface TouchDndOptions<V = any>
  extends SimulatedDndOptions<V, TouchEvent> {
  type: 'touch';

  /**
   * https://www.npmjs.com/package/vdnd
   */
  delay?: number;
}

export interface NativeDndOptions extends CommonDndOptions {
  type: 'native';
}

export type DndOptions = NativeDndOptions | MouseDndOptions | TouchDndOptions;

export type MapDndType<O extends DndOptions> = O extends NativeDndOptions
  ? 'native'
  : O extends MouseDndOptions
    ? 'mouse'
    : O extends TouchDndOptions
      ? 'touch'
      : never;

export type ExactDndOptions<O extends DndOptions> = O extends NativeDndOptions
  ? NativeDndOptions
  : O extends MouseDndOptions
    ? MouseDndOptions
    : O extends TouchDndOptions
      ? TouchDndOptions
      : never;

export type InternalDndOptions<O extends DndOptions> = DeepRequired<
  ExactDndOptions<O>
>;

export interface DndEvent<V = any, E extends Event | null = Event | null> {
  type: string;

  /** The current source. */
  source: DndElement<V>;

  /** The root element rendered by DndProvider(NativeDnd, MouseDnd, TouchDnd). */
  container: HTMLElement;

  originalEvent: E;
}

export interface DragEvent<V = any, E extends Event | null = Event | null>
  extends DndEvent<V, E> {
  type: 'drag';

  /** The current drop target. */
  over?: DndElement<V> | null;
}

export interface DragStartEvent<V = any, E extends Event = Event>
  extends DndEvent<V, E> {
  type: 'drag:start';
  originalEvent: E;
}

export interface DragPreventEvent<V = any, E extends Event = Event>
  extends DndEvent<V, E> {
  type: 'drag:prevent';

  /** The source attempting to drag. */
  source: DndElement<V>;

  originalEvent: E;
}

export interface DragEnterEvent<V = any, E extends Event = Event>
  extends DndEvent<V, E> {
  type: 'drag:enter';

  /** The dropzone which is about to become the current drop target. */
  enter: DndElement<V>;

  originalEvent: E;
}

export interface DragOverEvent<V = any, E extends Event | null = Event | null>
  extends DndEvent<V, E> {
  type: 'drag:over';

  /** The current drop target. */
  over: DndElement<V>;
}

export interface DragLeaveEvent<V = any, E extends Event = Event>
  extends DndEvent<V, E> {
  type: 'drag:leave';

  /**
   * The previous current drop target or the current drop target.
   * */
  leave: DndElement<V>;

  originalEvent: E;
}

export interface DropEvent<V = any, E extends Event = Event>
  extends DndEvent<V, E> {
  type: 'drop';

  /** The current drop target. */
  dropzone: DndElement<V>;

  originalEvent: E;
}

export interface DragEndEvent<V = any, E extends Event | null = Event | null>
  extends DndEvent<V, E> {
  type: 'drag:end';

  /** The current drop target. */
  over: DndElement<V> | null;
}

export type DndEvents =
  | 'drag'
  | 'drag:start'
  | 'drag:prevent'
  | 'drag:enter'
  | 'drag:over'
  | 'drag:leave'
  | 'drop'
  | 'drag:end';
