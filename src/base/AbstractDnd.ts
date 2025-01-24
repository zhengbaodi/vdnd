import {
  DragEvent,
  DragStartEvent,
  DragOverEvent,
  DragLeaveEvent,
  DragEnterEvent,
  DragEndEvent,
  DragPreventEvent,
  DropEvent,
} from './DndEvent';
import { Emitter } from '@shared/Emitter';

export interface AbstractDndOptions {
  source: string;
  dropzone: string;
  handle?: string;
  isDraggable?: (source: Element) => boolean;
  isDroppable?: (dropzone: Element) => boolean;
}

export type AbstractDndEventTable = {
  drag: DragEvent;
  'drag:start': DragStartEvent;
  'drag:prevent': DragPreventEvent;
  'drag:enter': DragEnterEvent;
  'drag:over': DragOverEvent;
  'drag:leave': DragLeaveEvent;
  'drag:end': DragEndEvent;
  drop: DropEvent;
};

export default abstract class AbstractDnd<
  T extends AbstractDndEventTable = AbstractDndEventTable,
> extends Emitter<T> {
  protected source: Element | null = null;
  protected currentOver: Element | null = null;

  constructor(
    protected container: HTMLElement,
    /** @readonly */
    public readonly options: AbstractDndOptions
  ) {
    super();
  }

  /** 该函数并不会校验source是否真的为source */
  protected isDraggable(source: Element) {
    return this.options.isDraggable?.(source) ?? true;
  }

  /** 该函数并不会校验dropzone是否真的为dropzone */
  protected isDroppable(dropzone: Element) {
    return this.options.isDroppable?.(dropzone) ?? true;
  }

  protected get dragging() {
    return this.source !== null;
  }

  isDragging(target?: Element) {
    if (!this.dragging) return false;
    return target ? this.source === target : this.dragging;
  }
}
