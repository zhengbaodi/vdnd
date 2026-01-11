<template>
  <DndContainer :model="dnd">
    <DndSource label="text" data="text" />
    <DndSource label="image" :data="1" />
    <DndSource label="undefined" />
    <DndDropzone label="canvas" :data="1" />
    <DndDropzone label="whiteboard" :data="1" />
    <DndDropzone label="undefined" />
  </DndContainer>
</template>

<script setup lang="ts">
import { useDndModel, DndContainer, DndSource, DndDropzone } from '../vdnd';

const dnd = useDndModel();
</script>
