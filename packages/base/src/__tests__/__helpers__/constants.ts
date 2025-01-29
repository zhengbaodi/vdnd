import { DRAG_DELAY, NativeDragSimulator } from '@vdnd/test-utils';
import { MouseSimulator, TouchSimulator } from '../../simulators';
import { SimulatedDndOptions } from '../../SimulatedDnd';

export const mouseOptions: SimulatedDndOptions = {
  source: 'source',
  dropzone: 'dropzone',
  handle: 'handle',
  simulator: MouseSimulator,
};

export const touchOptions: SimulatedDndOptions = {
  source: 'source',
  dropzone: 'dropzone',
  handle: 'handle',
  simulator: TouchSimulator,
  delay: DRAG_DELAY,
};

export const nativeOptions: SimulatedDndOptions = {
  source: 'source',
  dropzone: 'dropzone',
  handle: 'handle',
  // @ts-ignore
  simulator: NativeDragSimulator,
};
