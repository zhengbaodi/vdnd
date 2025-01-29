# Introduction

Easy used vue drag and drop component library.

Vdnd only abstracts that what was dragged and where it was dropped, will not implement any actual drop effects.

# Example

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
    <div v-if="!right.length" class="empty">Drag Here</div>
    <div v-for="(number, index) in right" :key="index" class="right-box">{{ number }}</div>
  </DndDropzone>
</MouseDnd>
```

[online examples](https://zhengbaodi.github.io/vdnd/?lang=en&index=0)

# Thanks

[@shopify/draggable](https://github.com/Shopify/draggable) brings inspiration to vdnd.
