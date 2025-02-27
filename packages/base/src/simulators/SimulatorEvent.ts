import AbstractEvent from '../AbstractEvent';

export abstract class BaseSimulatorEvent extends AbstractEvent {
  constructor(
    public readonly target: Element,
    public readonly source: Element,
    public readonly container: HTMLElement,
    public readonly clientX: number,
    public readonly clientY: number,
    public readonly originalEvent: Event
  ) {
    super();
  }
}

export class DragStartSimulatorEvent extends BaseSimulatorEvent {
  static type = 'drag:start';
  static cancelable = true;
}

export class DragMoveSimulatorEvent extends BaseSimulatorEvent {
  static type = 'drag:move';
}

export class DragEndSimulatorEvent extends BaseSimulatorEvent {
  static type = 'drag:end';
}
