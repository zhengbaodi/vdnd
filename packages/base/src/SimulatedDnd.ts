import AbstractDnd from './AbstractDnd';
import {
  DragEndSimulatorEvent,
  DragMoveSimulatorEvent,
  DragStartSimulatorEvent,
} from './simulators';
import {
  DragEvent,
  DragStartEvent,
  DragEnterEvent,
  DragMoveEvent,
  DragOverEvent,
  DragLeaveEvent,
  DragEndEvent,
  DragPreventEvent,
  DropEvent,
} from './DndEvent';
import { Mirror } from './plugins';
import closest from './closest';
import { emptyFn } from '@vdnd/shared';

import type { AbstractDndEventTable, AbstractDndOptions } from './AbstractDnd';
import type { EventSuppressor } from './EventSuppressor';
import type {
  Plugin,
  MirrorOptions,
  MirrorAttachedEvent,
  MirrorCreatedEvent,
  MirrorDetachedEvent,
  MirrorMoveEvent,
} from './plugins';
import type { Simulator, SimulatorWorkingEnv } from './simulators';

export type SimulatorConstructor = new (
  ...args: ConstructorParameters<typeof Simulator>
) => Simulator;

export type PluginConstructor = new (
  ...args: ConstructorParameters<typeof Plugin>
) => Plugin;

export type SimulatorDndEventTable = AbstractDndEventTable & {
  'drag:move': DragMoveEvent;
  'mirror:created': MirrorCreatedEvent;
  'mirror:attached': MirrorAttachedEvent;
  'mirror:move': MirrorMoveEvent;
  'mirror:detached': MirrorDetachedEvent;
};

export interface SimulatedDndOptions extends AbstractDndOptions {
  simulator: SimulatorConstructor;
  delay?: number;
  mirror?: MirrorOptions;
  eventSuppressor?: EventSuppressor;
}

export default class SimulatedDnd extends AbstractDnd<SimulatorDndEventTable> {
  static defaultPlugins = [Mirror];

  static eventTriggeringInterval = {
    drag: 50,
    dragover: 50,
  };

  private plugins: Plugin[] = [];

  private simulator: Simulator | null = null;
  /**
   * This is a mock: browser will suppress ui events while dragging.
   */
  private readonly eventSuppressor: EventSuppressor | null = null;

  /**
   * Triggers 'drag' event at regular interval
   */
  private runIntervalTaskForDrag!: (e: DragStartEvent) => void;
  private clearIntervalTaskForDrag = emptyFn;

  /**
   * Triggers 'drag:over' event at regular interval
   */
  private runIntervalTaskForDragOver!: (e: DragEnterEvent) => void;
  private clearIntervalTaskForDragOver = emptyFn;

  constructor(
    protected readonly container: HTMLElement,
    /** @readonly */
    public readonly options: SimulatedDndOptions
  ) {
    super(container, options);
    this.addPlugin(...SimulatedDnd.defaultPlugins);
    this.eventSuppressor = options.eventSuppressor || null;
    this.setSimulator(this.options.simulator);
    this.initIntervalTasks();
  }

  /**
   * Destroys dnd instance. This removes all internal event listeners and
   * deactivates simulator and plugins
   */
  destroy() {
    if (this.dragging) return;
    this.removePlugin(
      ...this.plugins.map((plugin) => plugin.constructor as PluginConstructor)
    );
    this.setSimulator(null);
    this.eventSuppressor?.destroy();
    super.destroy();
  }

  /**
   * Adds plugin to this dnd instance. This will end up calling the attach method of the plugin
   */
  addPlugin(...plugins: PluginConstructor[]) {
    const activePlugins = plugins.map((Plugin) => new Plugin(this));

    activePlugins.forEach((plugin) => plugin.attach());
    this.plugins = [...this.plugins, ...activePlugins];

    return this;
  }

  /**
   * Removes plugins that are already attached to this dnd instance. This will end up calling
   * the detach method of the plugin
   */
  removePlugin(...plugins: PluginConstructor[]) {
    const removedPlugins = this.plugins.filter((plugin) =>
      plugins.some((Plugin) => plugin instanceof Plugin)
    );

    removedPlugins.forEach((plugin) => plugin.detach());
    this.plugins = this.plugins.filter((plugin) =>
      plugins.some((Plugin) => plugin instanceof Plugin)
    );

    return this;
  }

  private initIntervalTasks() {
    this.runIntervalTaskForDrag = (e) => {
      const timer = setInterval(() => {
        if (!e.canceled() && this.dragging) {
          const event = new DragEvent(
            this.source!,
            this.currentOver,
            this.container,
            null
          );
          this.emit('drag', event);
        }
      }, SimulatedDnd.eventTriggeringInterval.drag);
      this.clearIntervalTaskForDrag = () => {
        clearInterval(timer);
        this.clearIntervalTaskForDrag = emptyFn;
      };
    };
    this.on('drag:start', this.runIntervalTaskForDrag);
    this.on('drag:end', () => this.clearIntervalTaskForDrag());

    this.runIntervalTaskForDragOver = () => {
      const timer = setInterval(() => {
        if (!this.dragging || !this.currentOver) return;
        const dragOverEvent = new DragOverEvent(
          this.source!,
          this.currentOver,
          this.container,
          null
        );
        this.emit('drag:over', dragOverEvent);
      }, SimulatedDnd.eventTriggeringInterval.dragover);
      this.clearIntervalTaskForDragOver = () => {
        clearInterval(timer);
        this.clearIntervalTaskForDragOver = emptyFn;
      };
    };
    this.on('drag:enter', this.runIntervalTaskForDragOver);
    this.on('drag:leave', () => this.clearIntervalTaskForDragOver());
  }

