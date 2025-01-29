import { vi } from 'vitest';
import { isVNode, VNode } from 'vue';
import {
  DragSimulator,
  MouseDragSimulator,
  NativeDragSimulator,
  TouchDragSimulator,
} from '@vdnd/test-utils';
import { renderDndProvider, ProviderChildren } from './render';
import {
  NativeDnd,
  MouseDnd,
  TouchDnd,
  DndProvider,
  DndOptions,
  MouseDndOptions,
  TouchDndOptions,
  NativeDndOptions,
  DndType,
} from '../..';

export type TestEnv = ReturnType<typeof renderDndProvider> & {
  native: boolean;
  simulator: DragSimulator;
};

export function createTestEnv(
  simulator: DragSimulator,
  options: Omit<DndOptions, 'type'>,
  children: VNode | VNode[] | (() => any) = []
): TestEnv {
  const DndProvider =
    simulator instanceof MouseDragSimulator
      ? MouseDnd
      : simulator instanceof TouchDragSimulator
        ? TouchDnd
        : NativeDnd;
  return {
    ...renderDndProvider(DndProvider, options, children),
    simulator,
    native: DndProvider === NativeDnd,
  };
}

export type TestEnvIterator = (
  callback: (env: TestEnv) => Promise<void>
) => Promise<void>;

type GetDndOptionsExcludeType<P extends DndProvider> = P extends typeof MouseDnd
  ? Omit<MouseDndOptions, 'type'>
  : P extends typeof TouchDnd
    ? Omit<TouchDndOptions, 'type'>
    : P extends typeof NativeDnd
      ? Omit<NativeDndOptions, 'type'>
      : never;

export function createTestEnvIterator<P extends DndProvider>(
  simulators: DragSimulator[],
  options: GetDndOptionsExcludeType<P>,
  children?: ProviderChildren
): TestEnvIterator;
export function createTestEnvIterator(
  simulators: DragSimulator[],
  children: ProviderChildren
): TestEnvIterator;
export function createTestEnvIterator(
  simulators: DragSimulator[]
): TestEnvIterator;
export function createTestEnvIterator<P extends DndProvider>(
  simulators: DragSimulator[],
  optionsOrChildren?: GetDndOptionsExcludeType<P> | ProviderChildren,
  children: ProviderChildren = []
) {
  let _options: GetDndOptionsExcludeType<P>;
  let _children: () => VNode[];
  if (isVNode(optionsOrChildren)) {
    _children = () => [optionsOrChildren];
    _options = {} as GetDndOptionsExcludeType<P>;
  } else if (typeof optionsOrChildren === 'function') {
    _children = optionsOrChildren;
    _options = {} as GetDndOptionsExcludeType<P>;
  } else if (Array.isArray(optionsOrChildren)) {
    _children = () => optionsOrChildren;
    _options = {} as GetDndOptionsExcludeType<P>;
  } else {
    _children =
      typeof children === 'function'
        ? children
        : () => (isVNode(children) ? [children] : children);
    _options = optionsOrChildren as GetDndOptionsExcludeType<P>;
  }

  return async function (callback: (env: TestEnv) => Promise<void>) {
    const _beforeEach = () => {
      vi.useFakeTimers();
      TouchDragSimulator.USE_FAKE_TIMERS = true;
    };
    const _afterEach = async (env: TestEnv) => {
      vi.useRealTimers();
      TouchDragSimulator.USE_FAKE_TIMERS = false;
      env.destroy();
    };

    for (const simulator of simulators) {
      _beforeEach();
      const env = createTestEnv(simulator, _options, _children);
      await callback(env);
      _afterEach(env);
    }
  };
}

export function createSimulators(
  types: DndType[] = ['native', 'mouse', 'touch']
) {
  return types.map((type) => {
    switch (type) {
      case 'native':
        return new NativeDragSimulator();
      case 'mouse':
        return new MouseDragSimulator();
      case 'touch':
        return new TouchDragSimulator();
    }
  });
}
