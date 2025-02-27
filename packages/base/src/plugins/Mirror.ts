import Plugin from './Plugin';
import {
  MirrorCreatedEvent,
  MirrorAttachedEvent,
  MirrorMoveEvent,
  MirrorDetachedEvent,
} from './MirrorEvent';
import { ensureArray } from '@vdnd/shared';

import type SimulatedDnd from '../SimulatedDnd';
import type { DragMoveEvent, DragStartEvent, DragEndEvent } from '../DndEvent';

export interface MirrorOptions {
  create?: (params: { source: Element; event: DragStartEvent }) => Node;

  /** Classes of the mirror, default is 'dnd-mirror'. */
  className?: string | string[];

  /**
   * Keeps the dimensions(width and height) of the mirror consistent with that of the current source,
   * default is false.
   */
  constrainDimensions?: boolean;

  /**
   * The implementation of cursorOffsetX refers to:
   * https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer/setDragImage
   */
  cursorOffsetX?: number;

  /**
   * The implementation of cursorOffsetY refers to:
   * https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer/setDragImage
   */
  cursorOffsetY?: number;

  appendTo?:
    | string
    | Node
    | ((params: { source: Element; event: DragStartEvent }) => Node);
}

const defaultMirrorCreator: MirrorOptions['create'] = (params) =>
  params.source.cloneNode(true);

const defaultMirrorAppendTo: MirrorOptions['appendTo'] = (params) => {
  return params.source.parentNode || document.body;
};

const defaultOptions: MirrorOptions = {
  className: 'dnd-mirror',
  create: defaultMirrorCreator,
  appendTo: defaultMirrorAppendTo,
  constrainDimensions: false,
};

/**
 * Mirror plugin which controls the mirror positioning while dragging
 */
export class Mirror extends Plugin {
  private readonly options: MirrorOptions;

  /**
   * Scroll offset for touch devices because the mirror is positioned fixed
   */
  private scrollOffset = {
    x: 0,
    y: 0,
  };

  /**
   * Initial scroll offset for touch devices because the mirror is positioned fixed
   */
  private initialScrollOffset = {
    x: window.scrollX,
    y: window.scrollY,
  };

  private lastMovedX = 0;
  private lastMovedY = 0;

  private mirrorOffset = {
    top: 0,
    left: 0,
  };

  private initialX = 0;
  private initialY = 0;

  private mirror: Element | null = null;

  constructor(dnd: SimulatedDnd) {
    super(dnd);

    this.options = {
      ...defaultOptions,
      ...this.getOptions(),
    };
  }

  attach() {
    this.dnd
      .on('drag:start', this.onDragStart)
      .on('drag:move', this.onDragMove)
      .on('drag:end', this.onDragEnd)
      .on('mirror:created', this.onMirrorCreated)
      .on('mirror:move', this.onMirrorMove);
  }

  detach() {
    this.dnd
      .off('drag:start', this.onDragStart)
      .off('drag:move', this.onDragMove)
      .off('drag:end', this.onDragEnd)
      .off('mirror:created', this.onMirrorCreated)
      .off('mirror:move', this.onMirrorMove);
  }

  /**
   * Returns options passed through draggable
   */
  private getOptions() {
    return this.dnd.options.mirror || {};
  }

  private onDragStart = async (dragEvent: DragStartEvent) => {
    if ('ontouchstart' in window) {
      document.addEventListener('scroll', this.onScroll, true);
    }

    this.initialScrollOffset = {
      x: window.scrollX,
      y: window.scrollY,
    };

    const { source, container } = dragEvent;

    const appendableContainer =
      this.getAppendableContainer({ source, event: dragEvent }) ||
      document.body;
    const createMirror = this.options.create!;
    this.mirror = createMirror({ source, event: dragEvent }) as Element;
    const mirrorCreatedEvent = new MirrorCreatedEvent(
      source,
      this.mirror,
      container,
      dragEvent
    );
    this.dnd.emit('mirror:created', mirrorCreatedEvent);

    const mirrorAttachedEvent = new MirrorAttachedEvent(
      source,
      this.mirror,
      container,
      dragEvent
    );
    appendableContainer.appendChild(this.mirror);
    this.dnd.emit('mirror:attached', mirrorAttachedEvent);
  };

