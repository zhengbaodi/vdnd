import type { DndElement } from './dnd-element';

export type DragEvent<
  S extends DndElement = DndElement,
  Over extends DndElement = DndElement,
> = {
  type: 'drag';

  /**
   * The current drag source.
   */
  source: S;

  /**
   * The current drop target.
   */
  over: Over | undefined;

  originalEvent: globalThis.DragEvent;
};

export type DragStartEvent<S extends DndElement = DndElement> = {
  type: 'dragstart';

  /**
   * The current drag source.
   */
  source: S;

  originalEvent: globalThis.DragEvent;
};

export type DragPreventEvent<S extends DndElement = DndElement> = {
  type: 'dragprevent';

  /**
   * The disabled drag source.
   */
  source: S;

  originalEvent: globalThis.DragEvent;
};

export type DragEnterEvent<
  S extends DndElement = DndElement,
  Enter extends DndElement = DndElement,
> = {
  type: 'dragenter';

  /**
   * The current drag source.
   */
  source: S;

  /**
   * The current drop target.
   */
  enter: Enter;

  originalEvent: globalThis.DragEvent;
};

export type DragOverEvent<
  S extends DndElement = DndElement,
  Over extends DndElement = DndElement,
> = {
  type: 'dragover';

  /**
   * The current drag source.
   */
  source: S;

  /**
   * The current drop target.
   */
  over: Over;

  originalEvent: globalThis.DragEvent;
};

export type DragLeaveEvent<
  S extends DndElement = DndElement,
  Leave extends DndElement = DndElement,
  Enter extends DndElement = Leave,
> = {
  type: 'dragleave';

  /**
   * The current drag source.
   */
  source: S;

  /**
   * The previous current drop target.
   */
  leave: Leave;

  /**
   * The current drop target.
   */
  enter: Enter | undefined;

  originalEvent: globalThis.DragEvent;
};

export type DropEvent<
  S extends DndElement = DndElement,
  Dropzone extends DndElement = DndElement,
> = {
  type: 'drop';

  /**
   * The current drag source.
   */
  source: S;

  /**
   * The current drop target.
   */
  dropzone: Dropzone;

  originalEvent: globalThis.DragEvent;
};

export type DragEndEvent<
  S extends DndElement = DndElement,
  Over extends DndElement = DndElement,
> = {
  type: 'dragend';

  /**
   * The current drag source.
   */
  source: S;

  /**
   * The current drop target.
   */
  over: Over | undefined;

  originalEvent: globalThis.DragEvent;
};
