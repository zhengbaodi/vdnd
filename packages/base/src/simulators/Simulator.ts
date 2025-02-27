import closest from '../closest';

import type { AbstractDndOptions } from '../AbstractDnd';
import type {
  DragEndSimulatorEvent,
  DragMoveSimulatorEvent,
  DragStartSimulatorEvent,
} from './SimulatorEvent';

export type SimulatorWorkingEnv = Pick<
  Document,
  'addEventListener' | 'removeEventListener'
>;

export type SimulatorOptions = Pick<AbstractDndOptions, 'source' | 'handle'> & {
  delay?: number;
};

/**
 * Returns all handles where 'options.isHandle' is true in a source node.
 */
export function findHandles(
  root: ParentNode,
  options: {
    isSource(element: Element): boolean;
    isHandle(element: Element): boolean;
  }
) {
  const { isHandle, isSource } = options;
  const handles: Element[] = [];
  for (let i = 0, element: Element; i < root.children.length; i++) {
    element = root.children.item(i)! as any;
    if (!(element instanceof Element) || isSource(element)) {
      continue;
    }
    if (isHandle(element)) {
      handles.push(element);
      continue;
    }
    handles.push(...findHandles(element, options));
  }
  return handles;
}

/**
 * Simulator picks up native browser events and dictates drag operations.
 */
export default abstract class Simulator<E extends Event = Event> {
  protected startEvent: E | null = null;
  protected source: Element | null = null;

  constructor(
    protected readonly env: SimulatorWorkingEnv,
    protected readonly container: HTMLElement,
    protected readonly options: SimulatorOptions,
    protected readonly onDragStrat: (e: DragStartSimulatorEvent) => void,
    protected readonly onDragMove: (e: DragMoveSimulatorEvent) => void,
    protected readonly onDragEnd: (e: DragEndSimulatorEvent) => void
  ) {}

  protected getSource(startEvent: Event) {
    if (
      !(startEvent.target instanceof Element) ||
      !closest(startEvent.target, this.container)
    )
      return null;

    const source = closest(startEvent.target, this.options.source);
    if (!source) return null;

    if (this.options.handle) {
      const handles = findHandles(source, {
        isSource: (target) => target.classList.contains(this.options.source),
        isHandle: (target) => target.classList.contains(this.options.handle!),
      });
      if (
        handles.length > 0 &&
        handles.every(
          (handle) => !closest(startEvent.target as Element, handle)
        )
      ) {
        return null;
      }
    }

    return source;
  }

  get dragging() {
    return this.source !== null;
  }

  /** Stops moving */
  abstract cancel(): void;

  /**
   * Attaches simulators event listeners to the DOM
   */
  abstract attach(): Simulator;

  /**
   * Detaches simulators event listeners to the DOM
   */
  abstract detach(): Simulator;
}
