<script setup lang="ts">
import { ref } from 'vue';
import { push, remove } from '@vdnd/v3';
import { useNativeDnd, NativeDnd, DndSource, DndDropzone } from '@vdnd/v3';
import useI18n from '../compositions/use-i18n';
import type {
  // @ts-ignore
  DragEnterEvent,
  // @ts-ignore
  DragOverEvent,
  DragStartEvent,
  DropEvent,
} from '@vdnd/v3';

const dnd = useNativeDnd<number>({
  strict: true,
});

type Moveable = boolean;
const left = ref<Moveable[]>([false, true, true]);
const right = ref([]);

// The first implemention:
const onDragStart = (e: DragStartEvent<number>) => {
  const moveable = left.value[e.source.value!];
  // vdnd will automatically update 'dropEffect' based on 'effectAllowed'
  (e.originalEvent as globalThis.DragEvent).dataTransfer!.effectAllowed =
    moveable ? 'move' : 'copy';
};
//

// the second implemention:
// const onDragEnter = (e: DragEnterEvent<number>) => {
//   if (e.enter.droppable) {
//     const moveable = left.value[e.source.value!];
//     (e.originalEvent as globalThis.DragEvent).dataTransfer!.dropEffect =
//       moveable ? 'move' : 'copy';
//   }
// };
// const onDragOver = (e: DragOverEvent<number>) => {
//   if (e.over.droppable) {
//     const moveable = left.value[e.source.value!];
//     (e.originalEvent as globalThis.DragEvent).dataTransfer!.dropEffect =
//       moveable ? 'move' : 'copy';
//   }
// };
//

const onDrop = (e: DropEvent<number>) => {
  if (e.source.label === 'left' && e.dropzone.label === 'right') {
    const moveable = e.source.value;
    if (moveable) {
      push(right, remove(left, e.source.value!));
    } else {
      push(right, moveable);
    }
  }
};

const tip1 = useI18n({
  en: 'Drag here',
  'zh-cn': '拖到这里来',
});

const tip2 = useI18n({
  en: (moveable: boolean) => `can only ${moveable ? 'move' : 'copy'}`,
  'zh-cn': (moveable: boolean) => `只能${moveable ? '移动' : '复制'}我`,
});
</script>

<template>
  <NativeDnd
    :instance="dnd"
    class="example3"
    @drop="onDrop"
    @drag:start="onDragStart"
  >
    <div>
      <DndSource
        v-for="(moveable, index) in left"
        :key="index"
        label="left"
        :value="index"
      >
        <div class="tip">{{ tip2(moveable) }}</div>
      </DndSource>
    </div>
    <DndDropzone label="right">
      <div v-if="!right.length" class="empty">{{ tip1 }}</div>
      <div class="right-boxes">
        <div v-for="(_, index) in right" :key="index" class="right-box">
          {{ index + 1 }}
        </div>
      </div>
    </DndDropzone>
  </NativeDnd>
</template>

<style lang="scss">
.example3 {
  display: flex;
  flex-flow: row nowrap;
  gap: 20px;

  $box_size: 130px;
  $box_margin: 20px;
  %source_box {
    width: $box_size;
    height: $box_size;
    margin-bottom: $box_margin;
    border: 1px dashed;
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
    width: calc($box_size / 1.5);
    height: calc($box_size / 1.5);
    margin-bottom: 0;
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

  .right-boxes {
    width: 100%;
    display: flex;
    flex-flow: row wrap;
    gap: $box_margin;
  }

  .dnd-dropzone {
    $container_size: ($box_size * 3) + ($box_margin * 2);
    width: $container_size;
    min-height: $container_size;
    border: 1px dashed;
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
