<template>
  <DndContainer :model="dnd">
    <DndSource label="image" :data="1">image source</DndSource>
    <div class="dnd-source" draggable="true">image source</div>
    <DndDropzone label="canvas" :data="1">canvas</DndDropzone>
  </DndContainer>
</template>

<script setup lang="ts">
import { useDndModel, DndContainer, DndSource, DndDropzone } from '../vdnd';

const dnd = useDndModel();

dnd.defineInteraction({
  scope: 's',
  source: 'image',
  onDragStart(e) {
    console.log('dragstart', e);
  },
  onDragEnter(e) {
    console.log('dragenter', e.enter);
  },
  onDragEnd(e) {
    console.log('dragend', e);
  },
});
</script>

<style lang="scss">
.uncontrolled-sources {
  display: flex;
  padding: 10px;
  border: 1px solid;

  & + .dnd-container {
    margin: 10px 0;
  }
}
</style>