  private onDragMove = (dragEvent: DragMoveEvent) => {
    if (!this.mirror) {
      return;
    }
    const { source, container } = dragEvent;
    const mirrorMoveEvent = new MirrorMoveEvent(
      source,
      this.mirror,
      container,
      dragEvent
    );

    this.dnd.emit('mirror:move', mirrorMoveEvent);
  };

  private onDragEnd = (dragEvent: DragEndEvent) => {
    if ('ontouchstart' in window) {
      document.removeEventListener('scroll', this.onScroll, true);
    }

    this.initialScrollOffset = { x: 0, y: 0 };
    this.scrollOffset = { x: 0, y: 0 };

    if (!this.mirror) {
      return;
    }

    const { source, container } = dragEvent;
    const mirrorDetachedEvent = new MirrorDetachedEvent(
      source,
      this.mirror,
      container,
      dragEvent
    );
    this.mirror.remove();
    this.dnd.emit('mirror:detached', mirrorDetachedEvent);
  };

  private onScroll = () => {
    this.scrollOffset = {
      x: window.scrollX - this.initialScrollOffset.x,
      y: window.scrollY - this.initialScrollOffset.y,
    };
  };

  private onMirrorCreated = (event: MirrorCreatedEvent) => {
    const { mirror, source, dndEvent: dragEvent } = event;

    const mirrorClasses = ensureArray(this.options.className || '');

    const setState = ({ mirrorOffset, initialX, initialY, ...args }) => {
      this.mirrorOffset = mirrorOffset;
      this.initialX = initialX;
      this.initialY = initialY;
      this.lastMovedX = initialX;
      this.lastMovedY = initialY;
      return { mirrorOffset, initialX, initialY, ...args };
    };

    if ('style' in mirror && typeof mirror.style === 'object') {
      (mirror as unknown as ElementCSSInlineStyle).style.display = 'none';
    }

    const initialState: Partial<InitialState> = {
      mirror,
      source,
      dragEvent,
      mirrorClasses,
      scrollOffset: this.scrollOffset,
      options: this.options,
    };

    Promise.resolve(initialState)
      // Fix reflow here
      .then<any>(computeMirrorDimensions)
      .then<any>(calculateMirrorOffset)
      .then<any>(resetMirror)
      .then<any>(addMirrorClasses)
      .then<any>(positionMirror({ initial: true }))
      .then<any>(removeMirrorID)
      .then<any>(setState);
  };

  private onMirrorMove = (event: MirrorMoveEvent) => {
    const setState = ({ lastMovedX, lastMovedY, ...args }) => {
      this.lastMovedX = lastMovedX;
      this.lastMovedY = lastMovedY;

      return { lastMovedX, lastMovedY, ...args };
    };

    const initialState: Partial<InitialState> = {
      mirror: event.mirror,
      dragEvent: event.dndEvent,
      mirrorOffset: this.mirrorOffset,
      options: this.options,
      initialX: this.initialX,
      initialY: this.initialY,
      scrollOffset: this.scrollOffset,
      lastMovedX: this.lastMovedX,
      lastMovedY: this.lastMovedY,
    };

    return Promise.resolve<any>(initialState)
      .then<any>(positionMirror({ raf: true }))
      .then<any>(setState);
  };

  /**
   * Returns appendable container for mirror based on the appendTo option
   */
  private getAppendableContainer({ source, event }) {
    const appendTo = this.options.appendTo;

    if (typeof appendTo === 'string') {
      return document.querySelector(appendTo);
    } else if (appendTo instanceof HTMLElement) {
      return appendTo;
    } else if (typeof appendTo === 'function') {
      return appendTo({ source, event });
    } else {
      return source.parentNode;
    }
  }
}

/**
 * Computes mirror dimensions based on the source element
 * Adds sourceRect to state
 * @param {Object} state
 * @param {HTMLElement} state.source
 */
function computeMirrorDimensions(state: Partial<InitialState>) {
  const { source, ...args } = state;
  return withPromise((resolve) => {
    const sourceRect = source!.getBoundingClientRect();
    resolve({ source, sourceRect, ...args });
  });
}

/**
 * Calculates mirror offset
 * Adds mirrorOffset to state
 */
