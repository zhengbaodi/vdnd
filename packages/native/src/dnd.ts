import {
  DragEvent,
  DragEndEvent,
  DragEnterEvent,
  DragLeaveEvent,
  DragOverEvent,
  DragStartEvent,
  DropEvent,
} from './events';
import { closest } from './closest';
import { Emitter } from './emitter';

function isTextControl(target: unknown) {
  return (
    target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement
  );
}

/**
 * Finds all handles directly belonging to the target source.
 *
 * Sources may be nested within each other,
 * but handles within inner sources should not affect outer sources.
 *
 * @returns Handles that satisfy the assertion, excluding handles within inner sources.
 */
export function findHandlesIn(
  source: Element,
  isSource: (element: Element) => boolean,
  isHandle: (element: Element) => boolean
): HTMLElement[] {
  const handles: HTMLElement[] = [];
  for (let i = 0, element: Element; i < source.children.length; i++) {
    element = source.children.item(i)!;
    if (isSource(element)) continue;
    if (isHandle(element) && element instanceof HTMLElement) {
      handles.push(element);
      continue;
    }
    handles.push(...findHandlesIn(element, isSource, isHandle));
  }
  return handles;
}

type NativeDndEventTable = {
  drag: DragEvent;
  dragstart: DragStartEvent;
  dragenter: DragEnterEvent;
  dragover: DragOverEvent;
  dragleave: DragLeaveEvent;
  drop: DropEvent;
  dragend: DragEndEvent;
};

export type NativeDndOptions = {
  source: string;
  dropzone: string;
  handle?: string;
  // NativeDnd determines whether an element is a source or dropzone based on its class name,
  // and the upper layer of NativeDnd may create a source and dropzone in a specific way, such as a Vue component,
  // which may cause an element to be recognized as a source in NativeDnd but not created in the upper layer.
  // Therefore, NativeDnd provides these two assertion functions.
  // If the source and dropzone are not created in the upper layer, NativeDnd will not perform additional operations,
  // but will still emit events for the upper layer to handle this situation, such as warning the user.
  isRecognizedSource?: (source: HTMLElement) => boolean;
  isRecognizedDropzone?: (dropzone: HTMLElement) => boolean;
};

const returnTrue = () => true;

export class NativeDnd extends Emitter<NativeDndEventTable> {
  private _currentSource: HTMLElement | null = null;
  private _currentTarget: HTMLElement | null = null;
  private readonly isRecognizedSource: NonNullable<
    NativeDndOptions['isRecognizedSource']
  >;
  private readonly isRecognizedDropzone: NonNullable<
    NativeDndOptions['isRecognizedDropzone']
  >;

  constructor(
    readonly container: HTMLElement,
    readonly options: NativeDndOptions
  ) {
    super();
    this.isRecognizedSource = this.options.isRecognizedSource || returnTrue;
    this.isRecognizedDropzone = this.options.isRecognizedDropzone || returnTrue;
    document.addEventListener('drag', this.onDrag);
    document.addEventListener('dragstart', this.onDragStart);
    // We need to capture the movement of the mouse leaving the container, therefore,
    document.addEventListener('dragenter', this.onDragEnter);
    // Instead of this.container.addEventListener.
    document.addEventListener('dragover', this.onDragOver);
    document.addEventListener('dragleave', this.onDragLeave);
    document.addEventListener('drop', this.onDrop);
    document.addEventListener('dragend', this.onDragEnd);
  }

  get dragging() {
    return this._currentSource !== null;
  }

  get currentSource() {
    return this._currentSource;
  }

  get currentTarget() {
    return this._currentTarget;
  }

  destroy() {
    if (this.dragging) {
      console.warn(
        '[vdnd warn]: If you destroy an instance during the drag-and-drop operation, unexpected behavior may occur.'
      );
    }
    document.removeEventListener('drag', this.onDrag);
    document.removeEventListener('dragstart', this.onDragStart);
    document.removeEventListener('dragenter', this.onDragEnter);
    document.removeEventListener('dragover', this.onDragOver);
    document.removeEventListener('dragleave', this.onDragLeave);
    document.removeEventListener('drop', this.onDrop);
    document.removeEventListener('dragend', this.onDragEnd);
    super.destroy();
  }

  private onDrag = (e: globalThis.DragEvent) => {
    if (!e.isTrusted || !this.dragging) return;
    this.emit(
      'drag',
      new DragEvent(
        this._currentSource!,
        this._currentTarget,
        this.container,
        e
      )
    );
  };

