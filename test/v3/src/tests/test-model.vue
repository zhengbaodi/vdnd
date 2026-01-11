<template>
  <div>
    <div style="display: flex; margin-bottom: 10px">
      <div style="white-space: nowrap">
        <div>isDragging(): {{ dnd.isDragging() }},</div>
        <div>isDragging('text'): {{ dnd.isDragging('text') }},</div>
        <div>isDragging('image'): {{ dnd.isDragging('image') }},</div>
        <div>isDragging('image', 1): {{ dnd.isDragging('image', 1) }},</div>
      </div>
      <div style="white-space: nowrap">
        <div>isOver(): {{ dnd.isOver() }},</div>
        <div>isOver('canvas'): {{ dnd.isOver('canvas') }},</div>
        <div>isOver('whiteboard'): {{ dnd.isOver('whiteboard') }},</div>
        <div>isOver('whiteboard', 1): {{ dnd.isOver('whiteboard', 1) }},</div>
      </div>
    </div>
    <DndContainer :model="dnd">
      <DndSource label="image" :data="1"> image source1 </DndSource>
      <DndSource label="image" :data="1">image source1</DndSource>
      <DndSource label="image" :data="2">
        image source2
        <DndHandle>handle1</DndHandle>
      </DndSource>
      <DndSource label="text" data="text">
        text source1
        <DndHandle>handle2</DndHandle>
      </DndSource>
      <DndDropzone label="canvas" :data="1">canvas1</DndDropzone>
      <DndDropzone label="canvas" :data="2">canvas2</DndDropzone>
      <DndDropzone label="whiteboard" :data="1">whiteboard</DndDropzone>
      <DndDropzone label="whiteboard" :data="2">whiteboard</DndDropzone>
    </DndContainer>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted } from 'vue';
import {
  useDndModel,
  DndContainer,
  DndSource,
  DndHandle,
  DndDropzone,
  type DndElement,
} from '../vdnd';

const dnd = useDndModel();

onMounted(() => {
  console.log([
    dnd.findHTMLElement('container'),
    dnd.findHTMLElement('source', { label: 'image', data: 1 }),
    dnd.findHTMLElement('dropzone', { label: 'canvas', data: 1 }),
  ]);
  console.log(dnd.findHTMLElements('source'));
  console.log(dnd.findHTMLElements('source', 'image'));
  console.log(dnd.findHTMLElements('dropzone'));
  console.log(dnd.findHTMLElements('dropzone', 'canvas'));
  console.log(dnd.findHTMLElements('handle'));
  console.log(dnd.findHandlesIn({ label: 'image', data: 1 }));
  console.log(
    dnd.findHandlesIn(
      dnd.findHTMLElement('source', { label: 'image', data: 2 })!
    )
  );
});

dnd.defineInteraction({
  scope: '*',
  draggable(source) {
    if (source.label === 'image') {
      return source.data > 1;
    }
    return true;
  },
  droppable(dropzone) {
    return dropzone.data! > 1;
  },
  onDragStart(e) {
    console.log(
      `dragstart isDragging(%o):`,
      e.source,
      dnd.isDragging(e.source)
    );
    console.log(
      `dragstart isDragging(%o):`,
      (source: DndElement) => source.label === 'image',
      dnd.isDragging((source) => source.label === 'image')
    );
    console.log(
      `dragstart isDraggable(%o):`,
      e.source,
      dnd.isDraggable(e.source)
    );
    console.log(
      `dragstart isDraggable(${e.source.label}, ${e.source.data}):`,
      dnd.isDraggable(e.source.label, e.source.data)
    );
  },
  onDragPrevent(e) {
    console.log(
      `dragprevent isDraggable(%o):`,
      e.source,
      dnd.isDraggable(e.source)
    );
    console.log(
      `dragprevent isDraggable(${e.source.label}, ${e.source.data}):`,
      dnd.isDraggable(e.source.label, e.source.data)
    );
  },
  onDragEnter(e) {
    console.log(`dragenter isOver(%o):`, e.enter, dnd.isOver(e.enter));
    console.log(
      `dragenter isOver(%o):`,
      (dropzone: DndElement) => dropzone.label === 'canvas',
      dnd.isOver((dropzone) => dropzone.label === 'canvas')
    );
    console.log(
      `dragenter isDroppable(%o):`,
      e.enter,
      dnd.isDroppable(e.enter)
    );
    console.log(
      `dragenter isDroppable(${e.enter.label}, ${e.enter.data}):`,
      dnd.isDroppable(e.enter.label, e.enter.data)
    );
  },
  onDragEnd(e) {
    console.log(`dragend isDragging():`, dnd.isDragging());
    console.log(`dragend isOver():`, dnd.isOver());
    console.log(
      `dragend isDraggable(%o):`,
      e.source,
      dnd.isDraggable(e.source)
    );
    if (e.over) {
      console.log(`dragend isDroppable(%o):`, e.over, dnd.isDroppable(e.over));
    }
    nextTick(() => {
      console.log(`dragend(nextTick) isDragging():`, dnd.isDragging());
      console.log(`dragend(nextTick) isOver():`, dnd.isOver());
      console.log(
        `dragend(nextTick) isDraggable(%o):`,
        e.source,
        dnd.isDraggable(e.source)
      );
      if (e.over) {
        // should warn
        console.log(
          `dragend(nextTick) isDroppable(%o):`,
          e.over,
          dnd.isDroppable(e.over)
        );
      }
    });
  },
});
</script>
