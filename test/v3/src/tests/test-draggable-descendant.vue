<template>
  <DndContainer :model="dnd">
    <DndSource label="image" :data="1">
      <img src="../assets/dnd.svg" width="32" />
      <input value="123" />
      <span style="border: 1px solid" draggable="true">draggable</span>
      <span> plain text </span>
      <a href="#">link</a>
    </DndSource>
    <DndSource label="image" :data="2">
      <DndHandle>handle</DndHandle>
      <img src="../assets/dnd.svg" width="32" />
      <input value="123" />
      <span style="border: 1px solid" draggable="true">draggable</span>
      <span> plain text </span>
      <a href="#">link</a>
    </DndSource>
    <DndSource label="image" :data="3">
      <DndHandle>handle</DndHandle>
      <img src="../assets/dnd.svg" width="32" />
      <input value="123" />
      <span style="border: 1px solid" draggable="true">draggable</span>
      <span> plain text </span>
      <a href="#">link</a>
    </DndSource>
    <DndSource label="image" :data="4">
      <img src="../assets/dnd.svg" width="32" />
      <input value="123" />
      <span style="border: 1px solid" draggable="true">draggable</span>
      <span> plain text </span>
      <a href="#">link</a>
    </DndSource>
    <DndDropzone label="canvas" :data="1">
      canavs
      <input value="123" />
    </DndDropzone>
    <div>
      <input value="123" />
    </div>
  </DndContainer>
</template>

<script setup lang="ts">
import {
  useDndModel,
  DndContainer,
  DndSource,
  DndHandle,
  DndDropzone,
} from '../vdnd';

const dnd = useDndModel();

dnd.defineInteraction({
  scope: 's',
  source: 'image',
  draggable(source) {
    return source.data <= 2;
  },
});

dnd.defineInteraction({
  scope: 's+d',
  source: 'image',
  dropzone: 'canvas',
  onDrop(e) {
    console.log('drop', e);
  },
});
</script>

<style scoped>
input {
  display: inline-block;
  width: 50%;
  /* font-family: Arial, Helvetica, sans-serif;
  font-size: 20px; */
}
</style>
