<template>
  <div>
    <div class="outside-dropzones">
      <DndDropzone
        v-for="i in outsideCount"
        :key="i"
        label="canvas"
        :data="1"
        class="dnd-dropzone"
      >
        canvas
      </DndDropzone>
    </div>
    <DndContainer :model="dnd">
      <DndSource label="image" :data="1">image source</DndSource>
      <DndDropzone label="canvas" :data="1">canvas</DndDropzone>
    </DndContainer>
    <button @click="outsideCount++">add an outside dropzone</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
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

const outsideCount = ref(1);
</script>

<style lang="scss">
.outside-dropzones {
  display: flex;
  padding: 10px;
  border: 1px solid;

  & + .dnd-container {
    margin: 10px 0;
  }
}
</style>
