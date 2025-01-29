<script setup lang="ts">
import { ref } from 'vue';
import { push, remove } from '@vdnd/v3';
import { useMouseDnd, MouseDnd, DndSource, DndDropzone } from '@vdnd/v3';
import useI18n from '../compositions/use-i18n';
import type { DropEvent } from '@vdnd/v3';

const dnd = useMouseDnd<number>({
  strict: true,
});

const left = ref([1, 2, 3]);
const right = ref<number[]>([]);

const onDrop = (e: DropEvent<number>) => {
  if (e.source.label === 'left' && e.dropzone.label == 'right') {
    push(right, remove(left, e.source.value!));
  }
};

const tip = useI18n({
  en: 'Drag here',
  'zh-cn': '拖到这里来',
});
</script>

<template>
  <MouseDnd :instance="dnd" class="example1" @drop="onDrop">
    <div>
      <DndSource
        v-for="(number, index) in left"
        :key="index"
        label="left"
        :value="index"
      >
        {{ number }}
      </DndSource>
    </div>
    <DndDropzone label="right">
      <div v-if="!right.length" class="empty">{{ tip }}</div>
      <div v-for="(number, index) in right" :key="index" class="right-box">
        {{ number }}
      </div>
    </DndDropzone>
  </MouseDnd>
</template>

<style lang="scss">
.example1 {
  display: flex;
  flex-flow: row nowrap;
  gap: 20px;

  $box_size: 130px;
  $box_margin: 20px;
  %source_box {
    width: $box_size;
    height: $box_size;
    border: 1px dashed;
    margin-bottom: $box_margin;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    &:last-child {
      margin-bottom: 0;
    }
  }

  .right-box {
    @extend %source_box;
  }

  .dnd-source {
    @extend %source_box;
    &--dragging {
      opacity: 0.4;
    }
  }

  .dnd-mirror {
    position: relative;
    z-index: 1;
  }

  .dnd-dropzone {
    $container_size: ($box_size * 3) + ($box_margin * 2);
    width: $container_size;
    height: $container_size;
    border: 1px dashed;
    display: flex;
    flex-flow: row nowrap;
    gap: $box_margin;
    position: relative;

    &--droppable {
      box-shadow: 0 0 4px 4px rgba(0, 0, 0, 0.2);
    }

    &--over {
      background-color: greenyellow;
    }

    .empty {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }
}
</style>
