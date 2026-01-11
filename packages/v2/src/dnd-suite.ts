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
  injectDndModel: typeof injectDndModel<Source, Dropzone>;
  DndContainer: DndContainerDefinition<Source, Dropzone>;
  DndSource: DistributeDndSourceDefinition<Source>;
  DndDropzone: DistributeDndDropzoneDefinition<Dropzone>;
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
