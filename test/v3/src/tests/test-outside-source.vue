<template>
  <div>
    <div class="outside-sources">
      <DndSource
        v-for="i in outsideCount"
        :key="i"
        label="image"
        :data="1"
        class="dnd-source"
        draggable="true"
      >
        image source
      </DndSource>
    </div>
    <DndContainer :model="dnd">
      <DndSource label="image" :data="1">image source</DndSource>
      <DndDropzone label="canvas" :data="1">canvas</DndDropzone>
    </DndContainer>
    <button @click="outsideCount++">add an outside source</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useDndModel, DndContainer, DndSource, DndDropzone } from '../vdnd';

const dnd = useDndModel();

dnd.defineInteraction({
  scope: 's',
  source: 'image',
  onDragStart(e) {
    console.log('dragstart', e);
  },
  onDragEnd(e) {
    console.log('dragend', e);
  },
});

const outsideCount = ref(1);
</script>

<style lang="scss">
.outside-sources {
  display: flex;
  padding: 10px;
  border: 1px solid;

  & + .dnd-container {
    margin: 10px 0;
  }
}
</style>
