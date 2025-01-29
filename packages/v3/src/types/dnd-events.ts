import type DndElement from '../DndElement';

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
