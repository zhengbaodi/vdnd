import { ref, shallowRef } from 'vue';
import DndElement from '../DndElement';
import { Emitter, ensureArray } from '@vdnd/shared';

import type {
  DndOptions,
  MouseDndOptions,
  TouchDndOptions,
  NativeDndOptions,
  DndInstance,
  DndEventTable,
  MapDndType,
} from '../types';
import type { DndElementMatcher } from '../DndElement';

export default function useDndInstance<O extends DndOptions, V>(
  options: O
): DndInstance<O, V> {
  const source = shallowRef<DndElement<V> | null>(null);
  const over = shallowRef<DndElement<V> | null>(null);

  const rootDndElement = shallowRef<DndElement<V>>(
    new DndElement<V>(null, null, void 0, void 0, false, false, false, false)
  );
  rootDndElement.value!.children;

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

  const { type, ...restOptions } = options;
  const usedOptions = ref(restOptions);

  return {
    get type() {
      return type as MapDndType<O>;
    },
    get options() {
      // vue2, avoid reporting errors when rollup .d.ts file
      return usedOptions.value as Omit<O, 'type'>;
    },
    set options(o: Omit<O, 'type'>) {
      // vue2, avoid reporting errors when rollup .d.ts file
      usedOptions.value = o as any;
    },
    get source() {
      // vue2, avoid reporting errors when rollup .d.ts file
      return source.value as DndElement | null;
    },
    get over() {
      // vue2, avoid reporting errors when rollup .d.ts file
      return over.value as DndElement | null;
    },
    get rootDndElement() {
      // vue2, avoid reporting errors when rollup .d.ts file
      return rootDndElement.value as DndElement;
    },

    isOver,
    isDragging,

    on: emitter.on.bind(emitter),
    once: emitter.once.bind(emitter),
    off: emitter.off.bind(emitter),

    $setOver: setOver,
    $setSource: setSource,
    $setRootDndElement: setRootDndElement,
    $emit: emitter.emit.bind(emitter),
    $destroy: () => {
      emitter.destroy();
      source.value = null;
      over.value = null;
      rootDndElement.value.children = [];
    },
  };
}

export function useMouseDnd<V = any>(
  options: Omit<MouseDndOptions<V>, 'type'> = {}
): DndInstance<MouseDndOptions<V>, V> {
  return useDndInstance({
    type: 'mouse',
    ...options,
  });
}

export function useTouchDnd<V = any>(
  options: Omit<TouchDndOptions<V>, 'type'> = {}
): DndInstance<TouchDndOptions<V>, V> {
  return useDndInstance({
    type: 'touch',
    ...options,
  });
}

export function useNativeDnd<V = any>(
  options: Omit<NativeDndOptions, 'type'> = {}
): DndInstance<NativeDndOptions, V> {
  return useDndInstance({
    type: 'native',
    ...options,
  });
}
