<script setup lang="ts">
import { watch } from 'vue';
import useI18n from './compositions/use-i18n';
import { useExamples, useExamplesIndex } from './compositions/use-examples';

const title = useI18n({
  en: 'vdnd examples',
  'zh-cn': 'vdnd使用示例',
});
const examples = useExamples();
const {
  device,
  index: currentIndex,
  component: currentComponent,
} = useExamplesIndex(examples);

const requireMobileDeviceTip = useI18n({
  en: 'Please browser in your mobile device',
  'zh-cn': '请在移动设备上查看',
});

const requirePCDeviceTip = useI18n({
  en: 'Please browser in your computer',
  'zh-cn': '请在电脑上查看',
});

watch(
  device,
  (curr, last) => {
    if (curr === 'mobile' && last && last !== 'mobile') {
      const t = setTimeout(() => {
        clearTimeout(t);
        window.alert(requireMobileDeviceTip.value);
      }, 16);
    }
    if (curr === 'pc' && last && last !== 'pc') {
      const t = setTimeout(() => {
        clearTimeout(t);
        window.alert(requirePCDeviceTip.value);
      }, 16);
    }
  },
  {
    flush: 'post',
    immediate: true,
  }
);
</script>

<template>
  <div class="examples" :class="[device]">
    <nav class="nav">
      <header>
        <h1>{{ title }}</h1>
      </header>
      <ol>
        <li
          v-for="(example, index) in examples"
          :key="index"
          :class="{ current: currentIndex === index }"
          @click="currentIndex = index"
        >
          {{ example.title }}
        </li>
      </ol>
    </nav>
    <main class="content">
      <component :is="currentComponent" />
    </main>
  </div>
</template>

<style lang="scss">
.examples {
  &.pc {
    width: 1300px;
    height: 100%;
    margin: 0 auto;
    display: flex;
    flex-flow: row nowrap;
    padding: 20px 0;
  }

  > .nav {
    border-right: 1px solid #cdd0d6;
    padding-right: 20px;
    li {
      margin: 16px 0;
      cursor: pointer;
      &:hover {
        text-decoration: underline;
      }
      &.current {
        text-decoration: underline;
        color: blue;
      }
    }
  }

  > .content {
    padding-left: 20px;
    padding-top: 20px;
  }

  &.mobile {
    width: 100%;
    height: 100%;
    padding: 12px;
    > .nav {
      display: none;
    }

    > .content {
      padding: 0;
      height: 100%;
    }
  }
}
</style>
