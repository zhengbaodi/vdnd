import {
  computed,
  isReactive,
  markRaw,
  reactive,
  shallowRef,
  toRefs,
  unref,
} from 'vue';
import DndElement from '../DndElement';
import { Emitter } from '@shared/Emitter';
import ensureArray from '@shared/ensureArray';

import type { DndElementMatcher } from '../DndElement';
import type {
  DndOptions,
  DragEndEvent,
  DragEnterEvent,
  DragEvent,
  DragLeaveEvent,
  DragOverEvent,
  DragPreventEvent,
  DragStartEvent,
  MouseDndOptions,
  TouchDndOptions,
  NativeDndOptions,
  DropEvent,
  DndType,
} from '../types';

type NativeDragEvent = globalThis.DragEvent;

export type DndEventTable<
  O extends DndOptions = DndOptions,
  V = any,
> = O extends MouseDndOptions
  ? DndEventTableForMouse<V>
  : O extends TouchDndOptions
    ? DndEventTableForTouch<V>
    : O extends NativeDndOptions
      ? DndEventTableForNative<V>
      : never;

export type DndEventTableForMouse<V = any> = {
  drag: DragEvent<V, null>;
  'drag:start': DragStartEvent<V, MouseEvent>;
  'drag:prevent': DragPreventEvent<V, MouseEvent>;
  'drag:enter': DragEnterEvent<V, MouseEvent>;
  'drag:over': DragOverEvent<V, null>;
  'drag:leave': DragLeaveEvent<V, MouseEvent | KeyboardEvent>;
  'drag:end': DragEndEvent<V, MouseEvent | KeyboardEvent>;
  drop: DropEvent<V, MouseEvent>;
};

export type DndEventTableForTouch<V = any> = {
  drag: DragEvent<V, null>;
  'drag:start': DragStartEvent<V, TouchEvent>;
  'drag:prevent': DragPreventEvent<V, TouchEvent>;
  'drag:enter': DragEnterEvent<V, TouchEvent>;
  'drag:over': DragOverEvent<V, null>;
  'drag:leave': DragLeaveEvent<V, TouchEvent>;
  'drag:end': DragEndEvent<V, TouchEvent>;
  drop: DropEvent<V, TouchEvent>;
};

export type DndEventTableForNative<V = any> = {
  drag: DragEvent<V, NativeDragEvent>;
  'drag:start': DragStartEvent<V, NativeDragEvent>;
  'drag:prevent': DragPreventEvent<V, NativeDragEvent>;
  'drag:enter': DragEnterEvent<V, NativeDragEvent>;
  'drag:over': DragOverEvent<V, NativeDragEvent>;
  'drag:leave': DragLeaveEvent<V, NativeDragEvent>;
  'drag:end': DragEndEvent<V, NativeDragEvent>;
  drop: DropEvent<V, NativeDragEvent>;
};

export type DndInstance<O extends DndOptions = DndOptions, V = any> = {
  type: DndType;

  options: Omit<O, 'type'>;

  /**
   * The current source.
   */
  source: DndElement<V> | null;

  /**
   * The current drop target.
   */
  over: DndElement<V> | null;

  /**
   * The root element of the DndElementTree composed by sources and dropzones in DndProvider(NativeDnd, MouseDnd, TouchDnd).
   */
  rootDndElement: DndElement<V>;

  /**
   * Returns true, if the current source exists.
   */
  isDragging(): boolean;

  /**
   * Returns true, if label of the current source is specified label.
   */
  isDragging(label: string): boolean;

  /**
   * Returns true, if label of the current source is one of specified labels.
   */
  isDragging(labels: string[]): boolean;

  /**
   * Returns true, if the current source satisfies specified matcher.
   */
  isDragging(matcher: DndElementMatcher): boolean;

  /**
   * Returns true, if the current drop target exists.
   */
  isOver(): boolean;

  /**
   * Returns true, if label of the current drop target is equal to specified label.
   */
  isOver(label: string): boolean;

  /**
   * Returns true, if label of the current drop target is one of specified labels.
   */
  isOver(labels: string[]): boolean;

  /**
   * Returns true, if the current drop target satisfies specified matcher.
   */
  isOver(matcher: DndElementMatcher): boolean;

  on<K extends keyof DndEventTable<O, V>>(
    type: K,
    callback: (event: DndEventTable<O, V>[K]) => void
  ): void;

  once<K extends keyof DndEventTable<O, V>>(
    type: K,
    callback: (event: DndEventTable<O, V>[K]) => void
  ): void;

  off<K extends keyof DndEventTable<O, V>>(
    type: K,
    callback: (event: DndEventTable<O, V>[K]) => void
  ): void;

  /** @internal */
  $setOver(over: DndElement<V> | null): void;

  /** @internal */
  $setSource(source: DndElement<V> | null): void;

  /** @internal */
  $setRootDndElement(rootDndElement: DndElement<V>): void;

  /** @internal */
  $emit<K extends keyof DndEventTable<O, V>>(
    type: K,
    payload: DndEventTable<O, V>[K]
  ): void;

  /** @internal */
  $destroy(): void;
};

