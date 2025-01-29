import type DndElement from '../DndElement';

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

export type MirrorOptions<V = any, E extends Event = Event> = {
  /**
   * Creates the mirror.
   */
  create?: MirrorCreator<V, E>;

  /** Classes of the mirror, default is 'dnd-mirror'. */
  className?: string | string[];

  /**
   * Keeps the dimensions(width and height) of the mirror consistent with that of the current source,
   * default is false.
   */
  constrainDimensions?: boolean;

  /**
   * The implementation of cursorOffsetX refers to:
   * https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer/setDragImage
   */
  cursorOffsetX?: number;

  /**
   * The implementation of cursorOffsetY refers to:
   * https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer/setDragImage
   */
  cursorOffsetY?: number;

  /**
   * The parent node used when inserting the mirror.
   */
  appendTo?: MirrorAppendTo<V, E>;
};

export type DndType = 'native' | 'mouse' | 'touch';

export interface DndClasses {
  'source:dragging': string | string[];
  'source:draggable': string | string[];
  'source:disabled': string | string[];
  'dropzone:over': string | string[];
  'dropzone:droppable': string | string[];
  'dropzone:disabled': string | string[];
}

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
   * https://www.npmjs.com/package/@vdnd/v3
   */
  classes?: Partial<DndClasses>;
}

export interface MouseDndOptions<V = any> extends CommonDndOptions {
  type: 'mouse';

  mirror?: MirrorOptions<V, MouseEvent>;

  /**
   * @experimental
   * Suppresses `UIEvent` or not while dragging.
   */
  suppressUIEvent?: boolean;
}

export interface TouchDndOptions<V = any> extends CommonDndOptions {
  type: 'touch';

  mirror?: MirrorOptions<V, TouchEvent>;

  /**
   * https://www.npmjs.com/package/@vdnd/v3
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

type DeepRequired<T> = T extends Function
  ? T
  : T extends object
    ? {
        [P in keyof T]-?: DeepRequired<T[P]>;
      }
    : T;

export type InternalDndOptions<O extends DndOptions> = DeepRequired<
  ExactDndOptions<O>
>;
