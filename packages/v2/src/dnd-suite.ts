import {
  DndContainer,
  type DndContainerDefinition,
} from './components/dnd-container';
import {
  DndSource,
  type DistributeDndSourceDefinition,
} from './components/dnd-source';
import {
  DndDropzone,
  type DistributeDndDropzoneDefinition,
} from './components/dnd-dropzone';
import { DndHandle } from './components/dnd-handle';
import type { DndElement } from './dnd-element';
import { useDndModel, injectDndModel } from './dnd-model';

export type IDndSuite<
  Source extends DndElement = DndElement,
  Dropzone extends DndElement = DndElement,
> = {
  useDndModel: typeof useDndModel<Source, Dropzone>;
  /**
   * Inject the dnd-model provided by the `DndContainer`.
   *
   * The `DndContainer` will provide the model it received for its descendant components.
   */
  injectDndModel: typeof injectDndModel<Source, Dropzone>;
  /**
   * `DndContainer` defines the boundaries for drag-and-drop (DND) interactions and performs two key functions:
   *
   * 1、It detects DND interactions occurring within the container and synchronizes them with the `model`.
   * Example: When a user drags a source and selects an element as the current drop target, the `DndContainer` calls the `onDragStart` and `onDragEnter` callbacks in the `model`.
   *
   * 2、It influences actual user interactions based on the interaction properties of the `model`.
   * Example: If the `draggable` property of a source is set to false, the `DndContainer` prevents the user from dragging that source and calls the `onDragPrevent` callbacks in the `model`.
   */
  DndContainer: DndContainerDefinition<Source, Dropzone>;
  /**
   * `DndSource` represents an element that is allowed to be dragged, which we refer to as the "source".
   *
   * The source supports marking its type using the `label` property and binding custom data via the `data` property.
   */
  DndSource: DistributeDndSourceDefinition<Source>;
  /**
   * `DndDropzone` represents an area where the current drag source can be dropped, which we refer to as the "drop target".
   *
   * The drop target supports marking its type using the `label` property and binding custom data via the `data` property.
   */
  DndDropzone: DistributeDndDropzoneDefinition<Dropzone>;
  /**
   * `DndHandle` is the drag trigger for the source(`<DndSource />`).
   *
   * If we want to drag a source that contains drag triggers, we can only drag the source by dragging one of the triggers.
   *
   * Dragging other elements in the source will not put the source into drag mode, and the entire DND interaction will not begin.
   */
  DndHandle: typeof DndHandle;
};

export const DndSuite = {
  useDndModel,
  injectDndModel,
  DndContainer,
  DndSource,
  DndDropzone,
  DndHandle,
} as IDndSuite;

DndSuite.useDndModel;
