import type {
  DragEvent,
  DragStartEvent,
  DragPreventEvent,
  DragEnterEvent,
  DragOverEvent,
  DragLeaveEvent,
  DragEndEvent,
  DropEvent,
} from './dnd-events';
import type DndElement from '../DndElement';
import type { DndElementMatcher } from '../DndElement';
import type {
  MapDndType,
  DndOptions,
  MouseDndOptions,
  NativeDndOptions,
  TouchDndOptions,
} from './dnd-options';

type NativeDragEvent = globalThis.DragEvent;

export type DndEventTable<
  O extends DndOptions = DndOptions,
  V = any,
> = O extends MouseDndOptions
  ? DndEventTableForMouse<V>
  : O extends TouchDndOptions
    ? DndEventTableForTouch<V>
    : O extends NativeDndOptions
      ? DndEventTableForNative<V>
      : never;

export type DndEventTableForMouse<V = any> = {
  drag: DragEvent<V, null>;
  'drag:start': DragStartEvent<V, MouseEvent>;
  'drag:prevent': DragPreventEvent<V, MouseEvent>;
  'drag:enter': DragEnterEvent<V, MouseEvent>;
  'drag:over': DragOverEvent<V, null>;
  'drag:leave': DragLeaveEvent<V, MouseEvent | KeyboardEvent>;
  'drag:end': DragEndEvent<V, MouseEvent | KeyboardEvent>;
  drop: DropEvent<V, MouseEvent>;
};

export type DndEventTableForTouch<V = any> = {
  drag: DragEvent<V, null>;
  'drag:start': DragStartEvent<V, TouchEvent>;
  'drag:prevent': DragPreventEvent<V, TouchEvent>;
  'drag:enter': DragEnterEvent<V, TouchEvent>;
  'drag:over': DragOverEvent<V, null>;
  'drag:leave': DragLeaveEvent<V, TouchEvent>;
  'drag:end': DragEndEvent<V, TouchEvent>;
  drop: DropEvent<V, TouchEvent>;
};

export type DndEventTableForNative<V = any> = {
  drag: DragEvent<V, NativeDragEvent>;
  'drag:start': DragStartEvent<V, NativeDragEvent>;
  'drag:prevent': DragPreventEvent<V, NativeDragEvent>;
  'drag:enter': DragEnterEvent<V, NativeDragEvent>;
  'drag:over': DragOverEvent<V, NativeDragEvent>;
  'drag:leave': DragLeaveEvent<V, NativeDragEvent>;
  'drag:end': DragEndEvent<V, NativeDragEvent>;
  drop: DropEvent<V, NativeDragEvent>;
};

export type DndInstance<O extends DndOptions = DndOptions, V = any> = {
  type: MapDndType<O>;

  options: Omit<O, 'type'>;

  /**
   * The current source.
   */
  source: DndElement<V> | null;

  /**
   * The current drop target.
   */
  over: DndElement<V> | null;

  /**
   * The root element of the DndElementTree composed by sources and dropzones in DndProvider(NativeDnd, MouseDnd, TouchDnd).
   */
  rootDndElement: DndElement<V>;

  /**
   * Returns true, if the current source exists.
   */
  isDragging(): boolean;

  /**
   * Returns true, if label of the current source is specified label.
   */
  isDragging(label: string): boolean;

  /**
   * Returns true, if label of the current source is one of specified labels.
   */
  isDragging(labels: string[]): boolean;

  /**
   * Returns true, if the current source satisfies specified matcher.
   */
  isDragging(matcher: DndElementMatcher): boolean;

  /**
   * Returns true, if the current drop target exists.
   */
  isOver(): boolean;

  /**
   * Returns true, if label of the current drop target is equal to specified label.
   */
  isOver(label: string): boolean;

  /**
   * Returns true, if label of the current drop target is one of specified labels.
   */
  isOver(labels: string[]): boolean;

  /**
   * Returns true, if the current drop target satisfies specified matcher.
   */
  isOver(matcher: DndElementMatcher): boolean;

  on<K extends keyof DndEventTable<O, V>>(
    type: K,
    callback: (event: DndEventTable<O, V>[K]) => void
  ): void;

  once<K extends keyof DndEventTable<O, V>>(
    type: K,
    callback: (event: DndEventTable<O, V>[K]) => void
  ): void;

  off<K extends keyof DndEventTable<O, V>>(
    type: K,
    callback: (event: DndEventTable<O, V>[K]) => void
  ): void;

  /** @internal */
  $setOver(over: DndElement<V> | null): void;

  /** @internal */
  $setSource(source: DndElement<V> | null): void;

  /** @internal */
  $setRootDndElement(rootDndElement: DndElement<V>): void;

  /** @internal */
  $emit<K extends keyof DndEventTable<O, V>>(
    type: K,
    payload: DndEventTable<O, V>[K]
  ): void;

  /** @internal */
  $destroy(): void;
};
