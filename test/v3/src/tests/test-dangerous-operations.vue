<template>
  <DndContainer v-if="showContainer" :model="dnd">
    <DndSource label="image" :data="1">image source1</DndSource>
    <DndSource label="image" :data="2">image source2</DndSource>
    <DndSource label="image" :data="3">image source3</DndSource>
    <DndDropzone label="canvas" :data="1">canvas1</DndDropzone>
    <DndDropzone label="canvas" :data="2">canvas2</DndDropzone>
  </DndContainer>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useDndModel, DndContainer, DndSource, DndDropzone } from '../vdnd';

const showContainer = ref(true);

const dnd = useDndModel();

dnd.defineInteraction({
  scope: '*',
  onDragStart(e) {
    setTimeout(() => {
      if (e.source.data == 3) {
        showContainer.value = false;
      } else {
        dnd.findHTMLElement('source', e.source)!.remove();
      }
    }, 200);
  },
  onDragEnter(e) {
    const htmlEl = dnd.findHTMLElement('dropzone', e.enter);
    setTimeout(() => {
      htmlEl?.remove();
    }, 200);
  },
  onDragLeave() {
    console.log('dragleave');
  },
  onDrop() {
    console.log('drop');
  },
  onDragEnd() {
    console.log('dragend');
  },
});
</script>
