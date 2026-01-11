import { inject, markRaw, ref, shallowRef } from 'vue';
import type { DndElement } from './dnd-element';
import {
  unwrapDraggable,
  unwrapDroppable,
  type DndInteraction,
} from './dnd-interaction';
import { findHandlesIn as _findHandlesIn } from '@vdnd/native';

export type { DndElement, DndInteraction };

export type DndClasses = {
  container?: string;
  source?: string;
  dropzone?: string;
  handle?: string;
  'source:dragging'?: string | string[];
  'source:draggable'?: string | string[];
  'source:disabled'?: string | string[];
  'dropzone:over'?: string | string[];
  'dropzone:droppable'?: string | string[];
  'dropzone:disabled'?: string | string[];
};

export type DndModelOptions<
  Source extends DndElement = DndElement,
  Dropzone extends DndElement = DndElement,
> = {
  classes?: DndClasses;
  interactions?: DndInteraction<Source, Dropzone>[];
};

export type DndModel<
  Source extends DndElement = DndElement,
  Dropzone extends DndElement = DndElement,
> = ReturnType<typeof useDndModel<Source, Dropzone>>;

type NativeElement<T extends DndElement = DndElement> =
  | {
      role: 'container';
      htmlEl: HTMLElement;
      dndEl: undefined;
    }
  | {
      role: 'source';
      htmlEl: HTMLElement;
      dndEl: T;
    }
  | {
      role: 'dropzone';
      htmlEl: HTMLElement;
      dndEl: T;
    }
  | {
      role: 'handle';
      htmlEl: HTMLElement;
      dndEl: undefined;
    };
type NativeElementRole = NativeElement['role'];

export function useDndModel<
  Source extends DndElement = DndElement,
  Dropzone extends DndElement = DndElement,
