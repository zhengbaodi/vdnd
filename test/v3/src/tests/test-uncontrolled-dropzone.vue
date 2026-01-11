<template>
  <DndContainer :model="dnd">
    <DndSource label="image" :data="1">image source</DndSource>
    <DndDropzone label="canvas" :data="1">canvas</DndDropzone>
    <div class="dnd-dropzone">canvas</div>
  </DndContainer>
</template>

<script setup lang="ts">
import { useDndModel, DndContainer, DndSource, DndDropzone } from '../vdnd';

const dnd = useDndModel();

dnd.defineInteraction({
  scope: 's+d',
  source: 'image',
  dropzone: 'canvas',
  onDragEnter(e) {
    console.log('dragenter', e.enter);
  },
  onDragLeave(e) {
    console.log('dragleave', e.leave);
  },
  onDrop(e) {
    console.log('drop', e.dropzone);
  },
});
</script>

<style lang="scss">
.uncontrolled-dropzones {
  display: flex;
  padding: 10px;
  border: 1px solid;

  & + .dnd-container {
    margin: 10px 0;
  }
}
</style>