  /**
   * Adds simulator to this dnd instance.
   * This will end up calling the attach method of the simulator and binding drag events
   */
  private setSimulator(Simulator: SimulatorConstructor | null) {
    if (this.dragging) {
      return;
    }

    if (!Simulator) {
      this.simulator?.detach();
      this.simulator = null;
      return;
    }

    this.simulator?.detach();
    const env: SimulatorWorkingEnv = this.eventSuppressor
      ? {
          addEventListener: this.eventSuppressor.addAliveEventListener.bind(
            this.eventSuppressor
          ),
          removeEventListener:
            this.eventSuppressor.removeAliveEventListener.bind(
              this.eventSuppressor
            ),
        }
      : document;
    this.simulator = new Simulator(
      env,
      this.container,
      this.options,
      this.onDragStart.bind(this),
      this.onDragMove.bind(this),
      this.onDragEnd.bind(this)
    );
    this.simulator.attach();
    return this;
  }

  private onDragStart(event: DragStartSimulatorEvent) {
    if (this.dragging) return;
    if (!this.isDraggable(event.source)) {
      const dragPreventEvent = new DragPreventEvent(
        event.source,
        this.container,
        event.originalEvent
      );
      this.emit('drag:prevent', dragPreventEvent);
      event.cancel();
      return;
    }

    this.source = event.source;
    this.eventSuppressor?.enable();
    applyUserSelect(document.body, 'none');

    const dragStartEvent = new DragStartEvent(
      this.source,
      this.container,
      event.originalEvent,
      event.clientX,
      event.clientY
    );
    this.emit('drag:start', dragStartEvent);

    if (closest(this.source, this.options.dropzone)) {
      this.currentOver = this.source;
      const dragEnterEvent = new DragEnterEvent(
        this.source,
        this.source,
        this.container,
        event.originalEvent
      );
      this.emit('drag:enter', dragEnterEvent);
    }
  }

  private onDragMove(event: DragMoveSimulatorEvent) {
    if (!this.dragging) return;
    const dropzone =
      closest(event.target, this.container) &&
      closest(event.target, this.options.dropzone);

    const isLeavingCurrentDropzone = dropzone
      ? !!this.currentOver && dropzone !== this.currentOver
      : !!this.currentOver;
    const isEnterNewDropzone = dropzone && this.currentOver !== dropzone;

    let nextOver: Element | null = null;

    if (isEnterNewDropzone) {
      nextOver = dropzone;
      const dragEnterEvent = new DragEnterEvent(
        this.source!,
        dropzone,
        this.container,
        event.originalEvent
      );
      this.emit('drag:enter', dragEnterEvent);
    }

    if (isLeavingCurrentDropzone) {
      const dragLeaveEvent = new DragLeaveEvent(
        this.source!,
        this.currentOver!,
        this.container,
        event.originalEvent
      );
      this.emit('drag:leave', dragLeaveEvent);
      this.currentOver = null;
    }

    if (nextOver) {
      this.currentOver = nextOver;
    }

    const dragMoveEvent = new DragMoveEvent(
      this.source!,
      this.currentOver,
      this.container,
      event.originalEvent,
      event.clientX,
      event.clientY
    );
    this.emit('drag:move', dragMoveEvent);
  }

  private onDragEnd(event: DragEndSimulatorEvent) {
    if (!this.dragging) return;
    this.eventSuppressor?.disable();
    applyUserSelect(document.body, '');

    if (this.currentOver) {
      const isEsc = event.originalEvent instanceof KeyboardEvent;
      if (!isEsc && this.isDroppable(this.currentOver)) {
        const dropEvent = new DropEvent(
          this.source!,
          this.currentOver,
          this.container,
          event.originalEvent
        );
        this.emit('drop', dropEvent);
      } else {
        const dragLeaveEvent = new DragLeaveEvent(
          this.source!,
          this.currentOver,
          this.container,
          event.originalEvent
        );
        this.emit('drag:leave', dragLeaveEvent);
      }
    }

    const dragEndEvent = new DragEndEvent(
      this.source!,
      this.currentOver,
      this.container,
      event.originalEvent
    );
    this.emit('drag:end', dragEndEvent);

    this.source = null;
    this.currentOver = null;
  }
}

function applyUserSelect(element: HTMLElement, value: string) {
  element.style.webkitUserSelect = value;
  // @ts-expect-error
  element.style.mozUserSelect = value;
  // @ts-expect-error
  element.style.msUserSelect = value;
  // @ts-expect-error
  element.style.oUserSelect = value;
  element.style.userSelect = value;
}
