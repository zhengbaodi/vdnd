import Simulator from './Simulator';
import {
  DragStartSimulatorEvent,
  DragMoveSimulatorEvent,
  DragEndSimulatorEvent,
} from './SimulatorEvent';

/**
 * This simulator picks up native browser mouse events and dictates drag operations
 */
export default class MouseSimulator extends Simulator<MouseEvent> {
  attach() {
    this.env.addEventListener('mousedown', this.onMouseDown, true);
    return this;
  }

  detach() {
    this.env.removeEventListener('mousedown', this.onMouseDown, true);
    this.cancel();
    return this;
  }

  private onMouseDown = (event: MouseEvent) => {
    if (event.button !== 0 || event.altKey || this.dragging) {
      return;
    }
    const source = this.getSource(event);
    if (source) {
      this.source = source;
      this.startEvent = event;
      this.env.addEventListener('mouseup', this.onMouseUp);
      this.env.addEventListener('dragstart', preventNativeDragStart);
      this.env.addEventListener('mousemove', this.onFirstMouseMove);
    }
  };

  private startDrag() {
    const dragStartEvent = new DragStartSimulatorEvent(
      this.startEvent!.target as Element,
      this.source!,
      this.container,
      this.startEvent!.clientX,
      this.startEvent!.clientY,
      this.startEvent!!
    );

    this.onDragStrat(dragStartEvent);

    if (!dragStartEvent.canceled()) {
      this.env.addEventListener('keydown', this.onKeyDown);
      this.env.addEventListener(
        'contextmenu',
        this.onContextMenuWhileDragging,
        true
      );
      this.env.addEventListener('mousemove', this.onMouseMove);
    } else {
      this.cancel();
    }
  }

  private onKeyDown = (event: KeyboardEvent) => {
    if (
      this.dragging &&
      event.target &&
      !event.isComposing &&
      event.code?.toLowerCase() === 'escape'
    ) {
      const { source, container } = this;
      this.cancel();
      this.onDragEnd(
        new DragEndSimulatorEvent(
          event.target as Element,
          source!,
          container,
          0,
          0,
          event
        )
      );
    }
  };

  private onFirstMouseMove = () => {
    this.env.removeEventListener('mousemove', this.onFirstMouseMove);
    this.startDrag();
  };

  private onMouseMove = (event: MouseEvent) => {
    if (!(event.target instanceof Element)) return;
    const dragMoveEvent = new DragMoveSimulatorEvent(
      event.target,
      this.source!,
      this.container,
      event.clientX,
      event.clientY,
      event
    );
    this.onDragMove(dragMoveEvent);
  };

  private onMouseUp = (event: MouseEvent) => {
    if (event.button !== 0 || !(event.target instanceof Element)) {
      return;
    }

    const { source } = this;
    this.cancel();
    if (source) {
      const dragEndEvent = new DragEndSimulatorEvent(
        event.target,
        source!,
        this.container,
        event.clientX,
        event.clientY,
        event
      );

      this.onDragEnd(dragEndEvent);
    }
  };

  cancel() {
    this.source = null;
    this.startEvent = null;
    this.env.removeEventListener('mouseup', this.onMouseUp);
    this.env.removeEventListener('dragstart', preventNativeDragStart);
    this.env.removeEventListener('mousemove', this.onFirstMouseMove);
    this.env.removeEventListener('keydown', this.onKeyDown);
    this.env.removeEventListener(
      'contextmenu',
      this.onContextMenuWhileDragging,
      true
    );
    this.env.removeEventListener('mousemove', this.onMouseMove);
  }

  private onContextMenuWhileDragging = (event: Event) => {
    event.preventDefault();
  };
}

function preventNativeDragStart(event: Event) {
  event.preventDefault();
}
