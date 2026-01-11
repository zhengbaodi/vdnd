<template>
  <DndContainer :model="dnd">
    <DndSource label="image" :data="1">source1</DndSource>
    <DndSource label="image" :data="2">source2</DndSource>
    <DndSource label="image" :data="3">source3</DndSource>
    <DndDropzone label="canvas" :data="1">canvas</DndDropzone>
  </DndContainer>
</template>

<script setup lang="ts">
import { useDndModel, DndContainer, DndSource, DndDropzone } from '../vdnd';

const dnd = useDndModel();

dnd.defineInteraction({
  scope: '*',
  onDrag(e) {
    console.log('scope:*, drag', e.source);
  },
  onDragStart(e) {
    console.log('scope:*, dragstart', e.source);
  },
  onDragPrevent(e) {
    console.log('scope:*, dragprevent', e.source);
  },
  onDragEnd(e) {
    console.log('scope:*, dragend', e.source);
  },
});

dnd.defineInteraction({
  scope: 's',
  source: 'image',
  draggable(source) {
    return source.data > 1;
  },
  onDrag(e) {
    console.log('scope:s, drag', e.source);
  },
  onDragStart(e) {
    console.log('scope:s, dragstart', e.source);
  },
  onDragPrevent(e) {
    console.log('scope:s, dragprevent', e.source);
  },
  onDragEnd(e) {
    console.log('scope:s, dragend', e.source);
  },
});

dnd.defineInteraction({
  scope: 's+d',
  source: 'image',
  dropzone: 'canvas',
  onDrag(e) {
    console.log('scope:s+d, drag', e.source);
  },
  onDragEnd(e) {
    console.log('scope:s+d, dragend', e.source);
  },
});

dnd.defineInteraction({
  scope: 's',
  source: 'text',
  onDrag() {
    throw new Error('You will not see me!');
  },
  onDragStart() {
    throw new Error('You will not see me!');
  },
  onDragPrevent() {
    throw new Error('You will not see me!');
  },
});

dnd.defineInteraction({
  scope: 'd',
  dropzone: 'whiteboard',
  onDrag() {
    throw new Error('You will not see me!');
  },
  onDragEnd() {
    throw new Error('You will not see me!');
  },
});

dnd.defineInteraction({
  scope: 's+d',
  source: 'text',
  dropzone: 'canvas',
  onDrag() {
    throw new Error('You will not see me!');
  },
  onDragEnd() {
    throw new Error('You will not see me!');
  },
});
</script>
