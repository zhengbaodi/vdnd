<script setup lang="ts">
import { shallowRef } from 'vue';

import TestModel from './tests/test-model.vue';
import TestLifecircle from './tests/test-lifecircle.vue';
import TestMultipleContainers from './tests/test-multiple-containers.vue';
import TestDraggable from './tests/test-draggable.vue';
import TestDroppable from './tests/test-droppable.vue';
import TestHandle from './tests/test-handle.vue';
import TestSourceEvents from './tests/test-source-events.vue';
import TestDropzoneEvents from './tests/test-dropzone-events.vue';
import TestCustomClasses from './tests/test-custom-classes.vue';
import TestDraggableDescendant from './tests/test-draggable-descendant.vue';
import TestUnorderedInteractions from './tests/test-unordered-interactions.vue';
import TestEffectAllowed from './tests/test-effectAllowed.vue';
import TestDropEffect from './tests/test-dropEffect.vue';
import TestOutsideSource from './tests/test-outside-source.vue';
import TestOutsideDropzone from './tests/test-outside-dropzone.vue';
import TestUncontrolledSource from './tests/test-uncontrolled-source.vue';
import TestUncontrolledDropzone from './tests/test-uncontrolled-dropzone.vue';
import TestOutsideHandle from './tests/test-outside-handle.vue';
import TestDragleaveEnter from './tests/test-dragleave.enter.vue';
import TestDangerousOperations from './tests/test-dangerous-operations.vue';

const tests = [
  { title: 'model', component: TestModel },
  { title: 'lifecircle', component: TestLifecircle },
  { title: 'multiple-containers', component: TestMultipleContainers },
  { title: 'draggable', component: TestDraggable },
  { title: 'droppable', component: TestDroppable },
  { title: 'handle', component: TestHandle },
  { title: 'source-events', component: TestSourceEvents },
  { title: 'dropzone-events', component: TestDropzoneEvents },
  { title: 'custom-classes', component: TestCustomClasses },
  { title: 'draggable-descendant', component: TestDraggableDescendant },
  { title: 'unordered-interactions', component: TestUnorderedInteractions },
  { title: 'effectAllowed', component: TestEffectAllowed },
  { title: 'dropEffect', component: TestDropEffect },
  { title: 'outside-source', component: TestOutsideSource },
  { title: 'outside-dropzone', component: TestOutsideDropzone },
  { title: 'outside-handle', component: TestOutsideHandle },
  { title: 'uncontrolled-source', component: TestUncontrolledSource },
  { title: 'uncontrolled-dropzone', component: TestUncontrolledDropzone },
  { title: 'dragleave.enter', component: TestDragleaveEnter },
  { title: 'dangerous operations', component: TestDangerousOperations },
];
const is = shallowRef(tests[0]!.component);
</script>

<template>
  <div class="app-test">
    <ol class="app-test__nav">
      <li
        v-for="test in tests"
        :key="test.title"
        @click="is = test.component"
        :class="{ active: is === test.component }"
      >
        {{ test.title }}
      </li>
    </ol>
    <div class="app-test__content">
      <component :is="is"></component>
    </div>
  </div>
</template>

<style lang="scss">
.app-test {
  width: 620px;
  display: flex;
  flex-flow: row nowrap;
  margin: 0 auto;
  gap: 20px;
  font-size: 16px;
  padding-top: 120px;

  &__nav {
    flex: 0 0 auto;
  }

  &__content {
    width: 0;
    flex: 1 1 auto;
  }

  .dnd-container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    height: fit-content;
  }

  ol {
    margin: 0;
    padding: 0;
  }

  li {
    margin: 2px 0;
    cursor: pointer;
    white-space: nowrap;

    &.active {
      text-decoration: underline;
    }
  }
}
</style>
