import { vi } from 'vitest';
import { DOMWrapper } from '@vue/test-utils';
import { triggerEvent } from './event';
import {
  DRAG_DELAY,
  defaultMouseEventOptions,
  defaultTouchEventOptions,
} from './constants';
import sleep from './sleep';

interface ElementWrapper<E extends Element = Element> {
  element: E;
  trigger(event: string, options?: Record<string, any>): Promise<void>;
}

function ensureElementWrapper<E extends Element = Element>(
  element: E | ElementWrapper<E>
): ElementWrapper<E> {
  if ('trigger' in element) {
    return element;
  }

  return {
    element,
    async trigger(event, options = {}) {
      triggerEvent(this.element, event, options);
    },
  };
}

type DragEventTarget = HTMLElement | ElementWrapper<HTMLElement>;

export abstract class DragSimulator {
  protected dragging = false;
  private _source: ElementWrapper<HTMLElement> | null = null;
  private _over: ElementWrapper<HTMLElement> | null = null;

  public set source(value: DragEventTarget | null) {
    this._source = value && ensureElementWrapper(value);
  }

  public set over(value: DragEventTarget | null) {
    this._over = value && ensureElementWrapper(value);
  }

  public get source(): ElementWrapper<HTMLElement> | null {
    return this._source;
  }

  public get over(): ElementWrapper<HTMLElement> | null {
    return this._over;
  }

  abstract dragstart(target: DragEventTarget): Promise<void>;
  abstract dragenter(target: DragEventTarget): Promise<void>;
  abstract dragleave(): Promise<void>;
  abstract dragend(droppable: boolean): Promise<void>;
  abstract esc(): Promise<void>;

  public reset() {
    this.dragging = false;
    this.source = null;
    this.over = null;
  }
}

export class MouseDragSimulator extends DragSimulator {
  async dragstart(target: DragEventTarget) {
    if (this.dragging) return;
    this.source = target;
    await this.source!.trigger('mousedown', defaultMouseEventOptions);
    await this.source!.trigger('mousemove', defaultMouseEventOptions);
    this.dragging = true;
  }

  async dragenter(enter: DragEventTarget) {
    if (!this.dragging) return;
    this.over = enter;
    await this.over!.trigger('mousemove', defaultMouseEventOptions);
  }

  async dragleave() {
    if (!this.dragging) return;
    const temp = document.createElement('div');
    document.body.appendChild(temp);
    await ensureElementWrapper(temp).trigger(
      'mousemove',
      defaultMouseEventOptions
    );
    document.body.removeChild(temp);
    this.over = null;
  }

  async dragend(_droppable: boolean) {
    if (!this.dragging) return;
    await this.source!.trigger('mouseup', defaultMouseEventOptions);
    this.reset();
  }

  async esc() {
    if (!this.dragging) return;
    const body = new DOMWrapper(document.body);
    await body.trigger('keydown', {
      code: 'Escape',
    });
    this.reset();
  }
}

const elementFromPoint = document.elementFromPoint;
function spyElementFromPoint(
  target: HTMLElement | ElementWrapper<HTMLElement>
) {
  document.elementFromPoint = () =>
    target instanceof HTMLElement ? target : target.element;
}
function restoreElementFromPoint() {
  document.elementFromPoint = elementFromPoint;
}

export class TouchDragSimulator extends DragSimulator {
  static DRAG_DELAY = DRAG_DELAY;
  static USE_FAKE_TIMERS = false;

  async dragstart(target: DragEventTarget) {
    if (this.dragging) return;
    this.source = target;
    await this.source!.trigger('touchstart', defaultTouchEventOptions);
    if (TouchDragSimulator.USE_FAKE_TIMERS) {
      vi.advanceTimersByTime(TouchDragSimulator.DRAG_DELAY);
    } else {
      await sleep(TouchDragSimulator.DRAG_DELAY);
    }
    spyElementFromPoint(this.source!);
    await this.source!.trigger('touchmove', defaultTouchEventOptions);
    restoreElementFromPoint();
    this.dragging = true;
  }

  async dragenter(enter: DragEventTarget) {
    if (!this.dragging) return;
    this.over = enter;
    spyElementFromPoint(this.over!);
    await this.over!.trigger('touchmove', defaultTouchEventOptions);
    restoreElementFromPoint();
  }

  async dragleave() {
    if (!this.dragging) return;
    const temp = document.createElement('div');
    document.body.appendChild(temp);
    spyElementFromPoint(temp);
    await ensureElementWrapper(temp).trigger(
      'touchmove',
      defaultTouchEventOptions
    );
    restoreElementFromPoint();
    document.body.removeChild(temp);
    this.over = null;
  }

  async dragend(_droppable: boolean) {
    if (!this.dragging) return;
    spyElementFromPoint(this.source!);
    await this.source!.trigger('touchend', defaultTouchEventOptions);
    restoreElementFromPoint();
    this.reset();
  }

  async esc() {
    this.reset();
  }
}

const DataTransfer =
  globalThis.DataTransfer ||
  class {
    setDragImage() {}
  };

export class NativeDragSimulator extends DragSimulator {
  static DRAG_EVENT_INTERVAL = 50;
  static DRAG_OVER_EVENT_INTERVAL = 50;

  private dragEventTimer: any = 0;
  private dragoverEventTimer: any = 0;

  private triggerDrag() {
    if (!this.dragging) return;
    this.source!.trigger('drag', {
      dataTransfer: new DataTransfer(),
    });
  }

  private triggerDragOver() {
    if (!this.dragging || !this.over) return;
    this.over!.trigger('dragover', {
      dataTransfer: new DataTransfer(),
    });
  }

  async dragstart(target: DragEventTarget) {
    if (this.dragging) return;
    this.source = target;
    await this.source!.trigger('dragstart', {
      dataTransfer: new DataTransfer(),
    });
    await this.source!.trigger('dragenter', {
      dataTransfer: new DataTransfer(),
    });
    this.over = this.source;
    this.dragEventTimer = setInterval(
      this.triggerDrag.bind(this),
      NativeDragSimulator.DRAG_EVENT_INTERVAL
    );
    this.dragoverEventTimer = setInterval(
      this.triggerDragOver.bind(this),
      NativeDragSimulator.DRAG_OVER_EVENT_INTERVAL
    );
    this.dragging = true;
  }

  async dragenter(target: DragEventTarget) {
    if (!this.dragging) return;
    const lastOver = this.over;
    this.over = target;
    await this.over!.trigger('dragenter', {
      dataTransfer: new DataTransfer(),
    });
    await lastOver?.trigger('dragleave', {
      dataTransfer: new DataTransfer(),
      relatedTarget: this.over!.element,
    });
  }

  async dragleave() {
    if (!this.dragging) return;
    await this.over?.trigger('dragleave', {
      dataTransfer: new DataTransfer(),
      relatedTarget: document.body,
    });
    this.over = null;
  }

  async dragend(droppable: boolean) {
    if (!this.dragging) return;
    if (droppable) {
      this.over?.trigger('drop', { dataTransfer: new DataTransfer() });
    } else {
      this.over?.trigger('dragleave', {
        dataTransfer: new DataTransfer(),
        relatedTarget: null,
      });
    }
    await this.source?.trigger('dragend', { dataTransfer: new DataTransfer() });
    this.reset();
  }

  async esc() {
    await this.dragend(false);
  }

  reset() {
    super.reset();
    clearInterval(this.dragEventTimer);
    clearInterval(this.dragoverEventTimer);
  }
}
