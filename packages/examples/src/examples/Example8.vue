<script setup lang="ts">
import { useMouseDnd, MouseDnd, DndSource } from '@vdnd/v3';
import useI18n from '../compositions/use-i18n';

const dnd = useMouseDnd({
  strict: true,
  suppressUIEvent: true,
});
const tip1 = useI18n({
  en: 'Drag me',
  'zh-cn': '拖拽我',
});
const tip2 = useI18n({
  en: 'Please ctrl+s',
  'zh-cn': '请尝试ctrl+s',
});
</script>

<template>
  <MouseDnd :instance="dnd" class="example8">
    <DndSource>
      {{ tip1 }}
    </DndSource>
    <p v-if="dnd.isDragging()">{{ tip2 }}</p>
  </MouseDnd>
</template>

<style lang="scss">
.example8 {
  .dnd-source {
    width: 130px;
    height: 130px;
    border: 1px dashed;
    display: flex;
    align-items: center;
    justify-content: center;
    &--dragging {
      opacity: 0.4;
    }
  }
}
</style>
