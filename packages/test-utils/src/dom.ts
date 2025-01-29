import { vi } from 'vitest';

export function createSandbox(content: string) {
  const sandbox = document.createElement('div');
  sandbox.innerHTML = content;
  document.body.appendChild(sandbox);
  return sandbox;
}

export function findEl(element: HTMLElement, selector: string) {
  return element.querySelector(selector) as HTMLElement | null;
}

export function findAllEls(element: HTMLElement, selector: string) {
  return element.querySelectorAll(selector);
}

export function waitForRequestAnimationFrame() {
  return new Promise((resolve) => setTimeout(resolve));
}

Object.defineProperty(globalThis, 'requestAnimationFrame', {
  writable: true,
  value: vi.fn().mockImplementation((cb) => setTimeout(cb as any)),
});

export function waitForPromisesToResolve() {
  return new Promise((resolve) => setTimeout(resolve));
}
