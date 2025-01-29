<script setup lang="ts">
import { reactive } from 'vue';
import { swap } from '@vdnd/v3';
import { useMouseDnd, MouseDnd, DndSource } from '@vdnd/v3';
import type { DropEvent } from '@vdnd/v3';

const grid = reactive([
  [1, 2, 3, 4],
  [5, 6, 7, 8],
  [9, 10, 11, 12],
  [13, 14, 15, 16],
]);

const dnd = useMouseDnd<number>({
  strict: true,
  mirror: {
    constrainDimensions: true,
  },
});

const onDrop = (e: DropEvent<number>) => {
  const { source, dropzone } = e;
  if (source.label === 'subgrid' && dropzone.label === 'subgrid') {
    swap(grid, source.value!, dropzone.value!);
  }

  if (source.label === 'subgrid-item' && dropzone.label === 'subgrid-item') {
    swap(
      grid[source.parent!.value!],
      source.value!,
      grid[dropzone.parent!.value!],
      dropzone.value!
    );
  }
};
</script>

<template>
  <MouseDnd :instance="dnd" class="example5" @drop="onDrop">
    <DndSource
      v-for="(subgrid, index) in grid"
      :key="index"
      label="subgrid"
      class="subgrid large"
      :value="index"
      :dropzone="dnd.isDragging('subgrid')"
    >
      <DndSource
        v-for="(number, index1) in subgrid"
        :key="number"
        label="subgrid-item"
        :value="index1"
        class="subgrid-item small"
        :dropzone="dnd.isDragging('subgrid-item')"
      >
        {{ number }}
      </DndSource>
    </DndSource>
  </MouseDnd>
</template>

<style lang="scss">
@mixin grid($gap) {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: $gap;
}

.example5 {
  width: 500px;
  height: 500px;
  @include grid(20px);

  .subgrid {
    padding: 12px;
    @include grid(12px);

    .dnd-source {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  .dnd-source {
    border: 1px solid;
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
        box-shadow: 0 0 3px 3px rgba(0, 0, 0, 0.2);
      }

      &.small {
        box-shadow: 0 0 2px 2px rgba(0, 0, 0, 0.2);
      }
    }
  }
}
</style>