  private onDragStart = (e: globalThis.DragEvent) => {
    if (!e.isTrusted) return;
    const target = e.target as HTMLElement; // Only HTMLElement can be dragged.
    if (!closest(target, this.container)) return;

    const source = closest(target, this.options.source) as HTMLElement | null;
    if (!source) return;

    const isActiveInput =
      isTextControl(target) && target === document.activeElement;
    // <img />, <a />, <div draggable="true" />
    const isDraggableDescendant = target !== source && target.draggable;

    let handle: HTMLElement | undefined;
    if (this.isRecognizedSource(source) && this.options.handle) {
      const handles = findHandlesIn(
        source,
        (element) => element.classList.contains(this.options.source),
        (element) => element.classList.contains(this.options.handle!)
      );
      const draggableHandles: HTMLElement[] = [];
      for (const handle of handles) {
        if (!handle.draggable) {
          console.warn(
            '[vdnd warn]: The handle(%o) must be draggable, otherwise, it will not function as expected.',
            handle
          );
          continue;
        }
        draggableHandles.push(handle);
      }
      if (draggableHandles.length) {
        handle = draggableHandles.find((handle) => !!closest(target, handle));
        if (!handle) {
          if (!isActiveInput && !isDraggableDescendant) {
            e.preventDefault();
          }
          return;
        }
      }
    }

    this._currentSource = source;

    if (target !== source) {
      const { top, left } = source.getBoundingClientRect();
      e.dataTransfer!.setDragImage(source, e.clientX - left, e.clientY - top);
    }

    const dragStartEvent = new DragStartEvent(source, this.container, e);
    this.emit('dragstart', dragStartEvent);
    if (dragStartEvent.canceled()) {
      if (!isActiveInput && !isDraggableDescendant) {
        e.preventDefault();
      } else if (isDraggableDescendant) {
        // Restore the default drag image.
        const { top, left } = target.getBoundingClientRect();
        e.dataTransfer!.setDragImage(target, e.clientX - left, e.clientY - top);
      } else {
        // Restore the default drag image.
        const { top, left } = target.getBoundingClientRect();
        e.dataTransfer!.setDragImage(
          // If the target element is not inserted into the document,
          // the browser will use the current text selection as the drag image.
          document.createElement('span'),
          e.clientX - left,
          e.clientY - top
        );
      }
      this._currentSource = null;
    }
  };

  private onDragEnter = (e: globalThis.DragEvent) => {
    if (!e.isTrusted || !this.dragging) return;
    const target = e.target as Element;
    // Mouse leaves the container.
    if (!closest(target, this.container)) {
      this._currentTarget = null;
      return;
    }

    // Mouse is still in the container.
    const enter = closest(target, this.options.dropzone);
    if (!enter || !(enter instanceof HTMLElement)) {
      this._currentTarget = null;
      if (enter) {
        // We don't need to warn again in the dragleave handler.
        console.warn(
          '[vdnd warn]: MathMLElement and SvgElement are not supported as the dropzone.'
        );
        console.warn('[vdnd warn]: %o', enter);
      }
      return;
    }

    // https://html.spec.whatwg.org/multipage/dnd.html#dndevents
    // Default Action: reject immediate user selection as potential target element.

    if (
      this.isRecognizedSource(this.currentSource!) &&
      this.isRecognizedDropzone(enter)
    ) {
      // Since we have specified which elements are dropzones, they are naturally potential target elements.
      e.preventDefault();
    }

    // In this case, e.target is this.currentTarget or descendant of the this.currentTarget.
    if (this._currentTarget === enter) return;

    this._currentTarget = enter;
    this.emit(
      'dragenter',
      new DragEnterEvent(this._currentSource!, enter, this.container, e)
    );
  };

  private onDragLeave = (e: globalThis.DragEvent) => {
    if (!e.isTrusted || !this.dragging) return;
    const target = e.target as Element;
    if (!closest(target, this.container)) return;

    const leave = closest(target, this.options.dropzone);
    if (!leave || !(leave instanceof HTMLElement)) return;

    // The relatedTarget represents an element we've entered.
    // It's null when we press 'esc', or when we release the mouse with the dropEffect being 'none'.
    const relatedTarget = e.relatedTarget as Element | null;

    // In this case, the enter is this.currentTarget and the leave is descendant of this.currentTarget, or vice versa.
    if (leave === this._currentTarget && relatedTarget !== null) return;

    const enter = relatedTarget === null ? null : this._currentTarget;
    this.emit(
      'dragleave',
      new DragLeaveEvent(this._currentSource!, leave, enter, this.container, e)
    );
  };

  private onDragOver = (e: globalThis.DragEvent) => {
    if (!e.isTrusted || !this.dragging || !this._currentTarget) return;

    // https://html.spec.whatwg.org/multipage/dnd.html#dndevents
    // Default Action: reset the current drag operation to 'none'.

    if (
      this.isRecognizedSource(this.currentSource!) &&
      this.isRecognizedDropzone(this.currentTarget!)
    ) {
      // What we need to know is that the dropEffect and the current drag operation are not the same concept.
      // The former is only used to tell the browser how to set the latter,
      // so if we don't prevent the default action, no matter what we set the dropEffect to, the final current drag operation will be reset to none.
      // This also means that the drop event will not trigger on any dropzone.
      // Please refer to the specification for more information.
      e.preventDefault();
    }

    this.emit(
      'dragover',
      new DragOverEvent(
        this._currentSource!,
        this._currentTarget,
        this.container,
        e
      )
    );
  };

  private onDrop = (e: globalThis.DragEvent) => {
    if (!e.isTrusted || !this.dragging || !this._currentTarget) return;
    this.emit(
      'drop',
      new DropEvent(
        this._currentSource!,
        this._currentTarget,
        this.container,
        e
      )
    );
  };

  private onDragEnd = (e: globalThis.DragEvent) => {
    if (!e.isTrusted || !this.dragging) return;
    const source = this._currentSource!;
    const over = this._currentTarget;
    this._currentSource = null;
    this._currentTarget = null;
    this.emit('dragend', new DragEndEvent(source, over, this.container, e));
  };
}
