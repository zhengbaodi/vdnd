import AbstractEvent from '../AbstractEvent';

export abstract class BaseSimulatorEvent extends AbstractEvent {
  constructor(
    public target: Element,
    public source: Element,
    public container: HTMLElement,
    public clientX: number,
    public clientY: number,
    public originalEvent: Event
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
