# Introduction

> The original version of the document is in [Chinese](./README.zh-cn.md).

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

# API

## Plugins

### NativeDndPlugin

Registers global components: `NativeDnd`, `DndSource`, `DndDropzone`, `DndHandle`.

### MouseDndPlugin

Registers global components: `MouseDnd`, `DndSource`, `DndDropzone`, `DndHandle`.

### TouchDndPlugin

Registers global components: `TouchDnd`, `DndSource`, `DndDropzone`, `DndHandle`.

## Components

### DndProvider

`DndProvider` is used for rendering **dnd container**: only the drag and drop interactions from within the container will be perceived by `DndProvider`.

Vdnd provides three types of `DndProviders`: `NativeDnd`, `MouseDnd` and`TouchDnd`, they use different events to perceive the interaction, such as:

- `NativeDnd` considers the occurrence of `dragstart` event as the start of the interaction;
- `MouseDnd` considers the consecutive occurrences of `mousedown` and `mousemove` events as the start of the interaction;
- `TouchDnd` considers the consecutive occurrences of `touchstart` and `touchmove` events as the start of the interaction.

#### Props

| Name     | Type   | Description                                                                 | Required | Default |
| -------- | ------ | --------------------------------------------------------------------------- | -------- | ------- |
| tag      | string | html tag used for rendering **dnd container**                               | false    | 'div'   |
| instance | object | [DndInstance(Drag and Drop Interaction Instance).md](./docs/en/instance.md) | true     |         |

#### Slots

| Name    | Description                         | Parameters | Fallback Content |
| ------- | ----------------------------------- | ---------- | ---------------- |
| default | the child node of **dnd container** | none       | empty            |

#### Events

| Name         | Description                                             |
| ------------ | ------------------------------------------------------- |
| drag         | `API#DndSource`                                         |
| drag:start   | `API#DndSource`                                         |
| drag:prevent | `API#DndSource`                                         |
| drag:enter   | `API#DndDropzone`                                       |
| drag:over    | `API#DndDropzone`                                       |
| drag:leave   | `API#DndDropzone`                                       |
| drop         | `API#DndDropzone`                                       |
| drag:end     | `API#DndDropzone`                                       |
| initialized  | emited after initialization completion of `DndProvider` |

See also [Drag and Drop Interaction Events.md](./docs/en/event.md)。

#### Exposes

`DndProvider` does not use `expose` to expose any contents.

### DndSource

`DndSource` is used for rendering **source**: `DndProvider` can only perceive the occurrence of dragging when attempting to drag the **source** in **dnd container**.

#### Props

| Name      | Type    | Description                                                          | Required | Default                            |
| --------- | ------- | -------------------------------------------------------------------- | -------- | ---------------------------------- |
| tag       | string  | html tag used for rendering **source**                               | false    | 'div'                              |
| label     | string  | binds a label for **source**, usually used for grouping              | false    |                                    |
| value     | any     | binds a value for **source**, which is usually unique within a group | false    |                                    |
| draggable | boolean | is draggable or not                                                  | false    | true                               |
| dropzone  | boolean | is also **dropzone** or not                                          | false    | false                              |
| droppable | boolean | is droppable or not                                                  | false    | false; true, if `dropzone` is true |

When we try to drag a draggable **source**, the interaction starts, `DndProvider` emits `drag:start` event and makes the **source** as **the current source**. On the contrary, the interaction is prevented, and `DndProvider` emits `drag:prevent` event. After the interaction starts, `DndProvider` will emit `drag` event at regular intervals.

When `DndProvider` emits an event, it takes the relevant **source** as one of parameters, and we can access its `label` and `value`: they can help us quickly identify the identity of the **source** and determine subsequent actions accordingly.

> The `label` property only functions as a marker, vdnd does not have any internal logics regarding grouping.

**Source** can also act as **dropzone**, which brings more possibilities. Later on, we will learn about **dropzone**.

#### Slots

| Name    | Description                  | Parameters | Fallback Content |
| ------- | ---------------------------- | ---------- | ---------------- |
| default | the child node of **source** | none       | empty            |

