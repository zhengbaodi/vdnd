<template>
  <DndContainer :model="dnd">
    <DndSource label="image" :data="1">source1</DndSource>
    <DndSource label="image" :data="2">source2</DndSource>
    <DndSource label="image" :data="3">source3</DndSource>
  </DndContainer>
</template>

<script setup lang="ts">
import { useDndModel, DndContainer, DndSource } from '../vdnd';

const dnd = useDndModel();

dnd.defineInteraction({
  scope: '*',
  draggable(source) {
    if (source.label === 'image') {
      return source.data > 1;
    }
    return true;
  },
});

dnd.defineInteraction({
  scope: 's',
  source: 'text',
  draggable: false,
});

dnd.defineInteraction({
  scope: 's',
  source: 'image',
  draggable(source) {
    return source.data % 2 === 0;
  },
  onDragStart(e) {
    console.log('dragstart', e.source);
  },
  onDragPrevent(e) {
    console.log('dragprevent', e.source);
  },
});
</script>
