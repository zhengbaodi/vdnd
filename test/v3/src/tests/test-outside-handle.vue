<template>
  <div>
    <DndHandle v-for="i in outsideCount" :key="i" class="dnd-handle">
      handle
    </DndHandle>
    <DndContainer :model="dnd" style="margin: 10px 0">
      <DndSource label="image" :data="1">
        <DndHandle>handle</DndHandle>
      </DndSource>
      <DndHandle v-for="i in outsideCount" :key="i" class="dnd-handle">
        handle
      </DndHandle>
    </DndContainer>
    <button @click="outsideCount++">add two outside handles</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useDndModel, DndContainer, DndSource, DndHandle } from '../vdnd';

const dnd = useDndModel();

dnd.defineInteraction({
  scope: 's',
  source: 'image',
  onDragStart(e) {
    console.log('dragstart', e.source);
  },
});

const outsideCount = ref(1);
</script>
