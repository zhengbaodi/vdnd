import AbstractEvent from './AbstractEvent';

export class DragEvent extends AbstractEvent {
  static type = 'drag';

  constructor(
    public source: Element,
    public over: Element | null,
    public container: HTMLElement,
    public originalEvent: Event | null
  ) {
    super();
  }
}

export class DragStartEvent extends AbstractEvent {
  static type = 'drag:start';

  constructor(
    public source: Element,
    public container: HTMLElement,
    public originalEvent: Event,
    public clientX?: number,
    public clientY?: number
  ) {
    super();
  }
}

export class DragPreventEvent extends AbstractEvent {
  static type = 'drag:prevent';

  constructor(
    public source: Element,
    public container: HTMLElement,
    public originalEvent: Event
  ) {
    super();
  }
}

export class DragEnterEvent extends AbstractEvent {
  static type = 'drag:enter';

  constructor(
    public source: Element,
    public enter: Element,
    public container: HTMLElement,
    public originalEvent: Event
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
    public source: Element,
    public over: Element | null,
    public container: HTMLElement,
    public originalEvent: Event,
    public clientX?: number,
    public clientY?: number
  ) {
    super();
  }
}

export class DragOverEvent extends AbstractEvent {
  static type = 'drag:over';

  constructor(
    public source: Element,
    public over: Element,
    public container: HTMLElement,
    public originalEvent: Event | null
  ) {
    super();
  }
}

export class DragLeaveEvent extends AbstractEvent {
  static type = 'drag:leave';

  constructor(
    public source: Element,
    public leave: Element,
    public container: HTMLElement,
    public originalEvent: Event
  ) {
    super();
  }
}

export class DropEvent extends AbstractEvent {
  static type = 'drop';

  constructor(
    public source: Element,
    public dropzone: Element,
    public container: HTMLElement,
    public originalEvent: Event
  ) {
    super();
  }
}

export class DragEndEvent extends AbstractEvent {
  static type = 'drag:end';

  constructor(
    public source: Element,
    public over: Element | null,
    public container: HTMLElement,
    public originalEvent: Event
  ) {
    super();
  }
}
