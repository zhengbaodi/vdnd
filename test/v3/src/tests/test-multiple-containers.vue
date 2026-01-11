<template>
  <div>
    <DndContainer :model="dnd1">
      <DndSource label="image" :data="1">source</DndSource>
      <DndDropzone label="canvas" :data="1">canvas</DndDropzone>
    </DndContainer>
    <DndContainer :model="dnd2" style="margin-top: 10px">
      <DndSource label="image" :data="1">source</DndSource>
      <DndDropzone label="canvas" :data="1">canvas</DndDropzone>
    </DndContainer>
  </div>
</template>

<script setup lang="ts">
import { useDndModel, DndContainer, DndSource, DndDropzone } from '../vdnd';

const dnd1 = useDndModel();
dnd1.defineInteraction({
  scope: '*',
  onDragStart(e) {
    console.log('container1 dragstart', e);
  },
  onDragEnter(e) {
    console.log('container1 dragenter', e);
  },
  onDrop(e) {
    console.log('container1 drop', e);
  },
  onDragEnd(e) {
    console.log('container1 dragend', e);
  },
});

const dnd2 = useDndModel();
dnd2.defineInteraction({
  scope: '*',
  onDragStart(e) {
    console.log('container2 dragstart', e);
  },
  onDragEnter(e) {
    console.log('container2 dragenter', e);
  },
  onDrop(e) {
    console.log('container2 drop', e);
  },
  onDragEnd(e) {
    console.log('container2 dragend', e);
  },
});
</script>
