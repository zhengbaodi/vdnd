# 简介

简单易用的拖拽放置 vue 组件库。

vdnd 只抽象出拖拽了什么以及将其放置在了哪里，而不实现具体的放置效果。

# 示例

```typescript
import { ref } from 'vue';
import { push, remove } from '@vdnd/v3';
import { useMouseDnd, MouseDnd, DndSource, DndDropzone } from '@vdnd/v3';
import type { DropEvent } from '@vdnd/v3';

const dnd = useMouseDnd<number>({
  strict: true,
});

const left = ref([1, 2, 3]);
const right = ref<number[]>([]);

const onDrop = (e: DropEvent<number>) => {
  if (e.source.label === 'left' && e.dropzone.label === 'right') {
    push(right, remove(left, e.source.value!));
  }
};
```

```html
<MouseDnd :instance="dnd" class="example" @drop="onDrop">
  <div>
    <DndSource v-for="(number, index) in left" :key="index" label="left" :value="index">
      {{ number }}
    </DndSource>
  </div>
  <DndDropzone label="right">
    <div v-if="!right.length" class="empty">拖到这里来</div>
    <div v-for="(number, index) in right" :key="index" class="right-box">{{ number }}</div>
  </DndDropzone>
</MouseDnd>
```

[在线示例](http://zbd329.top/vdnd/?lang=zh-cn&index=0)

# API

[/packages/v3/README.zh-cn.md](./packages/v3/README.zh-cn.md)

# 感谢

[@shopify/draggable](https://github.com/Shopify/draggable)为 vdnd 带来了灵感。
