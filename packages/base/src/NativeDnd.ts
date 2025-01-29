import AbstractDnd from './AbstractDnd';
import {
  DragEvent,
  DragEndEvent,
  DragEnterEvent,
  DragLeaveEvent,
  DragOverEvent,
  DragStartEvent,
  DragPreventEvent,
  DropEvent,
} from './DndEvent';
import { findHandles } from './simulators';
import closest from './closest';

import type { AbstractDndOptions } from './AbstractDnd';

type NativeDragEvent = globalThis.DragEvent;

function checkHandleIsDraggable(handle: Element, host: Element /** source */) {
  let base = handle;
  while (base !== host && !(base as any).draggable) {
    if (!base.parentElement) {
      break;
    }
    base = base.parentElement;
  }
  return base !== host;
}

export interface NativeDndOptions extends AbstractDndOptions {}

function correctPreDropEffect(dataTransfer: DataTransfer, droppable: boolean) {
  if (droppable) {
    dataTransfer.dropEffect = getEffectiveDropEffect(
      dataTransfer.effectAllowed
    );
  } else {
    dataTransfer.dropEffect = 'none';
  }
}

function correctPostDropEffect(dataTransfer: DataTransfer, droppable: boolean) {
  if (droppable) {
    if (dataTransfer.dropEffect === 'none') {
      dataTransfer.dropEffect = getEffectiveDropEffect(
        dataTransfer.effectAllowed
      );
      console.warn(
        "[vdnd warn]: Do you set the 'dataTransfer.dropEffect' to 'none'? " +
          "The 'dataTransfer.dropEffect' for a droppable dropzone must not be 'none', " +
          "vdnd will force it to be set to not 'none'."
      );
    }
  } else {
    if (dataTransfer.dropEffect !== 'none') {
      dataTransfer.dropEffect = 'none';
      console.warn(
        "[vdnd warn]: Do you set the 'dataTransfer.dropEffect' to not 'none'? " +
          "The 'dataTransfer.dropEffect' for a not droppable dropzone must be 'none', " +
          "vdnd will force it to be set to 'none'."
      );
    }
  }
}

export default class NativeDnd extends AbstractDnd {
  private shouldSkipDragLeaveHandler = false;
  private temporaryPreviousOver: Element | null = null;
  private temporaryLeave: Element | null = null;
  // source or handle
  private trigger: Element | null = null;

  constructor(
    protected container: HTMLElement,
    /** @readonly */
    public readonly options: NativeDndOptions
  ) {
    super(container, options);
    document.addEventListener('drag', this.onDrag);
    document.addEventListener('dragstart', this.onDragStart);
    document.addEventListener('dragenter', this.onDragEnter);
    document.addEventListener('dragover', this.onDragOver);
    document.addEventListener('dragleave', this.onDragLeave);
    document.addEventListener('dragend', this.onDragEnd);
    document.addEventListener('drop', this.onDrop);
  }

  destroy() {
    if (this.dragging) return;
    document.removeEventListener('drag', this.onDrag);
    document.removeEventListener('dragstart', this.onDragStart);
    document.removeEventListener('dragenter', this.onDragEnter);
    document.removeEventListener('dragover', this.onDragOver);
    document.removeEventListener('dragleave', this.onDragLeave);
    document.removeEventListener('dragend', this.onDragEnd);
    document.removeEventListener('drop', this.onDrop);
    super.destroy();
  }

  private onDrag = (e: NativeDragEvent) => {
    if (
      !this.dragging ||
      !(e.target instanceof Element) ||
      !e.dataTransfer ||
      !closest(e.target, this.trigger!)
    )
      return;

    const event = new DragEvent(
      this.source!,
      this.currentOver,
      this.container,
      e
    );
    this.emit('drag', event);
  };

  private onDragStart = (e: NativeDragEvent) => {
    if (this.dragging || !e.dataTransfer) return;

    // only HTMLElement is draggable
    if (!closest(e.target as HTMLElement, this.container)) return null;
    const source = closest(e.target as HTMLElement, this.options.source);
    if (!source) return;

    let handles: Element[] = [];
    let currentHandle: Element | undefined;
    if (this.options.handle) {
      handles = findHandles(source, {
        isSource: (element) => element.classList.contains(this.options.source),
        isHandle: (element) => element.classList.contains(this.options.handle!),
      });
      if (handles.length) {
        currentHandle = handles.find(
          (handle) => !!closest(e.target as HTMLElement, handle)
        );
        if (!currentHandle) {
          e.preventDefault();
          return;
        } else {
          if (!checkHandleIsDraggable(currentHandle, source)) {
            console.error(
              '[vdnd error]: NativeDnd requires the handle must be draggable, the illegal handle is ',
              currentHandle
            );
            return;
          }
        }
      }
    }

    if (!this.isDraggable(source)) {
      e.preventDefault();
      const dragPreventEvent = new DragPreventEvent(source, this.container, e);
      this.emit('drag:prevent', dragPreventEvent);
      return;
    }

    this.source = source;
    this.trigger = currentHandle || source;
    if (currentHandle && e.dataTransfer) {
      const { top, left } = this.source.getBoundingClientRect();
      e.dataTransfer.setDragImage(
        this.source,
        e.clientX - left,
        e.clientY - top
      );
    }
    const dragStartEvent = new DragStartEvent(source, this.container!, e);
    this.emit('drag:start', dragStartEvent);
  };

