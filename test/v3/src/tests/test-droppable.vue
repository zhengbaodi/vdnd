<template>
  <DndContainer :model="dnd">
    <DndSource label="image" :data="1">image source</DndSource>
    <DndDropzone label="canvas" :data="1">canvas1</DndDropzone>
    <DndDropzone label="canvas" :data="2">canvas2</DndDropzone>
    <DndDropzone label="canvas" :data="3">canvas3</DndDropzone>
    <DndDropzone label="canvas" :data="4">canvas4</DndDropzone>
  </DndContainer>
</template>

<script setup lang="ts">
import { useDndModel, DndContainer, DndSource, DndDropzone } from '../vdnd';

const dnd = useDndModel();

dnd.defineInteraction({
  scope: '*',
  droppable(dropzone, source) {
    return dropzone.data! > 1 && source.label === 'image';
  },
});

dnd.defineInteraction({
  scope: 'd',
  dropzone: 'canvas',
  droppable(dropzone, source) {
    return dropzone.data % 2 == 0 && source.label === 'image';
  },
});

dnd.defineInteraction({
  scope: 'd',
  dropzone: 'whiteboard',
  droppable: false,
});

dnd.defineInteraction({
  scope: 's+d',
  source: 'text',
  dropzone: 'canvas',
  droppable: false,
});

dnd.defineInteraction({
  scope: 's+d',
  source: 'image',
  dropzone: 'canvas',
  droppable(dropzone, source) {
    return dropzone.data > 3 && source.label === 'image';
  },
  onDrop(e) {
    console.log('drop', e.dropzone);
  },
  onDragEnd(e) {
    console.log('dragend', e.over);
  },
});
</script>
