import {
  DragSimulator,
  MouseDragSimulator,
  TouchDragSimulator,
  NativeDragSimulator,
} from '../DragSimulator';
import { releaseDndProviders } from './RenderDndProvider';
import { DndProvider } from './Types';
import MouseDnd from '@wrapper/components/MouseDnd';
import TouchDnd from '@wrapper/components/TouchDnd';
import NativeDnd from '@wrapper/components/NativeDnd';

export type OriginalEventClass =
  | typeof MouseEvent
  | typeof TouchEvent
  | typeof DragEvent
  | typeof Event;

export interface DndProviderUtil {
  native: boolean;
  Provider: DndProvider;
  simualtor: DragSimulator;
  originalEventInterface: OriginalEventClass;
}

export function createDndProviderUtilIterator(
  types: (typeof DragSimulator)[] = [
    MouseDragSimulator,
    TouchDragSimulator,
    NativeDragSimulator,
  ]
) {
  const utils: DndProviderUtil[] = [];

  if (types.includes(MouseDragSimulator)) {
    utils.push({
      native: false,
      Provider: MouseDnd,
      simualtor: new MouseDragSimulator(),
      originalEventInterface: MouseEvent,
    });
  }

  if (types.includes(TouchDragSimulator)) {
    utils.push({
      native: false,
      Provider: TouchDnd,
      simualtor: new TouchDragSimulator(),
      originalEventInterface: TouchEvent,
    });
  }
  if (types.includes(NativeDragSimulator)) {
    utils.push({
      native: true,
      Provider: NativeDnd,
      simualtor: new NativeDragSimulator(),
      originalEventInterface: window.DragEvent || Event,
    });
  }

  async function each(callback: (util: DndProviderUtil) => Promise<void>) {
    for (let i = 0; i < utils.length; i++) {
      const util = utils[i];
      await callback(util);
      await util.simualtor.dragend(false);
      releaseDndProviders();
    }
  }

  return each;
}
