<template>
  <DndContainer :model="dnd" class="test-dragleave_enter">
    <DndSource label="image" :data="1">image source</DndSource>
    <DndDropzone label="canvas" :data="1">canvas1</DndDropzone>
    <DndDropzone label="canvas" :data="2">canvas2</DndDropzone>
  </DndContainer>
</template>

<script setup lang="ts">
import { useDndModel, DndContainer, DndSource, DndDropzone } from '../vdnd';

const dnd = useDndModel();
dnd.defineInteraction({
  scope: 'd',
  dropzone: 'canvas',
  droppable(dropzone) {
    return dropzone.data > 1;
  },
  onDragEnter(e) {
    console.log('dragenter', e.enter);
  },
  onDragLeave(e) {
    console.log('dragleave', e.leave, e.enter);
  },
});
</script>

<style lang="scss">
.test-dragleave_enter {
  display: flex !important;
  .dnd-source {
    margin: 0 !important;
  }
  .dnd-dropzone {
    margin: 0 !important;
  }
}
</style>
