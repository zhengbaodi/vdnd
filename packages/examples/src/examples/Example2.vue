<script setup lang="ts">
import { ref } from 'vue';
import { swap } from '@vdnd/v3';
import { useMouseDnd, MouseDnd, DndSource } from '@vdnd/v3';
import type { DropEvent } from '@vdnd/v3';
const dnd = useMouseDnd({
  strict: true,
});
const ids = ref([1, 2, 3, 4, 5, 6, 7, 8, 9]);
const onDrop = (e: DropEvent<number>) => {
  swap(ids, e.source.value!, e.dropzone.value!);
};
</script>

<template>
  <MouseDnd :instance="dnd" class="example2" @drop="onDrop">
    <DndSource
      v-for="(value, index) in ids"
      :key="value"
      :value="index"
      dropzone
      droppable
    >
      {{ value }}
    </DndSource>
  </MouseDnd>
</template>

<style lang="scss">
.example2 {
  $box_size: 130px;
  $box_margin: 20px;

  width: $box_size * 3 + $box_margin * 2;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: $box_margin;

  .dnd-source {
    width: $box_size;
    height: $box_size;
    border: 1px dashed;
    display: flex;
    align-items: center;
    justify-content: center;
    &--dragging {
      opacity: 0.4;
    }
  }

  .dnd-dropzone {
    &--droppable {
      box-shadow: 0 0 3px 3px rgba(0, 0, 0, 0.2);
    }

    &--over {
      background-color: greenyellow;
    }
  }
}
</style>
