import { expect, it } from 'vitest';
import { createSandbox } from '@vdnd/test-utils';
import { findHandles } from '../simulators';

it('findHandles', () => {
  const isSource = (target: HTMLElement) => target.classList.contains('source');
  const isHandle = (target: HTMLElement) => target.classList.contains('handle');
  const markup = `
    <div class="root">
      <div>
        <div class="handle">
          <div class="handle"></div>
        </div>
      </div>
      <div class="source">
        <div class="handle"></div>
      </div>
    </div>
  `;
  const sandbox = createSandbox(markup);
  const root = sandbox.firstElementChild as HTMLElement;
  const handles = findHandles(root, {
    isSource,
    isHandle,
  });
  expect(handles.length).toBe(1);
});
