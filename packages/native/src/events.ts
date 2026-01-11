export abstract class AbstractEvent {
  static readonly type: string = 'event';

  static readonly cancelable: boolean = false;

  /**
   * Private instance variable to track canceled state
   */
  private _canceled = false;

  /**
   * Read-only cancelable
   */
  get cancelable() {
    return (this.constructor as typeof AbstractEvent).cancelable;
  }

  get type() {
    return (this.constructor as typeof AbstractEvent).type;
  }

  /**
   * Cancels the event instance
   */
  cancel() {
    if (this.cancelable) {
      this._canceled = true;
    }
  }

  /**
   * Check if event has been canceled
   */
  canceled() {
    return this._canceled;
  }
}

export class DragEvent extends AbstractEvent {
  static readonly type = 'drag';

  constructor(
    readonly source: HTMLElement,
    readonly over: HTMLElement | null,
    readonly container: HTMLElement,
    readonly originalEvent: globalThis.DragEvent
  ) {
    super();
  }
}

export class DragStartEvent extends AbstractEvent {
  static readonly type = 'dragstart';
  static readonly cancelable = true;

  constructor(
    readonly source: HTMLElement,
    readonly container: HTMLElement,
    readonly originalEvent: globalThis.DragEvent
  ) {
    super();
  }
}

export class DragEnterEvent extends AbstractEvent {
  static readonly type = 'dragenter';

  constructor(
    readonly source: HTMLElement,
    readonly enter: HTMLElement,
    readonly container: HTMLElement,
    readonly originalEvent: globalThis.DragEvent
  ) {
    super();
  }
}

export class DragOverEvent extends AbstractEvent {
  static readonly type = 'dragover';

  constructor(
    readonly source: HTMLElement,
    readonly over: HTMLElement,
    readonly container: HTMLElement,
    readonly originalEvent: globalThis.DragEvent
  ) {
    super();
  }
}

export class DragLeaveEvent extends AbstractEvent {
  static readonly type = 'dragleave';

  constructor(
    readonly source: HTMLElement,
    readonly leave: HTMLElement,
    readonly enter: HTMLElement | null,
    readonly container: HTMLElement,
    readonly originalEvent: globalThis.DragEvent
  ) {
    super();
  }
}

export class DropEvent extends AbstractEvent {
  static readonly type = 'drop';

  constructor(
    readonly source: HTMLElement,
    readonly dropzone: HTMLElement,
    readonly container: HTMLElement,
    readonly originalEvent: globalThis.DragEvent
  ) {
    super();
  }
}

export class DragEndEvent extends AbstractEvent {
  static readonly type = 'dragend';

  constructor(
    readonly source: HTMLElement,
    readonly over: HTMLElement | null,
    readonly container: HTMLElement,
    readonly originalEvent: globalThis.DragEvent
  ) {
    super();
  }
}