>(
  options?:
    | DndModelOptions<Source, Dropzone>
    | DndInteraction<Source, Dropzone>[]
) {
  let _cls: DndClasses;
  let _interactions: DndInteraction<Source, Dropzone>[];
  if (Array.isArray(options)) {
    _cls = {};
    _interactions = options;
  } else {
    _cls = options?.classes || {};
    _interactions = options?.interactions || [];
  }

  _cls.container ||= 'dnd-container';
  _cls.source ||= 'dnd-source';
  _cls.dropzone ||= 'dnd-dropzone';
  _cls.handle ||= 'dnd-handle';
  const classes: Readonly<Required<DndClasses>> = {
    container: _cls.container,
    source: _cls.source,
    dropzone: _cls.dropzone,
    handle: _cls.handle,
    'source:dragging': _cls['source:dragging'] || `${_cls.source}--dragging`,
    'source:draggable': _cls['source:draggable'] || `${_cls.source}--draggable`,
    'source:disabled': _cls['source:disabled'] || `${_cls.source}--disabled`,
    'dropzone:over': _cls['dropzone:over'] || `${_cls.dropzone}--over`,
    'dropzone:droppable':
      _cls['dropzone:droppable'] || `${_cls.dropzone}--droppable`,
    'dropzone:disabled':
      _cls['dropzone:disabled'] || `${_cls.dropzone}--disabled`,
  };

  const initialized = ref(false);
  function setInitialized(flag: boolean) {
    initialized.value = flag;
    if (!flag) return;
    const POWERS: Record<DndInteraction['scope'], number> = {
      '*': 99,
      s: 11,
      d: 10,
      's+d': 1,
    };
    // *, s, d, s+d
    interactions = [...interactions].sort((a, b) => {
      const power1 = POWERS[a.scope];
      const power2 = POWERS[b.scope];
      return power2 - power1;
    });
  }

  let interactions = _interactions;
  function defineInteraction(
    interaction: DndInteraction<Source, Dropzone>
  ): void {
    if (initialized.value) {
      console.warn(
        `[vdnd warn]: Can't define the interaction, because the model has completed initialization.`
      );
      return;
    }
    interactions.push(interaction);
  }

  const currentSource = shallowRef<Source>();
  function setCurrentSource(value: Source | undefined) {
    currentSource.value = value;
  }

  const currentTarget = shallowRef<Dropzone>();
  function setCurrentTarget(value: Dropzone | undefined) {
    currentTarget.value = value;
  }

  function isDragging(): boolean;
  function isDragging(label: Source['label']): boolean;
  function isDragging<Label extends Source['label']>(
    label: Label,
    data: Extract<Source, { label: Label }>['data']
  ): boolean;
  function isDragging(source: Source): boolean;
  function isDragging(predicate: (source: Source) => boolean): boolean;
  function isDragging(...args: unknown[]): boolean {
    if (typeof currentSource.value === 'undefined') return false;
    const [a, b] = args;
    if (typeof a === 'undefined') {
      return true;
    } else if (typeof a === 'string') {
      if (typeof b === 'undefined') {
        return currentSource.value.label === a;
      } else {
        const label1 = a;
        const data1 = b;
        const { label: label2, data: data2 } = currentSource.value;
        return label1 === label2 && data1 === data2;
      }
    } else if (typeof a === 'object') {
      const { label: label1, data: data1 } = a as Source;
      const { label: label2, data: data2 } = currentSource.value;
      return label1 === label2 && data1 === data2;
    } else {
      return (a as Function)(currentSource.value);
    }
  }

  function isDraggable(source: Source): boolean;
  function isDraggable<Label extends Source['label']>(
    label: Label,
    data: Extract<Source, { label: Label }>['data']
  ): boolean;
  function isDraggable(...args: unknown[]): boolean {
    const [a, b] = args;
    const source = (
      typeof a === 'object' ? a : { label: a, data: b }
    ) as Source;
    for (const i of interactions) {
      if (i.scope === 'd' || i.scope === 's+d') continue;
      else if (typeof i.draggable !== 'undefined') {
        if (i.scope === 's') {
          if (i.source !== source.label) continue;
        }
        if (!unwrapDraggable(i.draggable, source)) {
          return false;
        }
      }
    }
    return true;
  }

  function isOver(): boolean;
  function isOver(label: Dropzone['label']): boolean;
  function isOver<Label extends Dropzone['label']>(
    label: Label,
    data: Extract<Dropzone, { label: Label }>['data']
  ): boolean;
  function isOver(dropzone: Dropzone): boolean;
  function isOver(predicate: (dropzone: Dropzone) => boolean): boolean;
  function isOver(...args: unknown[]): boolean {
    if (typeof currentTarget.value === 'undefined') return false;
    const [a, b] = args;
    if (typeof a === 'undefined') {
      return true;
    } else if (typeof a === 'string') {
      if (typeof b === 'undefined') {
        return currentTarget.value.label === a;
      } else {
        const label1 = a;
        const data1 = b;
        const { label: label2, data: data2 } = currentTarget.value;
        return label1 === label2 && data1 === data2;
      }
    } else if (typeof a === 'object') {
      const { label: label1, data: data1 } = a as Source;
      const { label: label2, data: data2 } = currentTarget.value;
      return label1 === label2 && data1 === data2;
    } else {
      return (a as Function)(currentTarget.value);
    }
  }

  function isDroppable(dropzone: Dropzone): boolean;
  function isDroppable<Label extends Dropzone['label']>(
    label: Label,
    data: Extract<Dropzone, { label: Label }>['data']
  ): boolean;
  function isDroppable(...args: unknown[]): boolean {
    if (!isDragging()) {
      console.warn(
        '[vdnd warn]: We can only call `isDroppable` during the drag-and-drop operation, ' +
          'because one of the `droppable` signatures takes the current source as a parameter.'
      );
      return false;
    }
    const [a, b] = args;
    const dropzone = (
      typeof a === 'object' ? a : { label: a, data: b }
    ) as Dropzone;
    for (const i of interactions) {
      if (i.scope === 's') continue;
      else if (typeof i.droppable !== 'undefined') {
        if (i.scope === 's+d') {
          if (i.source !== currentSource.value!.label) continue;
        }
        if (i.scope === 'd' || i.scope === 's+d') {
          if (i.dropzone !== dropzone.label) continue;
        }
        if (!unwrapDroppable(i.droppable, currentSource.value!, dropzone)) {
          return false;
        }
      }
    }
    return true;
  }

  const nativeElements: NativeElement[] = [];
  function addNativeElement<Role extends NativeElementRole>(
    role: Role,
    htmlEl: HTMLElement,
    dndEl: Role extends 'source' | 'dropzone' ? DndElement : undefined
  ) {
    nativeElements.push({ role, htmlEl, dndEl } as NativeElement);
  }

  function removeNativeElement(role: NativeElementRole, htmlEl: HTMLElement) {
    const index = nativeElements.findIndex(
      (nativeEl) => nativeEl.role === role && nativeEl.htmlEl === htmlEl
    );
    if (index >= 0) {
      nativeElements.splice(index, 1);
    }
  }

  function findDndElement(
    role: 'source',
    htmlEl: HTMLElement
  ): Source | undefined;
  function findDndElement(
    role: 'dropzone',
    htmlEl: HTMLElement
  ): Dropzone | undefined;
  function findDndElement(
    role: 'source' | 'dropzone',
    htmlEl: HTMLElement
  ): DndElement | undefined {
    const nativeEl = nativeElements.find(
      (nativeEl) => nativeEl.role === role && nativeEl.htmlEl === htmlEl
    );
    return nativeEl?.dndEl;
  }

  function findHTMLElement(role: 'container'): HTMLElement | undefined;
  function findHTMLElement<Role extends 'source' | 'dropzone'>(
    role: Role,
    dndEl: Role extends 'source' ? Source : Dropzone
  ): HTMLElement | undefined;
  function findHTMLElement(...args: unknown[]): HTMLElement | undefined {
    const [role, b] = args;
    if (role === 'container') {
      return nativeElements.find((nativeEl) => {
        return nativeEl.role === role;
      })?.htmlEl;
    } else {
      const label1 = (b as DndElement).label;
      const data1 = (b as DndElement).data;
      return nativeElements.find((nativeEl) => {
        if (!nativeEl.dndEl) return false;
        const { label: label2, data: data2 } = nativeEl.dndEl;
        return nativeEl.role === role && label1 === label2 && data1 === data2;
      })?.htmlEl;
    }
  }

  function findHTMLElements(role: 'handle'): HTMLElement[];
  function findHTMLElements<Role extends 'source' | 'dropzone'>(
    role: Role,
    label?: Role extends 'source' ? Source['label'] : Dropzone['label']
  ): HTMLElement[];
  function findHTMLElements(
    role: 'source' | 'handle' | 'dropzone',
    label?: string
  ): HTMLElement[] {
    return nativeElements
      .filter((nativeEl) => {
        if (nativeEl.role !== role) return false;
        if (typeof label !== 'undefined' && nativeEl.dndEl) {
          return nativeEl.dndEl.label === label;
        }
        return true;
      })
      .map(({ htmlEl }) => htmlEl);
  }

  function findHandlesIn(source: HTMLElement | Source): HTMLElement[] {
    const sources: Element[] = findHTMLElements('source');
    const handles: Element[] = findHTMLElements('handle');
    const isSource = (source: Element) => sources.includes(source);
    const isHandle = (handle: Element) => handles.includes(handle);
    if (source instanceof HTMLElement) {
      return _findHandlesIn(source, isSource, isHandle) as HTMLElement[];
    } else {
      const htmlEl = findHTMLElement('source', source);
      return htmlEl
        ? (_findHandlesIn(htmlEl, isSource, isHandle) as HTMLElement[])
        : [];
    }
  }

  return markRaw({
    get classes() {
      return classes;
    },
    get interactions() {
      return interactions;
    },
    get initialized() {
      return initialized.value;
    },
    get currentSource() {
      return currentSource.value;
    },
    get currentTarget() {
      return currentTarget.value;
    },
    isDragging,
    isDraggable,
    isOver,
    isDroppable,
    defineInteraction,
    findHTMLElement,
    findHTMLElements,
    findHandlesIn,
    /**
     * @internal
     */
    $findDndElement: findDndElement,
    /**
     * @internal
     */
    $addNativeElement: addNativeElement,
    /**
     * @internal
     */
    $removeNativeElement: removeNativeElement,
    /**
     * @internal
     */
    $setInitialized: setInitialized,
    /**
     * @internal
     */
    $setCurrentTarget: setCurrentTarget,
    /**
     * @internal
     */
    $setCurrentSource: setCurrentSource,
  });
}

export const DndModelSymbol = Symbol('DndModelSymbol');

/**
 * Inject the dnd model of the `<DndContainer :model="?" />`
 */
export function injectDndModel<
  Source extends DndElement = DndElement,
  Dropzone extends DndElement = DndElement,
>() {
  return inject<DndModel<Source, Dropzone>>(DndModelSymbol);
}
