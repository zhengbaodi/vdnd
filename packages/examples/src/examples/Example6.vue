<script setup lang="ts">
import { ref, reactive } from 'vue';
import { remove, unshift, push, swap, shift } from '@vdnd/v3';
import { useMouseDnd, MouseDnd, DndSource, DndDropzone } from '@vdnd/v3';
import useI18n from '../compositions/use-i18n';
import type { DropEvent } from '@vdnd/v3';

const left = reactive([1, 2, 3, 4, 5]);
const rightTop = ref<number>();
const rightBottom = reactive<number[]>([]);
const maxRightBottomCount = 3;
const isOnlyLeft = () =>
  rightTop.value === undefined && rightBottom.length === 0;

const dnd = useMouseDnd<number>({
  strict: true,
  mirror: {
    constrainDimensions: true,
  },
});
const isDraggingLeft = () => dnd.isDragging('left');
const isDraggingRight = () =>
  dnd.isDragging(['right-top-item', 'right-bottom-item']);

const onDrop = (e: DropEvent<number>) => {
  const { source, dropzone } = e;

  if (source.label === 'left') {
    switch (dropzone.label) {
      case 'right-top-hint': {
        rightTop.value = remove(left, source.value!);
        break;
      }
      case 'right-top-item': {
        unshift(rightBottom, rightTop.value);
        rightTop.value = remove(left, source.value!);
        if (rightBottom.length > maxRightBottomCount) {
          push(left, ...rightBottom.slice(maxRightBottomCount));
          rightBottom.length = maxRightBottomCount;
        }
        break;
      }
      case 'right-bottom-item': {
        swap(left, source.value!, rightBottom, dropzone.value!);
        break;
      }
      case 'right-bottom-hint': {
        push(rightBottom, remove(left, source.value!));
        break;
      }
    }
  }

  if (source.label === 'right-top-item') {
    switch (dropzone.label) {
      case 'left-hint': {
        push(left, rightTop.value);
        rightTop.value = shift(rightBottom);
        break;
      }
      case 'right-bottom-item': {
        const id = rightBottom[dropzone.value!];
        rightBottom[dropzone.value!] = rightTop.value!;
        rightTop.value = id;
        break;
      }
    }
  }

  if (source.label === 'right-bottom-item') {
    switch (dropzone.label) {
      case 'left-hint': {
        push(left, remove(rightBottom, source.value!));
        break;
      }
      case 'right-top-item': {
        const id = rightBottom[source.value!];
        rightBottom[source.value!] = rightTop.value!;
        rightTop.value = id;
        break;
      }
      case 'right-bottom-item': {
        swap(rightBottom, source.value!, dropzone.value!);
        return;
      }
    }
  }
};

const tip = useI18n({
  en: 'Drag here',
  'zh-cn': '拖到这里来',
});
</script>

<template>
  <MouseDnd :instance="dnd" class="example6" @drop="onDrop">
    <div class="left">
      <DndSource
        v-for="(value, index) in left"
        :key="value"
        label="left"
        :value="index"
        class="left-card"
      >
        {{ value }}
      </DndSource>
      <DndDropzone
        v-if="isDraggingRight()"
        label="left-hint"
        class="left-card left-hint small"
      >
        {{ tip }}
      </DndDropzone>
    </div>
    <div class="right">
      <DndDropzone
        v-if="isOnlyLeft()"
        label="right-top-hint"
        class="right-top-hint large"
      >
        {{ tip }}
      </DndDropzone>
      <template v-else>
        <DndSource
          label="right-top-item"
          dropzone
          class="right-top-item large"
          :style="{
            height: isDraggingLeft() || rightBottom.length ? '80%' : '100%',
          }"
        >
          {{ rightTop }}
        </DndSource>
        <div
          class="right-bottom"
          :class="{
            full: rightBottom.length === maxRightBottomCount,
            empty: !isDraggingLeft() && rightBottom.length === 0,
          }"
        >
          <DndSource
            v-for="(value, index) in rightBottom"
            :key="value"
            label="right-bottom-item"
            :value="index"
            dropzone
            class="right-bottom-item medium"
          >
            {{ value }}
          </DndSource>
          <template
            v-if="isDraggingLeft() && rightBottom.length < maxRightBottomCount"
          >
            <DndDropzone
              label="right-bottom-hint"
              class="right-bottom-hint right-bottom-item medium"
            >
              {{ tip }}
            </DndDropzone>
          </template>
        </div>
      </template>
    </div>
  </MouseDnd>
</template>

<style lang="scss">
.example6 {
  width: 800px;
  height: 500px;
  display: flex;
  flex-flow: row nowrap;
  align-items: stretch;
  gap: 20px;

  .dnd-source {
    &--dragging {
      opacity: 0.4;
    }
  }

  .dnd-dropzone {
    &--over {
      background-color: greenyellow;
    }

    &--droppable {
      &.large {
        box-shadow: 0 0 4px 4px rgba(0, 0, 0, 0.2);
      }

      &.medium {
        box-shadow: 0 0 3px 3px rgba(0, 0, 0, 0.2);
      }

      &.small {
        box-shadow: 0 0 2px 2px rgba(0, 0, 0, 0.2);
      }
    }
  }

  .left {
    flex: 0 0 20%;
    box-sizing: border-box;
    border: 1px solid;
    padding: 12px;

    &-card {
      height: 60px;
      line-height: 60px;
      text-align: center;
      border: 1px solid;
      margin-bottom: 12px;
      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  .right {
    width: 0;
    flex: 1 0 auto;
    box-sizing: border-box;
    border: 1px solid;
    padding: 12px;
    display: flex;
    flex-flow: column nowrap;
    gap: 12px;

    &-top-hint {
      width: 100%;
      height: 100%;
      border: 1px solid;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    &-top-item {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid;
    }

    &-bottom {
      height: 0;
      flex: 1 0 auto;
      width: 100%;
      display: flex;
      flex-flow: row nowrap;
      justify-content: center;
      gap: 12px;

      &.empty {
        display: none;
      }

      &.full {
        justify-content: space-between;
      }

      &-item {
        flex: 0 1 33%;
        height: 100%;
        border: 1px solid;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }
}
</style>
