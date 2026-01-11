<template>
  <DndContainer :model="dnd">
    <DndSource label="image" :data="1">image source</DndSource>
    <DndDropzone label="canvas" :data="1">canvas</DndDropzone>
  </DndContainer>
</template>

<script setup lang="ts">
import { useDndModel, DndContainer, DndSource, DndDropzone } from '../vdnd';

const dnd = useDndModel();

dnd.defineInteraction({
  scope: 's+d',
  source: 'image',
  dropzone: 'canvas',
  onDragEnd() {
    console.log('scope:s+d, dragend');
  },
});

dnd.defineInteraction({
  scope: 'd',
  dropzone: 'canvas',
  onDragEnd() {
    console.log('scope:d, dragend');
  },
});

dnd.defineInteraction({
  scope: 's',
  source: 'image',
  onDragEnd() {
    console.log('scope:s, dragend');
  },
});

dnd.defineInteraction({
  scope: '*',
  onDragEnd() {
    console.log('scope:*, dragend');
  },
});
</script>
