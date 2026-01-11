<template>
  <DndContainer :model="dnd">
    <DndSource label="image" :data="1">source</DndSource>
    <DndDropzone label="canvas" :data="1">canvas</DndDropzone>
  </DndContainer>
</template>

<script setup lang="ts">
import { useDndModel, DndContainer, DndSource, DndDropzone } from '../vdnd';

const dnd = useDndModel();

dnd.defineInteraction({
  scope: '*',
  onDrag(e) {
    console.log('scope:*, drag', e.over);
  },
  onDragEnter(e) {
    console.log('scope:*, dragenter', e.enter);
  },
  onDragOver(e) {
    console.log('scope:*, dragover', e.over);
  },
  onDragLeave(e) {
    console.log('scope:*, dragleave', e.leave);
  },
  onDrop(e) {
    console.log('scope:*, drop', e.dropzone);
  },
  onDragEnd(e) {
    console.log('scope:*, dragend', e.over);
  },
});

dnd.defineInteraction({
  scope: 's',
  source: 'image',
  onDrag(e) {
    console.log('scope:s, drag', e.over);
  },
  onDragEnter(e) {
    console.log('scope:s, dragenter', e.enter);
  },
  onDragOver(e) {
    console.log('scope:s, dragover', e.over);
  },
  onDragLeave(e) {
    console.log('scope:s, dragleave', e.leave);
  },
  onDrop(e) {
    console.log('scope:s, drop', e.dropzone);
  },
  onDragEnd(e) {
    console.log('scope:s, dragend', e.over);
  },
});

dnd.defineInteraction({
  scope: 'd',
  dropzone: 'canvas',
  onDrag(e) {
    console.log('scope:d, drag', e.over);
  },
  onDragEnter(e) {
    console.log('scope:d, dragenter', e.enter);
  },
  onDragOver(e) {
    console.log('scope:d, dragover', e.over);
  },
  onDragLeave(e) {
    console.log('scope:d, dragleave', e.leave);
  },
  onDrop(e) {
    console.log('scope:d, drop', e.dropzone);
  },
  onDragEnd(e) {
    console.log('scope:d, dragend', e.over);
  },
});

dnd.defineInteraction({
  scope: 's+d',
  source: 'image',
  dropzone: 'canvas',
  onDrag(e) {
    console.log('scope:s+d, drag', e.over);
  },
  onDragEnter(e) {
    console.log('scope:s+d, dragenter', e.enter);
  },
  onDragOver(e) {
    console.log('scope:s+d, dragover', e.over);
  },
  onDragLeave(e) {
    console.log('scope:s+d, dragleave', e.leave);
  },
  onDrop(e) {
    console.log('scope:s+d, drop', e.dropzone);
  },
  onDragEnd(e) {
    console.log('scope:s+d, dragend', e.over);
  },
});

dnd.defineInteraction({
  scope: 's',
  source: 'text',
  onDrag() {
    throw new Error('You will not see me!');
  },
  onDragEnter() {
    throw new Error('You will not see me!');
  },
  onDragOver() {
    throw new Error('You will not see me!');
  },
  onDragLeave() {
    throw new Error('You will not see me!');
  },
  onDrop() {
    throw new Error('You will not see me!');
  },
  onDragEnd() {
    throw new Error('You will not see me!');
  },
});

dnd.defineInteraction({
  scope: 'd',
  dropzone: 'whiteboard',
  onDrag() {
    throw new Error('You will not see me!');
  },
  onDragEnter() {
    throw new Error('You will not see me!');
  },
  onDragOver() {
    throw new Error('You will not see me!');
  },
  onDragLeave() {
    throw new Error('You will not see me!');
  },
  onDrop() {
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
  onDragEnter() {
    throw new Error('You will not see me!');
  },
  onDragOver() {
    throw new Error('You will not see me!');
  },
  onDragLeave() {
    throw new Error('You will not see me!');
  },
  onDrop() {
    throw new Error('You will not see me!');
  },
  onDragEnd() {
    throw new Error('You will not see me!');
  },
});
</script>
