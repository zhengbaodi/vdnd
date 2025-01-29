import { vi } from 'vitest';
import {
  findEl,
  createSandbox,
  DragSimulator,
  MouseDragSimulator,
  TouchDragSimulator,
  NativeDragSimulator,
} from '@vdnd/test-utils';
import AbstractDnd from '../../AbstractDnd';
import SimulatedDnd, { SimulatedDndOptions } from '../../SimulatedDnd';
import NativeDnd, { NativeDndOptions } from '../../NativeDnd';
import { TouchSimulator, MouseSimulator } from '../../simulators';
import { DefaultEventSuppressor } from '../../EventSuppressor';
import {
  DragEvent,
  DragStartEvent,
  DragOverEvent,
  DragEnterEvent,
  DragMoveEvent,
  DragLeaveEvent,
  DragEndEvent,
  DragPreventEvent,
  DropEvent,
} from '../../DndEvent';

export type TestEnv<Dnd extends AbstractDnd = AbstractDnd> = {
  dnd: Dnd;
  simulator: DragSimulator;
  sandbox: HTMLElement;
  container: HTMLElement;
  source: HTMLElement;
  dropzone: HTMLElement;
  handlers: ReturnType<typeof createMockHandlers>;
};

export function createMockHandlers() {
  const onDrag = vi.fn<(e: DragEvent) => void>();
  const onDragPrevent = vi.fn<(e: DragPreventEvent) => void>();
  const onDragStart = vi.fn<(e: DragStartEvent) => void>();
  const onDragOver = vi.fn<(e: DragOverEvent) => void>();
  const onDragEnter = vi.fn<(e: DragEnterEvent) => void>();
  const onDragLeave = vi.fn<(e: DragLeaveEvent) => void>();
  const onDragMove = vi.fn<(e: DragMoveEvent) => void>();
  const onDrop = vi.fn<(e: DropEvent) => void>();
  const onDragEnd = vi.fn<(e: DragEndEvent) => void>();
  return {
    onDrag,
    onDrop,
    onDragStart,
    onDragPrevent,
    onDragOver,
    onDragEnter,
    onDragMove,
    onDragLeave,
    onDragEnd,
  };
}

export function createTestEnv<Native extends boolean>(
  native: Native,
  markup: string | null = null,
  handlers: TestEnv['handlers'] | null = null,
  options: NativeDndOptions | SimulatedDndOptions
): TestEnv<Native extends true ? NativeDnd : SimulatedDnd> {
  markup ??= `
    <div class="container">
      <div class="source"></div>
      <div class="dropzone"></div>
    </div>
  `;
  options ??= {
    source: 'source',
    dropzone: 'dropzone',
  };
  handlers ??= createMockHandlers();
  const sandbox = createSandbox(markup);
  const container = sandbox.firstElementChild! as HTMLElement;
  document.body.appendChild(container);

  const dnd = new (native ? NativeDnd : SimulatedDnd)(
    container,
    options as any
  ) as Native extends true ? NativeDnd : SimulatedDnd;

  let simulator!: DragSimulator;
  if (native) {
    simulator = new NativeDragSimulator();
  } else {
    // @ts-ignore
    if (options.simulator === MouseSimulator) {
      simulator = new MouseDragSimulator();
      // @ts-ignore
    } else if (options.simulator === TouchSimulator) {
      simulator = new TouchDragSimulator();
    }
  }

  dnd
    // @ts-ignore
    .on('drag', handlers.onDrag)
    .on('drag:start', handlers.onDragStart)
    .on('drag:prevent', handlers.onDragPrevent)
    .on('drag:move', handlers.onDragMove)
    .on('drag:over', handlers.onDragOver)
    .on('drag:enter', handlers.onDragEnter)
    .on('drag:leave', handlers.onDragLeave)
    .on('drop', handlers.onDrop)
    .on('drag:end', handlers.onDragEnd);

  const source = findEl(container, '.source')!;
  const dropzone = findEl(container, '.dropzone')!;

  return {
    dnd,
    source,
    dropzone,
    sandbox,
    container,
    handlers,
    simulator,
  };
}

export function releaseTestEnv(env: TestEnv) {
  const { simulator, dnd, container, handlers } = env;
  simulator.reset();
  dnd.destroy();
  removeAllMirrors();
  container.remove();
  handlers.onDrag.mockClear();
  handlers.onDrag.mockReset();
  handlers.onDragOver.mockClear();
  handlers.onDragOver.mockReset();
  handlers.onDragStart.mockClear();
  handlers.onDragStart.mockReset();
  handlers.onDragPrevent.mockClear();
  handlers.onDragPrevent.mockReset();
  handlers.onDragEnter.mockClear();
  handlers.onDragEnter.mockReset();
  handlers.onDragMove.mockClear();
  handlers.onDragMove.mockReset();
  handlers.onDragLeave.mockClear();
  handlers.onDragLeave.mockReset();
  handlers.onDragEnd.mockClear();
  handlers.onDragEnd.mockReset();
  handlers.onDrop.mockClear();
  handlers.onDrop.mockReset();
}

export function findAllMirrors() {
  return document.body.querySelectorAll('.dnd-mirror');
}

export function removeAllMirrors() {
  const mirrors = findAllMirrors();
  mirrors.forEach((mirror) => mirror.remove());
}

export function createTestEnvIterator(
  markup: string | null,
  options: SimulatedDndOptions[]
) {
  const initialIsTrustedEvent = DefaultEventSuppressor.isTrustedEvent;
  const _beforeEach = () => {
    vi.useFakeTimers();
    TouchDragSimulator.USE_FAKE_TIMERS = true;
  };
  const _afterEach = async (env?: TestEnv) => {
    vi.useRealTimers();
    TouchDragSimulator.USE_FAKE_TIMERS = false;
    DefaultEventSuppressor.isTrustedEvent = initialIsTrustedEvent;
    if (env) releaseTestEnv(env);
  };

  return async function iterate(callback: (env: TestEnv) => Promise<void>) {
    for (const option of options) {
      _beforeEach();
      // @ts-ignore
      const native = option.simulator === NativeDragSimulator;
      const env = createTestEnv(native, markup, null, option);
      await callback(env);
      _afterEach(env);
    }
  };
}

export type TestEnvIterator = ReturnType<typeof createTestEnvIterator>;