export default function useDndInstance<O extends DndOptions, V>(options: O) {
  const source = shallowRef<DndElement<V> | null>(null);
  const over = shallowRef<DndElement<V> | null>(null);

  const rootDndElement = shallowRef<DndElement<V>>(
    new DndElement<V>(null, null, null, null, false, false, false, false)
  );
  markRaw(rootDndElement.value!.children);

  function setOver(value: DndElement<V> | null) {
    over.value = value;
  }

  function setSource(value: DndElement<V> | null) {
    source.value = value;
  }

  function setRootDndElement(value: DndElement<V>) {
    rootDndElement.value = value;
  }

  function isDragging(test?: string | string[] | DndElementMatcher) {
    if (source.value === null) {
      return false;
    }

    if (test === void 0) {
      return source.value !== null;
    }

    if (typeof test === 'string' || Array.isArray(test)) {
      return source.value.matches({
        label: ensureArray(test),
      });
    }

    return source.value.matches(test);
  }

  function isOver(test?: string | string[] | DndElementMatcher) {
    if (over.value === null) {
      return false;
    }

    if (test === void 0) {
      return over.value !== null;
    }

    if (typeof test === 'string' || Array.isArray(test)) {
      return over.value.matches({
        label: ensureArray(test),
      });
    }

    return over.value.matches(test);
  }

  const emitter = new Emitter<DndEventTable<O, V>>();

  const { type, ...restOptions } = isReactive(options)
    ? toRefs(options)
    : options;

  return reactive({
    type: computed(() => unref(type) as DndType),
    options: reactive(restOptions) as Omit<O, 'type'>,
    source,
    over,
    rootDndElement,

    isOver: markRaw(isOver),
    isDragging: markRaw(isDragging),

    on: markRaw(emitter.on.bind(emitter)),
    once: markRaw(emitter.once.bind(emitter)),
    off: markRaw(emitter.off.bind(emitter)),

    $setOver: markRaw(setOver),
    $setSource: markRaw(setSource),
    $setRootDndElement: markRaw(setRootDndElement),
    $emit: markRaw(emitter.emit.bind(emitter)),
    $destroy: markRaw(() => {
      emitter.destroy();
      source.value = null;
      over.value = null;
      rootDndElement.value.children = [];
    }),
  }) as DndInstance<O, V>;
}

export function useMouseDnd<V = any>(
  options: Omit<MouseDndOptions<V>, 'type'> = {}
) {
  const _options = isReactive(options) ? toRefs(options) : options;
  return useDndInstance<MouseDndOptions<V>, V>(
    reactive({
      type: 'mouse',
      ..._options,
    })
  );
}

export function useTouchDnd<V = any>(
  options: Omit<TouchDndOptions, 'type'> = {}
) {
  const _options = isReactive(options) ? toRefs(options) : options;
  return useDndInstance<TouchDndOptions<V>, V>(
    reactive({
      type: 'touch',
      ..._options,
    })
  );
}

export function useNativeDnd<V = any>(
  options: Omit<NativeDndOptions, 'type'> = {}
) {
  const _options = isReactive(options) ? toRefs(options) : options;
  return useDndInstance<NativeDndOptions, V>(
    reactive({
      type: 'native',
      ..._options,
    })
  );
}