  private onDragEnter = (e: NativeDragEvent) => {
    if (!this.dragging || !(e.target instanceof Element) || !e.dataTransfer)
      return;

    const dropzone =
      closest(e.target, this.container) &&
      closest(e.target, this.options.dropzone);
    if (!dropzone) {
      return;
    }

    e.preventDefault();
    correctPreDropEffect(e.dataTransfer, this.isDroppable(dropzone));

    this.temporaryLeave = null;
    if (dropzone === this.currentOver) {
      this.shouldSkipDragLeaveHandler = true;
      return;
    }

    this.temporaryPreviousOver = this.currentOver;
    this.currentOver = dropzone;

    const dragEnterEvent = new DragEnterEvent(
      this.source!,
      dropzone,
      this.container,
      e
    );
    this.emit('drag:enter', dragEnterEvent);
    correctPostDropEffect(e.dataTransfer, this.isDroppable(dropzone));
  };

  private onDragLeave = (e: NativeDragEvent) => {
    if (
      !this.dragging ||
      this.shouldSkipDragLeaveHandler ||
      !e.dataTransfer ||
      (e.target !== this.temporaryPreviousOver && e.target !== this.currentOver)
    ) {
      this.shouldSkipDragLeaveHandler = false;
      return;
    }

    this.shouldSkipDragLeaveHandler = false;
    const leave = this.temporaryPreviousOver || this.currentOver;
    this.temporaryPreviousOver = null;

    // Established when the following conditions are met:
    // 1、terminates interaction by pressing 'esc'.
    // 2、ends iteraction by releasing the mouse and dataTranser.dropEffect is 'none'
    //  —— this means the current drop target is not droppable.
    if (e.relatedTarget === null) {
      this.temporaryLeave = leave;
    }

    if (leave === this.currentOver) {
      this.currentOver = null;
    }

    const event = new DragLeaveEvent(this.source!, leave!, this.container, e);
    this.emit('drag:leave', event);
  };

  private onDragOver = (e: NativeDragEvent) => {
    if (
      !this.dragging ||
      !this.currentOver ||
      !(e.target instanceof Element) ||
      !e.dataTransfer ||
      !closest(e.target, this.currentOver)
    )
      return;

    const droppable = this.isDroppable(this.currentOver);
    if (droppable) {
      e.preventDefault();
    }
    correctPreDropEffect(e.dataTransfer, droppable);
    const event = new DragOverEvent(
      this.source!,
      this.currentOver!,
      this.container,
      e
    );
    this.emit('drag:over', event);
    correctPostDropEffect(e.dataTransfer, this.isDroppable(this.currentOver));
  };

  private onDrop = (e: NativeDragEvent) => {
    if (
      !this.dragging ||
      !this.currentOver ||
      !(e.target instanceof Element) ||
      !e.dataTransfer ||
      !closest(e.target, this.currentOver) ||
      !this.isDroppable(this.currentOver)
    ) {
      return;
    }

    const dropEvent = new DropEvent(
      this.source!,
      this.currentOver,
      this.container,
      e
    );
    this.emit('drop', dropEvent);
  };

  private onDragEnd = (e: NativeDragEvent) => {
    if (
      !this.dragging ||
      !(e.target instanceof Element) ||
      !e.dataTransfer ||
      !closest(e.target, this.trigger!)
    )
      return;

    const dragEndEvent = new DragEndEvent(
      this.source!,
      this.currentOver || this.temporaryLeave,
      this.container,
      e
    );

    this.emit('drag:end', dragEndEvent);

    this.trigger = null;
    this.source = null;
    this.currentOver = null;
    this.temporaryPreviousOver = null;
    this.temporaryLeave = null;
    this.shouldSkipDragLeaveHandler = false;
  };
}

function getEffectiveDropEffect(
  effectAllowed: DataTransfer['effectAllowed']
): Exclude<DataTransfer['dropEffect'], 'none'> {
  switch (effectAllowed) {
    case 'all':
    case 'copy':
    case 'none':
    case 'copyLink':
    case 'copyMove':
    case 'uninitialized':
      return 'copy';
    case 'link':
    case 'linkMove':
      return 'link';
    case 'move':
      return 'move';
  }
}
