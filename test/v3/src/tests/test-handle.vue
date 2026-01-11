<template>
  <DndContainer :model="dnd">
    <DndSource label="image" :data="1">
      <DndHandle>handle1</DndHandle>
    </DndSource>
    <DndSource label="image" :data="2">
      <DndHandle>handle2</DndHandle>
    </DndSource>
  </DndContainer>
</template>

<script setup lang="ts">
import { useDndModel, DndContainer, DndSource, DndHandle } from '../vdnd';

const dnd = useDndModel();

dnd.defineInteraction({
  scope: 's',
  source: 'image',
  draggable(source) {
    return source.data > 1;
  },
  onDragStart(e) {
    console.log('dragstart', e.source);
  },
  onDragPrevent(e) {
    console.log('dragprevent', e.source);
  },
});
</script>
