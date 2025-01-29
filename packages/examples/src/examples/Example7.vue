<script setup lang="ts">
import { onMounted, reactive } from 'vue';
import { useTouchDnd, TouchDnd, DndSource } from '@vdnd/v3';
import useI18n from '../compositions/use-i18n';

const data = reactive([1, 2, 3, 4, 5, 6, 7, 8, 9]);
const delayTimes = [0, 100, 400];

const dnd = useTouchDnd<number>({
  delay: 0,
  strict: true,
  mirror: {
    constrainDimensions: true,
  },
});

const tip = useI18n({
  en: 'Please slide the card up and down',
  'zh-cn': '请上下滑动卡片',
});
onMounted(() => {
  const t = setTimeout(() => {
    clearTimeout(t);
    window.alert(tip.value);
  }, 16);
});
</script>

<template>
  <TouchDnd :instance="dnd" class="example7">
    <div class="header">
      The dnd.options.delay is
      <select v-model="dnd.options.delay">
        <option v-for="time in delayTimes" :key="time" :value="time">
          {{ time }}
        </option>
      </select>
      ms
    </div>
    <div class="main">
      <DndSource v-for="item in data" :key="item">
        {{ item }}
      </DndSource>
    </div>
  </TouchDnd>
</template>

<style lang="scss">
.example7 {
  width: 100%;
  height: 100%;
  display: flex;
  flex-flow: column nowrap;

  > .header {
    flex: 0 0 auto;
  }

  > .main {
    width: 100%;
    height: 0;
    flex: 1 0 auto;
    overflow: auto;
  }

  .dnd-source {
    width: 100px;
    height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
    border: 1px solid;
    margin-bottom: 20px;
    &--dragging {
      opacity: 0.4;
    }
  }

  .dnd-dropzone {
    &--over {
      background-color: greenyellow;
    }

    &--droppable {
      box-shadow: 0 0 2px 2px rgba(0, 0, 0, 0.2);
    }
  }
}
</style>
