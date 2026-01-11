import { DndSuite, type IDndSuite } from '@vdnd/v3';

type ImageSource = {
  label: 'image';
  data: number;
};
type TextSource = {
  label: 'text';
  data: string;
};
type UndefinedSource = {
  label: 'undefined';
  data: undefined;
};
type IDndSource = ImageSource | TextSource | UndefinedSource;

type CanvasDropzone = {
  label: 'canvas';
  data: number;
};
type WhiteboardDropzone = {
  label: 'whiteboard';
  data: number;
};
type UndefinedDropzone = {
  label: 'undefined';
  data: undefined;
};
type IDndDropzone = CanvasDropzone | WhiteboardDropzone | UndefinedDropzone;

const {
  useDndModel,
  injectDndModel,
  DndContainer,
  DndSource,
  DndDropzone,
  DndHandle,
} = DndSuite as IDndSuite<IDndSource, IDndDropzone>;

export {
  useDndModel,
  injectDndModel,
  DndContainer,
  DndSource,
  DndDropzone,
  DndHandle,
};

export type * from '@vdnd/v3';
