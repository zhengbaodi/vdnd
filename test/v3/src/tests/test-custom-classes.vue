<template>
  <DndContainer :model="dnd">
    <DndSource label="image" :data="1">source</DndSource>
    <DndSource label="image" :data="2">source</DndSource>
    <DndDropzone label="canvas" :data="1">canvas</DndDropzone>
    <DndDropzone label="canvas" :data="2">canvas</DndDropzone>
  </DndContainer>
</template>

<script setup lang="ts">
import { useDndModel, DndContainer, DndSource, DndDropzone } from '../vdnd';

const dnd = useDndModel({
  classes: {
    container: 'DND-container',
    source: 'DND-source',
    dropzone: 'DND-dropzone',
    handle: 'DND-handle',
    'source:dragging': 'is-dragging', // default: `${source}--dragging`
    'source:draggable': 'is-draggable', // default: `${source}--draggable`
    'source:disabled': 'is-disabled', // default: `${source}--disabled`
    'dropzone:over': 'is-over', // default: `${dropzone}--over`
    'dropzone:droppable': 'is-droppable', // default: `${dropzone}--droppable`
    'dropzone:disabled': 'is-disabled', // default: `${dropzone}--disabled`
  },
  interactions: [],
});

dnd.defineInteraction({
  scope: 's',
  source: 'image',
  draggable(source) {
    return source.data > 1;
  },
});

dnd.defineInteraction({
  scope: 'd',
  dropzone: 'canvas',
  droppable(dropzone) {
    return dropzone.data > 1;
  },
});
</script>

<style lang="scss">
.DND-container {
  padding: 10px;
  border: 1px solid;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  height: fit-content;
}

.DND-source {
  width: 120px;
  height: 120px;
  margin: 5px;
  border: 1px dashed;

  &.is-draggable {
    opacity: 1;
  }

  &.is-dragging {
    opacity: 0.4;
  }

  &.is-disabled {
    background-color: rgba(0, 0, 0, 0.1);
  }
}

.DND-dropzone {
  width: 120px;
  height: 120px;
  margin: 5px;
  border: 1px dashed;

  &.is-over {
    background-color: greenyellow;
  }

  &.is-droppable {
    box-shadow: 0 0 2px 2px rgba(0, 0, 0, 0.2);
  }

  &.is-disabled {
    background-color: rgba(0, 0, 0, 0.1);
  }
}

.DND-handle {
  padding: 4px 8px;
  background-color: rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
}
</style>