#### Events

`DndSource` does not emit any events.

#### Exposes

`DndSource` does not use `expose` to expose any contents.

### DndDropzone

`DndDropzone` is used for rendering **dropzone**: normally, the actual drop effect can only be produced when we end the interaction on the **dropzone**, such as moving **the current source** into the **dropzone** where the interaction ends.

#### Props

| Name      | Type    | Description                                                            | Required | Default |
| --------- | ------- | ---------------------------------------------------------------------- | -------- | ------- |
| tag       | string  | html tag used for rendering **dropzone**                               | false    | 'div'   |
| label     | string  | binds a label for **dropzone**, usually used for grouping              | false    |         |
| value     | any     | binds a value for **dropzone**, which is usually unique within a group | false    |         |
| droppable | boolean | is droppable or not                                                    | false    | true    |

After the interaction starts, when we use a pointing device (such as mouse) to point to a **dropzone**, `DndProvider` will emit `drag:enter` event and make the **dropzone** as **the current drop target**. When we cancel the pointing to **the current drop target**, `DndProvider` will emit `drag:leave` event.

When the interaction is in progress, if **the current drop target** exists, `DndProvider` will emit `drag:over` event at regular intervals.

At the end of the interaction, if **the current drop target** does not exist, `DndProvider` will only emit `drag:end` event. Otherwise `DndProvider` will emit `drop` or `drag:leave` event based on whether **the current drop target** is droppable or not, then emit `drag:end` event.

#### Slots

| Name    | Description                    | Parameters | Fallback Content |
| ------- | ------------------------------ | ---------- | ---------------- |
| default | the child node of **dropzone** | none       | empty            |

#### Events

`DndDropzone` does not emit any events.

#### Exposes

`DndDropzone` does not use `expose` to expose any contents.

### DndHandle

`DndHandle` is used for rendering the **handle** of **source**. If a **source** contains **handles**, only when we try to drag **handles** in that **source**, `DndProvider` can perceive that we are attempting to drag that **source** and then emits `drag:start` or `drag:prevent` event.

#### Props

| Name | Type   | Description                            | Required | Default |
| ---- | ------ | -------------------------------------- | -------- | ------- |
| tag  | string | html tag used for rendering **handle** | false    | 'div'   |

#### Slots

| Name    | Description                  | Parameters | Fallback Content |
| ------- | ---------------------------- | ---------- | ---------------- |
| default | the child node of **handle** | none       | empty            |

#### Events

`DndHandle` does not emit any events.

#### Exposes

`DndHandle` does not use `expose` to expose any contents.

## Compositions

### useDnd

Creates a [DndInstance](./docs/en/instance.md), distinguishing instance types by the `type` option.

### useNativeDnd

Creates a [DndInstance](./docs/en/instance.md) for `NativeDnd`.

### useMouseDnd

Creates a [DndInstance](./docs/en/instance.md) for `MouseDnd`.

### useTouchDnd

Creates a [DndInstance](./docs/en/instance.md) for `TouchDnd`.

## ArrayUtils

Vdnd provides a set of utility for updating reactive array, which can be helpful when implementing actual drop effects.

### unshift

Inserts new elements at the start of an array.

### shift

Removes the first element from an array.

### push

Appends new elements to the end of an array.

### pop

Removes the last element from an array.

### splice

Removes elements from an array and, if necessary, inserts new elements in their place.

### find

Returns the value of the first element that meets the specified condition in an array.

### findLast

Returns the value of the last element that meets the specified condition in an array.

### findIndex

Returns the index of the first element that meets the specified condition in an array.

### findLastIndex

Returns the index of the last element that meets the specified condition in an array.

### swap

- Swaps elements in an array.
- Swaps elements between two arrays.

### remove

Removes an element that meets the specified condition from an array.

### insert

Inserts new elements before or after a certain position in an array.

# Thanks

[@shopify/draggable](https://www.npmjs.com/package/@shopify/draggable) brings inspiration to vdnd.
