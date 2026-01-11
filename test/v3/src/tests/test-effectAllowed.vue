<template>
  <DndContainer :model="dnd">
    <DndSource label="image" :data="1">source</DndSource>
  </DndContainer>
</template>

<script setup lang="ts">
import { useDndModel, DndContainer, DndSource } from '../vdnd';

const dnd = useDndModel();

dnd.defineInteraction({
  scope: 's',
  source: 'image',
  onDragStart(e) {
    e.originalEvent.dataTransfer!.effectAllowed = 'copy';
  },
  onDragEnd(e) {
    console.log(e.originalEvent.dataTransfer!.effectAllowed);
  },
});
</script>
