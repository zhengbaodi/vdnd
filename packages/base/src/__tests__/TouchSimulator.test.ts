import {
  describe,
  it,
  expect,
  vi,
  afterEach,
  beforeEach,
  afterAll,
  beforeAll,
} from 'vitest';
import {
  findEl,
  createSandbox,
  touchStart,
  touchMove,
  touchRelease,
  DRAG_DELAY,
} from '@vdnd/test-utils';
import {
  TouchSimulator,
  SimulatorOptions,
  DragStartSimulatorEvent,
  DragEndSimulatorEvent,
  DragMoveSimulatorEvent,
} from '../simulators';

beforeAll(() => {
  vi.useFakeTimers();
});

afterAll(() => {
  vi.useRealTimers();
});

const markup = `
  <div class="container">
    <div class="source"></div>
  </div>
`;
let simulator: TouchSimulator;
let html: HTMLElement;
let container: HTMLElement;
let source: HTMLElement;
const options: SimulatorOptions = {
  source: 'source',
  handle: 'handle',
  delay: DRAG_DELAY,
};
const onDragStart = vi.fn<(e: DragStartSimulatorEvent) => void>();
const onDragMove = vi.fn<(e: DragMoveSimulatorEvent) => void>();
const onDragEnd = vi.fn<(e: DragEndSimulatorEvent) => void>();

beforeAll(() => {
  vi.useFakeTimers();
});

afterAll(() => {
  vi.useRealTimers();
});

beforeEach(() => {
  html = createSandbox(markup);
  container = findEl(html, '.container')!;
  source = findEl(html, '.source')!;
  simulator = new TouchSimulator(
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
  touchRelease(document.body, 'touchend');
  html.remove();
});

describe('drag:start', () => {
  it("should invoke 'onDragStart' when touchstart + toucmove ", () => {
    const ev = touchStart(source, {
      touches: [
        {
          pageX: 100,
          pageY: 100,
        },
      ],
    });
    vi.advanceTimersByTime(options.delay!);
    touchMove(source);

    expect(onDragStart).toHaveBeenCalledTimes(1);

    const [e] = onDragStart.mock.lastCall!;
    expect(e.container).toBe(container);
    expect(e.originalEvent).toBe(ev);
    expect(e.source).toBe(source);
    expect(e.target).toBe(source);
    expect(e.clientX).toBe(100);
    expect(e.clientY).toBe(100);
  });

  it("should not invoke 'onDragStart' when meeting invalid touchstart", async () => {
    const handle = document.createElement('div');
    handle.classList.add('handle');
    const handleSibling = document.createElement('div');
    source.appendChild(handle);
    source.appendChild(handleSibling);

    touchStart(handleSibling);
    expect(onDragStart).not.toHaveBeenCalled();
  });

  describe("should invoke 'onDragStart' when 'delay' is elapsed", () => {
    it('less than', () => {
      touchStart(source);
      vi.advanceTimersByTime(options.delay! / 2);
      touchMove(source);

      expect(onDragStart).not.toHaveBeenCalled();
    });

    it('up to', () => {
      touchStart(source);
      vi.advanceTimersByTime(options.delay!);
      touchMove(source);

      expect(onDragStart).toHaveBeenCalledOnce();
    });

    it('greater than', () => {
      touchStart(source);
      vi.advanceTimersByTime(options.delay! * 2);
      touchMove(source);

      expect(onDragStart).toHaveBeenCalledOnce();
    });
  });

  it("should not initiate drag-flow when canceling 'drag:start'", () => {
    onDragStart.mockImplementation((e) => e.cancel());

    touchStart(source);
    vi.advanceTimersByTime(options.delay!);
    touchMove(source);
    touchMove(source);

    expect(onDragMove).not.toHaveBeenCalled();
  });
});

it("should invoke 'onDragMove' when touch moves during dragging", () => {
  touchStart(source);
  vi.advanceTimersByTime(options.delay!);
  touchMove(source);
  const ev = touchMove(source, {
    touches: [
      {
        pageX: 100,
        pageY: 100,
      },
    ],
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

it("should invoke 'onDragEnd' when touch cancels during dragging", () => {
  touchStart(source);
  vi.advanceTimersByTime(options.delay!);
  touchMove(source);
  const ev = touchRelease(source);

  expect(onDragEnd).toHaveBeenCalledTimes(1);

  const [e] = onDragEnd.mock.lastCall!;
  expect(e.container).toBe(container);
  expect(e.originalEvent).toBe(ev);
  expect(e.source).toBe(source);
  expect(e.target).toBe(source);
});

it('should prevent scrolling while dragging', () => {
  touchStart(source);
  vi.advanceTimersByTime(options.delay!);
  touchMove(source);
  const touchMoveEvent = touchMove(source);

  expect(touchMoveEvent).toHaveDefaultPrevented();
});

describe('cancel()', () => {
  it('should stop dragging', () => {
    touchStart(source);
    vi.advanceTimersByTime(options.delay!);
    touchMove(source);
    simulator.cancel();
    touchMove(source);

    expect(onDragMove).not.toHaveBeenCalled();
  });

  it('we can drag again', () => {
    touchStart(source);
    vi.advanceTimersByTime(options.delay!);
    touchMove(source);
    simulator.cancel();
    touchStart(source);
    vi.advanceTimersByTime(options.delay!);
    touchMove(source);

    expect(onDragStart).toHaveBeenCalledTimes(2);
  });
});

it('setup', () => {
  simulator.detach();
  simulator = new TouchSimulator(
    document,
    container,
    options,
    onDragStart,
    onDragMove,
    onDragEnd
  );

  touchStart(source);
  vi.advanceTimersByTime(options.delay!);
  touchMove(source);
  expect(onDragStart).not.toHaveBeenCalled();

  simulator.attach();
  touchStart(source);
  vi.advanceTimersByTime(options.delay!);
  touchMove(source);
  expect(onDragStart).toHaveBeenCalledTimes(1);

  simulator.detach();
  touchStart(source);
  vi.advanceTimersByTime(options.delay!);
  touchMove(source);
  expect(onDragStart).toHaveBeenCalledTimes(1);
});
