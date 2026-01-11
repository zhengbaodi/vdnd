<template>
  <div>
    <DndContainer v-if="showContainer" :model="dnd">
      <DndSource label="image" :data="1">
        image source1
        <DndHandle>handle1</DndHandle>
      </DndSource>
      <DndDropzone label="canvas" :data="1">canvas1</DndDropzone>
      <DndDropzone label="whiteboard" :data="1">whiteboard</DndDropzone>
    </DndContainer>
    <button v-if="showContainer" @click="showContainer = false">
      hide container
    </button>
    <button v-else @click="showContainer = true">show container</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUpdated } from 'vue';
import {
  useDndModel,
  DndContainer,
  DndSource,
  DndHandle,
  DndDropzone,
} from '../vdnd';

const dnd = useDndModel();
dnd.defineInteraction({
  scope: '*',
  onDragStart(e) {
    console.log('dragstart', e);
  },
});

const showContainer = ref(true);

onMounted(() => {
  console.log([
    dnd.initialized,
    dnd.findHTMLElement('container'),
    ...dnd.findHTMLElements('source'),
    ...dnd.findHTMLElements('handle'),
    ...dnd.findHTMLElements('dropzone'),
  ]);
});
onUpdated(() => {
  console.log([
    dnd.initialized,
    dnd.findHTMLElement('container'),
    ...dnd.findHTMLElements('source'),
    ...dnd.findHTMLElements('handle'),
    ...dnd.findHTMLElements('dropzone'),
  ]);
});
</script>
