import { type DefineSetupFnComponent } from 'vue';
import {
  DndContainer,
  type DndContainerProps,
} from './components/dnd-container';
import {
  DndSource,
  type DistributeDndSourceProps,
} from './components/dnd-source';
import {
  DndDropzone,
  type DistributeDndDropzoneProps,
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
  DndContainer: DefineSetupFnComponent<DndContainerProps<Source, Dropzone>>;
  DndSource: DefineSetupFnComponent<DistributeDndSourceProps<Source>>;
  DndDropzone: DefineSetupFnComponent<DistributeDndDropzoneProps<Dropzone>>;
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
