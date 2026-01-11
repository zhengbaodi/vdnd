<template>
  <DndContainer :model="dnd">
    <DndSource label="image" :data="1">source</DndSource>
    <DndDropzone label="canvas" :data="1">canvas</DndDropzone>
    <DndDropzone label="whiteboard" :data="1">whiteboard</DndDropzone>
  </DndContainer>
</template>

<script setup lang="ts">
import { useDndModel, DndContainer, DndSource, DndDropzone } from '../vdnd';

const dnd = useDndModel();

dnd.defineInteraction({
  scope: 's',
  source: 'image',
  onDragStart(e) {
    console.log(e.originalEvent.dataTransfer!.effectAllowed);
  },
});

dnd.defineInteraction({
  scope: 's+d',
  source: 'image',
  dropzone: 'canvas',
  droppable: true,
  dropEffect: 'link',
  onDragEnter(e) {
    console.log(e.originalEvent.dataTransfer!.effectAllowed);
    e.originalEvent.dataTransfer!.dropEffect = 'none';
  },
});

dnd.defineInteraction({
  scope: 'd',
  dropzone: 'whiteboard',
  droppable: false,
  onDragEnter(e) {
    e.originalEvent.dataTransfer!.dropEffect = 'copy';
  },
});
</script>
