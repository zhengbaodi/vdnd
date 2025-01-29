import AbstractEvent from '../AbstractEvent';

import type { DragMoveEvent, DragStartEvent, DragEndEvent } from '../DndEvent';

export class BaseMirrorEvent<
  E extends DragStartEvent | DragMoveEvent | DragEndEvent,
> extends AbstractEvent {
  constructor(
    public source: Element,
    public mirror: Element,
    public container: HTMLElement,
    public dndEvent: E
  ) {
    super();
  }
}

export class MirrorCreatedEvent extends BaseMirrorEvent<DragStartEvent> {
  static type = 'mirror:created';
}

export class MirrorAttachedEvent extends BaseMirrorEvent<DragStartEvent> {
  static type = 'mirror:attached';
}

export class MirrorMoveEvent extends BaseMirrorEvent<DragMoveEvent> {
  static type = 'mirror:move';
}

export class MirrorDetachedEvent extends BaseMirrorEvent<DragEndEvent> {
  static type = 'mirror:detached';
}
