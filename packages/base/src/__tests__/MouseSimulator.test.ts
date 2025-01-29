import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import {
  findEl,
  createSandbox,
  clickMouse,
  moveMouse,
  releaseMouse,
  triggerEvent,
} from '@vdnd/test-utils';
import {
  MouseSimulator,
  SimulatorOptions,
  DragStartSimulatorEvent,
  DragMoveSimulatorEvent,
  DragEndSimulatorEvent,
} from '../simulators';

const markup = `
  <div class="container">
    <div class="source"></div>
  </div>
`;
let simulator: MouseSimulator;
let html: HTMLElement;
let container: HTMLElement;
let source: HTMLElement;
const options: SimulatorOptions = {
  source: 'source',
  handle: 'handle',
};
const onDragStart = vi.fn<(e: DragStartSimulatorEvent) => void>();
const onDragMove = vi.fn<(e: DragMoveSimulatorEvent) => void>();
const onDragEnd = vi.fn<(e: DragEndSimulatorEvent) => void>();

beforeEach(() => {
  html = createSandbox(markup);
  container = findEl(html, '.container')!;
  source = findEl(html, '.source')!;
  simulator = new MouseSimulator(
    document,
    container,
    options,
    onDragStart,
    onDragMove,
    onDragEnd
  );
  simulator.attach();
});

afterEach(() => {
  simulator.detach();
  vi.clearAllMocks();
  vi.resetAllMocks();
  releaseMouse(document.body);
  html.remove();
});

describe('drag:start', () => {
  it("should invoke 'onDragStart' when presses and moves the mouse ", () => {
    const ev = clickMouse(source, {
      clientX: 100,
      clientY: 100,
    });
    moveMouse(source);

    expect(onDragStart).toHaveBeenCalledTimes(1);

    const [e] = onDragStart.mock.lastCall!;
    expect(e.container).toBe(container);
    expect(e.originalEvent).toBe(ev);
    expect(e.source).toBe(source);
    expect(e.target).toBe(source);
    expect(e.clientX).toBe(100);
    expect(e.clientY).toBe(100);
  });

  describe("shouldn't invoke 'onDragStart' when meeting invalid mousedown", () => {
    it("only accept 'left-click'", () => {
      clickMouse(source, { button: 1 });
      moveMouse(source);
      expect(onDragStart).not.toHaveBeenCalled();

      clickMouse(source, { button: 0 });
      moveMouse(source);
      expect(onDragStart).toHaveBeenCalled();
    });

    it('when existing handle', () => {
      const handle = document.createElement('div');
      handle.classList.add('handle');
      const handleSibling = document.createElement('div');
      source.appendChild(handle);
      source.appendChild(handleSibling);

      clickMouse(handleSibling);
      expect(onDragStart).not.toHaveBeenCalled();
    });
  });

  it('should prevent native `dragstart`', () => {
    clickMouse(source);
    moveMouse(source);
    const dragstart = triggerEvent(source, 'dragstart');

    expect(dragstart).toHaveDefaultPrevented();
  });

  it("should not initiate drag-flow when canceling 'drag:start'", () => {
    onDragStart.mockImplementation((e) => e.cancel());

    clickMouse(source);
    moveMouse(source);
    moveMouse(source);

    expect(onDragMove).not.toHaveBeenCalled();
  });
});

it("should invoke 'onDragMove' when moveing the mouse during dragging", () => {
  clickMouse(source);
  moveMouse(source);
  const ev = moveMouse(source, {
    clientX: 100,
    clientY: 100,
  });

  expect(onDragMove).toHaveBeenCalledTimes(1);

  const [e] = onDragMove.mock.lastCall!;
  expect(e.container).toBe(container);
  expect(e.originalEvent).toBe(ev);
  expect(e.source).toBe(source);
  expect(e.target).toBe(source);
  expect(e.clientX).toBe(100);
  expect(e.clientY).toBe(100);
});

it("should invoke 'onDragEnd' when releasing the mouse during dragging", () => {
  clickMouse(source);
  moveMouse(source);
  const ev = releaseMouse(source);

  expect(onDragEnd).toHaveBeenCalledTimes(1);

  const [e] = onDragEnd.mock.lastCall!;
  expect(e.container).toBe(container);
  expect(e.originalEvent).toBe(ev);
  expect(e.source).toBe(source);
  expect(e.target).toBe(source);
});

it("should invoke 'onDragEnd' when pressing 'esc' during dragging", () => {
  clickMouse(source);
  moveMouse(source);
  const ev = triggerEvent(document.body, 'keydown', {
    code: 'Escape',
  });

  expect(onDragEnd).toHaveBeenCalledTimes(1);

  const [e] = onDragEnd.mock.lastCall!;
  expect(e.container).toBe(container);
  expect(e.originalEvent).toBe(ev);
  expect(e.source).toBe(source);
  expect(e.target).toBe(document.body);
});

describe('cancel()', () => {
  it('should stop dragging', () => {
    clickMouse(source);
    moveMouse(source);
    simulator.cancel();
    moveMouse(source);

    expect(onDragMove).not.toHaveBeenCalled();
  });

  it('we can drag again', () => {
    clickMouse(source);
    moveMouse(source);
    simulator.cancel();
    clickMouse(source);
    moveMouse(source);

    expect(onDragStart).toHaveBeenCalledTimes(2);
  });
});

it('setup', () => {
  simulator.detach();
  simulator = new MouseSimulator(
    document,
    container,
    options,
    onDragStart,
    onDragMove,
    onDragEnd
  );

  clickMouse(source);
  moveMouse(source);
  expect(onDragStart).not.toHaveBeenCalled();

  simulator.attach();
  clickMouse(source);
  moveMouse(source);
  expect(onDragStart).toHaveBeenCalledTimes(1);

  simulator.detach();
  clickMouse(source);
  moveMouse(source);
  expect(onDragStart).toHaveBeenCalledTimes(1);
});
