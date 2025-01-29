import NativeDnd from '../src/components/NativeDnd';
import MouseDnd from '../src/components/MouseDnd';
import TouchDnd from '../src/components/TouchDnd';
import DndSource from '../src/components/DndSource';
import DndDropzone from '../src/components/DndDropzone';
import DndHandle from '../src/components/DndHandle';

import type { Plugin } from 'vue';

/**
 * Registers global components: NativeDnd, DndSource, DndDropzone, DndHandle.
 */
export const NativeDndPlugin: Plugin = (app) => {
  app.component(NativeDnd.name!, NativeDnd);
  app.component(DndSource.name!, DndSource);
  app.component(DndDropzone.name!, DndDropzone);
  app.component(DndHandle.name!, DndHandle);
};

/**
 * Registers global components: MouseDnd, DndSource, DndDropzone, DndHandle.
 */
export const MouseDndPlugin: Plugin = (app) => {
  app.component(MouseDnd.name!, MouseDnd);
  app.component(DndSource.name!, DndSource);
  app.component(DndDropzone.name!, DndDropzone);
  app.component(DndHandle.name!, DndHandle);
};

/**
 * Registers global components: TouchDnd, DndSource, DndDropzone, DndHandle.
 */
export const TouchDndPlugin: Plugin = (app) => {
  app.component(TouchDnd.name!, TouchDnd);
  app.component(DndSource.name!, DndSource);
  app.component(DndDropzone.name!, DndDropzone);
  app.component(DndHandle.name!, DndHandle);
};
