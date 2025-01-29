import {
  describe,
  beforeEach,
  afterEach,
  it,
  expect,
  vi,
  afterAll,
} from 'vitest';
import {
  findEl,
  createSandbox,
  clickMouse,
  moveMouse,
  releaseMouse,
  waitForRequestAnimationFrame,
  waitForPromisesToResolve,
} from '@vdnd/test-utils';
import { MouseSimulator } from '../simulators';
import SimulatedDnd, { SimulatedDndOptions } from '../SimulatedDnd';

const markup = `
  <ul class="container">
    <li class="dnd-source">First item</li>
  </ul>
`;
let html: HTMLElement;
let container: HTMLElement;
let source: HTMLElement;
let dnd: SimulatedDnd;
const dndOptions: SimulatedDndOptions = {
  source: 'dnd-source',
  simulator: MouseSimulator,
  dropzone: 'dnd-dropzone',
};

beforeEach(() => {
  html = createSandbox(markup);
  container = findEl(html, '.container')!;
  source = findEl(html, '.dnd-source')!;
});

afterEach(() => {
  dnd.destroy();
  html.remove();
  releaseMouse(source);
  const mirrors = document.body.querySelectorAll('.dnd-mirror');
  mirrors.forEach((el) => {
    el.remove();
  });
});

afterAll(() => {
  vi.clearAllMocks();
});

it('emits `mirror:created` event on `drag:start`', async () => {
  const onMirrorCreated = vi.fn();
  dnd = new SimulatedDnd(container, dndOptions);
  dnd.on('mirror:created', onMirrorCreated);

  clickMouse(source);
  moveMouse(source);
  await waitForPromisesToResolve();

  expect(onMirrorCreated).toHaveBeenCalledOnce();
});

it('emits `mirror:attached` event on `drag:start`', async () => {
  const onMirrorAttached = vi.fn();
  dnd = new SimulatedDnd(container, dndOptions);
  dnd.on('mirror:attached', onMirrorAttached);

  clickMouse(source);
  moveMouse(source);
  await waitForPromisesToResolve();

  expect(onMirrorAttached).toHaveBeenCalledOnce();
});

it('inserts mirror element on `mirror:attached`', async () => {
  dnd = new SimulatedDnd(container, dndOptions);

  let mirrorElement = document.querySelector('.dnd-mirror');
  expect(mirrorElement).toBeNull();

  clickMouse(source);
  moveMouse(source);
  await waitForPromisesToResolve();
  mirrorElement = document.querySelector('.dnd-mirror');
  expect(mirrorElement).toBeInstanceOf(HTMLElement);
});

it('emits `mirror:move` event on `drag:move`', async () => {
  const onMirrorMove = vi.fn();
  dnd = new SimulatedDnd(container, dndOptions);
  dnd.on('mirror:move', onMirrorMove);

  clickMouse(source);
  moveMouse(source);
  await waitForPromisesToResolve();

  moveMouse(source);
  expect(onMirrorMove).toHaveBeenCalledOnce();
});

it('moves mirror on `mirror:move`', async () => {
  dnd = new SimulatedDnd(container, dndOptions);

  clickMouse(source);
  moveMouse(source);
  await waitForPromisesToResolve();

  const mirrorElement = document.querySelector('.dnd-mirror') as HTMLElement;

  expect(mirrorElement.style.transform).toBe('translate3d(0px, 0px, 0)');

  moveMouse(source, {
    clientX: 100,
    clientY: 100,
  });

  await waitForPromisesToResolve();
  await waitForRequestAnimationFrame();

  expect(mirrorElement.style.transform).toBe('translate3d(100px, 100px, 0)');

  moveMouse(document.body, {
    clientX: 23,
    clientY: 172,
  });

  await waitForPromisesToResolve();
  await waitForRequestAnimationFrame();

  expect(mirrorElement.style.transform).toBe('translate3d(23px, 172px, 0)');
});

it('emits `mirror:detached` event on `drag:end`', async () => {
  const onMirrorDetached = vi.fn();
  dnd = new SimulatedDnd(container, dndOptions);
  dnd.on('mirror:detached', onMirrorDetached);

  clickMouse(source);
  moveMouse(source);
  await waitForPromisesToResolve();

  releaseMouse(source);
  expect(onMirrorDetached).toHaveBeenCalledOnce();
});

it('detaches mirror on `mirror:detached`', async () => {
  dnd = new SimulatedDnd(container, dndOptions);
  let mirrorElement: HTMLElement | null = null;

  clickMouse(source);
  moveMouse(source);
  await waitForPromisesToResolve();

  mirrorElement = document.querySelector('.dnd-mirror');
  expect(mirrorElement).toBeInstanceOf(HTMLElement);

  releaseMouse(source);
  mirrorElement = document.querySelector('.dnd-mirror');
  expect(mirrorElement).toBeNull();
});

it('appends mirror to source container by default', async () => {
  dnd = new SimulatedDnd(container, dndOptions);

  clickMouse(source);
  moveMouse(source);
  await waitForPromisesToResolve();

  const mirrorElement = document.querySelector('.dnd-mirror') as HTMLElement;
  expect(mirrorElement.parentNode).toBe(container);
});

it('appends mirror by css selector', async () => {
  dnd = new SimulatedDnd(container, {
    ...dndOptions,
    mirror: { appendTo: 'body' },
  });

  clickMouse(source);
  moveMouse(source);
  await waitForPromisesToResolve();

  const mirrorElement = document.querySelector('.dnd-mirror') as HTMLElement;
  expect(mirrorElement.parentNode).toBe(document.body);
});

it('appends mirror by function', async () => {
  dnd = new SimulatedDnd(container, {
    ...dndOptions,
    mirror: { appendTo: () => document.body },
  });

  clickMouse(source);
  moveMouse(source);
  await waitForPromisesToResolve();

  const mirrorElement = document.querySelector('.dnd-mirror') as HTMLElement;
  expect(mirrorElement.parentNode).toBe(document.body);
});

it('appends mirror by element', async () => {
  dnd = new SimulatedDnd(container, {
    ...dndOptions,
    mirror: { appendTo: document.body },
  });

  clickMouse(source);
  moveMouse(source);
  await waitForPromisesToResolve();

  const mirrorElement = document.querySelector('.dnd-mirror') as HTMLElement;
  expect(mirrorElement.parentNode).toBe(document.body);
});

it('customizes the mirror by `options.create`', async () => {
  const img = document.createElement('img');
  dnd = new SimulatedDnd(container, {
    ...dndOptions,
    mirror: {
      create() {
        return img;
      },
    },
  });
  clickMouse(source);
  moveMouse(source);
  await waitForPromisesToResolve();
  const mirrorElement = document.querySelector('.dnd-mirror') as HTMLElement;
  expect(mirrorElement).toBe(img);
});

describe('when `drag:end`', () => {
  it('mirror element was removed from document', async () => {
    dnd = new SimulatedDnd(container, dndOptions);

    clickMouse(source);
    moveMouse(source);
    await waitForPromisesToResolve();
    const promise = new Promise((resolve) => {
      dnd.on('drag:end', () => {
        const mirrorElement = document.querySelector(
          '.dnd-mirror'
        ) as HTMLElement;
        resolve(mirrorElement);
      });
    });
    releaseMouse(source);
    expect(await promise).toBeNull();
  });
});
