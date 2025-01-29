import { computed, toRef, unref } from 'vue';
import { useUrlSearchParams } from '@vueuse/core';
import useI18n from './use-i18n';
import Example1 from '../examples/Example1.vue';
import Example2 from '../examples/Example2.vue';
import Example3 from '../examples/Example3.vue';
import Example4 from '../examples/Example4.vue';
import Example5 from '../examples/Example5.vue';
import Example6 from '../examples/Example6.vue';
import Example7 from '../examples/Example7.vue';
import Example8 from '../examples/Example8.vue';
import type { MaybeRef } from 'vue';

export type Example = {
  title: string;
  component: any;
  device: 'pc' | 'mobile';
};

const components = [
  Example1,
  Example2,
  Example3,
  Example4,
  Example5,
  Example6,
  Example7,
  Example8,
];
const requiredMobileDevice = (example: unknown) => example === Example7;

function createI18nExamples(titles: string[]): Example[] {
  return components.map((component, index) => {
    return {
      title: titles[index],
      component,
      device: requiredMobileDevice(component) ? 'mobile' : 'pc',
    };
  });
}

export function useExamples() {
  return useI18n({
    en: createI18nExamples([
      'Basic functions',
      'Source that acts as dropzone',
      'Customizes dropEffect in NativeDnd',
      'Usage of DndHandle',
      'Nested elements',
      'Advanced basic functions',
      'Special option: TouchDndOptions.delay',
      'Special option: MouseDndOptions.suppressUIEvent',
    ]),
    'zh-cn': createI18nExamples([
      '基础功能',
      '同时作为放置区域的源',
      '在NativeDnd中自定义dropEffect',
      'DndHandle的使用',
      '元素嵌套',
      '基础功能进阶',
      '特殊选项：TouchDndOptions.delay',
      '特殊选项：MouseDndOptions.suppressUIEvent',
    ]),
  });
}

export function useExamplesIndex(examples: MaybeRef<Example[]>) {
  const initialIndex = toRef(
    useUrlSearchParams<{ index: string }>('history'),
    'index'
  );

  const index = computed({
    get() {
      const formatIndex = (index: string) => {
        let i = parseInt(index);
        if (isNaN(i)) {
          i = 0;
        }
        if (i < 0 || i > unref(examples).length - 1) {
          i = 0;
        }
        return i;
      };
      return formatIndex(initialIndex.value);
    },
    set(value: number) {
      initialIndex.value = String(value);
    },
  });

  return {
    index,
    component: computed(() => unref(examples)[index.value].component),
    device: computed(() => unref(examples)[index.value].device),
  };
}
