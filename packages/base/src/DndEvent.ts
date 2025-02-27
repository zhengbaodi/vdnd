import AbstractEvent from './AbstractEvent';

export class DragEvent extends AbstractEvent {
  static type = 'drag';

  constructor(
    public readonly source: Element,
    public readonly over: Element | null,
    public readonly container: HTMLElement,
    public readonly originalEvent: Event | null
  ) {
    super();
  }
}

export class DragStartEvent extends AbstractEvent {
  static type = 'drag:start';

  constructor(
    public readonly source: Element,
    public readonly container: HTMLElement,
    public readonly originalEvent: Event,
    public readonly clientX?: number,
    public readonly clientY?: number
  ) {
    super();
  }
}

export class DragPreventEvent extends AbstractEvent {
  static type = 'drag:prevent';

  constructor(
    public readonly source: Element,
    public readonly container: HTMLElement,
    public readonly originalEvent: Event
  ) {
    super();
  }
}

export class DragEnterEvent extends AbstractEvent {
  static type = 'drag:enter';

  constructor(
    public readonly source: Element,
    public readonly enter: Element,
    public readonly container: HTMLElement,
    public readonly originalEvent: Event
  ) {
    super();
  }
}

/**
 * Only for SimulatedDnd
 */
export class DragMoveEvent extends AbstractEvent {
  static type = 'drag:move';

  constructor(
    public readonly source: Element,
    public readonly over: Element | null,
    public readonly container: HTMLElement,
    public readonly originalEvent: Event,
    public readonly clientX?: number,
    public readonly clientY?: number
  ) {
    super();
  }
}

export class DragOverEvent extends AbstractEvent {
  static type = 'drag:over';

  constructor(
    public readonly source: Element,
    public readonly over: Element,
    public readonly container: HTMLElement,
    public readonly originalEvent: Event | null
  ) {
    super();
  }
}

export class DragLeaveEvent extends AbstractEvent {
  static type = 'drag:leave';

  constructor(
    public readonly source: Element,
    public readonly leave: Element,
    public readonly container: HTMLElement,
    public readonly originalEvent: Event
  ) {
    super();
  }
}

export class DropEvent extends AbstractEvent {
  static type = 'drop';

  constructor(
    public readonly source: Element,
    public readonly dropzone: Element,
    public readonly container: HTMLElement,
    public readonly originalEvent: Event
  ) {
    super();
  }
}

export class DragEndEvent extends AbstractEvent {
  static type = 'drag:end';

  constructor(
    public readonly source: Element,
    public readonly over: Element | null,
    public readonly container: HTMLElement,
    public readonly originalEvent: Event
  ) {
    super();
  }
}
