import Simulator from './Simulator';
import {
  DragStartSimulatorEvent,
  DragMoveSimulatorEvent,
  DragEndSimulatorEvent,
} from './SimulatorEvent';

function touchCoords(event: TouchEvent) {
  const { touches, changedTouches } = event;
  return (touches && touches[0]) || (changedTouches && changedTouches[0]);
}

/**
 * Prevents scrolling when set to true
 */
let preventScrolling = false;

// WebKit requires cancelable `touchmove` events to be added as early as possible
window.addEventListener(
  'touchmove',
  (event) => {
    if (!preventScrolling) {
      return;
    }

    // Prevent scrolling
    event.preventDefault();
  },
  { passive: false }
);

/**
 * This simulator picks up native browser touch events and dictates drag operations
 */
export default class TouchSimulator extends Simulator<TouchEvent> {
  private onTouchStartAt = 0;

  attach() {
    this.env.addEventListener('touchstart', this.onTouchStart);
    return this;
  }

  detach() {
    this.env.removeEventListener('touchstart', this.onTouchStart);
    this.cancel();
    return this;
  }

  private get delay() {
    return this.options.delay ?? 100;
  }

  /**
   * Touch start handler
   */
  private onTouchStart = (event: TouchEvent) => {
    if (this.dragging || !(event.target instanceof Element)) return;
    const source = this.getSource(event);
    if (source) {
      this.source = source;
      this.startEvent = event;
      this.onTouchStartAt = Date.now();
      this.env.addEventListener('touchend', this.onTouchEnd);
      this.env.addEventListener('touchcancel', this.onTouchEnd);
      this.env.addEventListener('touchmove', this.checkElapsedTime);
      this.env.addEventListener('contextmenu', onContextMenu);
    }
  };

  /**
   * Start the drag
   */
  private startDrag = () => {
    const touch = touchCoords(this.startEvent!);
    const dragStartEvent = new DragStartSimulatorEvent(
      this.startEvent!.target as Element,
      this.source!,
      this.container,
      touch.pageX,
      touch.pageY,
      this.startEvent!
    );
    this.onDragStrat(dragStartEvent);
    if (dragStartEvent.canceled()) {
      this.cancel();
    } else {
      preventScrolling = true;
      this.env.addEventListener('touchmove', this.onTouchMove);
    }
  };

  private checkElapsedTime = () => {
    this.env.removeEventListener('touchmove', this.checkElapsedTime);
    const timeElapsed = Date.now() - this.onTouchStartAt;
    if (timeElapsed >= this.delay) {
      this.startDrag();
    }
  };

  private onTouchMove = (event: TouchEvent) => {
    const { pageX, pageY } = touchCoords(event);
    const target = document.elementFromPoint(
      pageX - window.scrollX,
      pageY - window.scrollY
    );
    if (!target) return;
    const dragMoveEvent = new DragMoveSimulatorEvent(
      target,
      this.source!,
      this.container,
      pageX,
      pageY,
      event
    );
    this.onDragMove(dragMoveEvent);
  };

  private onTouchEnd = (event: TouchEvent) => {
    const { source } = this;
    this.cancel();
    if (source) {
      event.preventDefault();
      const { pageX, pageY } = touchCoords(event);
      const target = document.elementFromPoint(
        pageX - window.scrollX,
        pageY - window.scrollY
      );
      if (!target) return;
      const dragEndEvent = new DragEndSimulatorEvent(
        target,
        source!,
        this.container,
        pageX,
        pageY,
        event
      );
      this.onDragEnd(dragEndEvent);
    }
  };

  cancel() {
    preventScrolling = false;
    this.source = null;
    this.env.removeEventListener('touchend', this.onTouchEnd);
    this.env.removeEventListener('touchcancel', this.onTouchEnd);
    this.env.removeEventListener('touchmove', this.checkElapsedTime);
    this.env.removeEventListener('contextmenu', onContextMenu);
    this.env.removeEventListener('touchmove', this.onTouchMove);
  }
}

function onContextMenu(event: Event) {
  event.preventDefault();
  event.stopPropagation();
}
