<template>
  <DndContainer :model="dnd">
    <DndSource label="text">text source</DndSource>
    <DndSource label="image">image source</DndSource>
    <DndDropzone label="canvas">canvas</DndDropzone>
  </DndContainer>
</template>

<script setup lang="ts">
import { DndSuite, type IDndSuite } from '@vdnd/v3';

type ImageSource = {
  label: 'image';
  data: undefined;
};
type TextSource = {
  label: 'text';
  data: undefined;
};
type IDndSource = ImageSource | TextSource;

type CanvasDropzone = {
  label: 'canvas';
  data: undefined;
};
type IDndDropzone = CanvasDropzone;

const { useDndModel, DndContainer, DndSource, DndDropzone } =
  DndSuite as IDndSuite<IDndSource, IDndDropzone>;

const dnd = useDndModel({
  classes: {
    container: 'dnd-container', // default
    source: 'dnd-source', // default
    dropzone: 'dnd-dropzone', // default
    handle: 'dnd-handle', // default
    'source:dragging': 'is-dragging', // default: `${source}--dragging`
    'source:draggable': 'is-draggable', // default: `${source}--draggable`
    'source:disabled': 'is-disabled', // default: `${source}--disabled`
    'dropzone:over': 'is-over', // default: `${dropzone}--over`
    'dropzone:droppable': 'is-droppable', // default: `${dropzone}--droppable`
    'dropzone:disabled': 'is-disabled', // default: `${dropzone}--disabled`
  },
  interactions: [],
});
</script>