function calculateMirrorOffset({ dragEvent, sourceRect, options, ...args }) {
  return withPromise((resolve) => {
    const top =
      typeof options.cursorOffsetY !== 'number'
        ? dragEvent.clientY - sourceRect.top
        : options.cursorOffsetY;
    const left =
      typeof options.cursorOffsetX !== 'number'
        ? dragEvent.clientX - sourceRect.left
        : options.cursorOffsetX;

    const mirrorOffset = { top, left };

    resolve({ dragEvent, sourceRect, mirrorOffset, options, ...args });
  });
}

/**
 * Applys mirror styles
 * @param {Object} state
 * @param {HTMLElement} state.mirror
 * @param {HTMLElement} state.source
 * @param {Object} state.options
 */
function resetMirror({ mirror, source, options, ...args }) {
  return withPromise((resolve) => {
    let offsetHeight;
    let offsetWidth;

    if (options.constrainDimensions) {
      const computedSourceStyles = getComputedStyle(source);
      offsetHeight = computedSourceStyles.getPropertyValue('height');
      offsetWidth = computedSourceStyles.getPropertyValue('width');
    }

    mirror.style.display = null;
    mirror.style.position = 'fixed';
    mirror.style.pointerEvents = 'none';
    mirror.style.top = 0;
    mirror.style.left = 0;
    mirror.style.margin = 0;

    if (options.constrainDimensions) {
      mirror.style.height = offsetHeight;
      mirror.style.width = offsetWidth;
    }

    resolve({ mirror, source, options, ...args });
  });
}

/**
 * Applys mirror class on mirror element
 * @param {Object} state
 * @param {HTMLElement} state.mirror
 * @param {String[]} state.mirrorClasses
 */
function addMirrorClasses({ mirror, mirrorClasses, ...args }) {
  return withPromise((resolve) => {
    mirror.classList.add(...mirrorClasses);
    resolve({ mirror, mirrorClasses, ...args });
  });
}

/**
 * Removes source ID from cloned mirror element
 * @param {Object} state
 * @param {HTMLElement} state.mirror
 */
function removeMirrorID({ mirror, source, ...args }) {
  return withPromise((resolve) => {
    if (source.getAttribute('id') === mirror.getAttribute('id')) {
      mirror.removeAttribute('id');
      delete mirror.id;
    }
    resolve({ mirror, ...args });
  });
}

interface InitialState {
  raf: boolean;
  initial: boolean;
  mirror: Element;
  source: Element;
  mirrorClasses: string[];
  dragEvent: DragStartEvent | DragMoveEvent;
  mirrorOffset: {
    top: number;
    left: number;
  };
  options: MirrorOptions;
  initialX: number;
  initialY: number;
  scrollOffset: {
    x: number;
    y: number;
  };
  lastMovedX: number;
  lastMovedY: number;
}

/**
 * Positions mirror with translate3d
 */
function positionMirror(state: Partial<InitialState>) {
  const { raf = false, initial = false } = state;
  return ({
    mirror,
    dragEvent,
    mirrorOffset,
    initialY,
    initialX,
    scrollOffset,
    options,
    lastMovedX,
    lastMovedY,
    ...args
  }) => {
    return withPromise(
      (resolve) => {
        const result = {
          mirror,
          dragEvent,
          mirrorOffset,
          options,
          ...args,
        };

        if (mirrorOffset) {
          const x = Math.round(
            dragEvent.clientX - mirrorOffset.left - scrollOffset.x
          );
          const y = Math.round(
            dragEvent.clientY - mirrorOffset.top - scrollOffset.y
          );
          mirror.style.transform = `translate3d(${x}px, ${y}px, 0)`;

          if (initial) {
            // @ts-expect-error
            result.initialX = x;
            // @ts-expect-error
            result.initialY = y;
          }
          // @ts-expect-error
          result.lastMovedX = x;
          // @ts-expect-error
          result.lastMovedY = y;
        }

        resolve(result);
      },
      { raf }
    );
  };
}

/**
 * Wraps functions in promise with potential animation frame option
 */
function withPromise(callback, { raf = false } = {}) {
  return new Promise((resolve, reject) => {
    if (raf) {
      requestAnimationFrame(() => {
        callback(resolve, reject);
      });
    } else {
      callback(resolve, reject);
    }
  });
}
