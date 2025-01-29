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

## 插件

### NativeDndPlugin

注册全局组件：`NativeDnd`、`DndSource`、`DndDropzone`、`DndHandle`。

### MouseDndPlugin

注册全局组件：`MouseDnd`、`DndSource`、`DndDropzone`、`DndHandle`。

### TouchDndPlugin

注册全局组件：`TouchDnd`、`DndSource`、`DndDropzone`、`DndHandle`。

## 组件

### DndProvider

`DndProvider` 用于渲染**拖放容器**：只有来自该容器内的拖放（拖拽放置）交互才会被 `DndProvider` 感知。

vdnd 提供了 `NativeDnd`、`MouseDnd` 和 `TouchDnd` 三类 `DndProvider`，它们使用不同的事件描述拖放交互，例如：

- `NativeDnd` 将 `dragstart` 事件的触发视为交互的开始；
- `MouseDnd` 将 `mousedown` 和 `mousemove` 事件的接连触发视为交互的开始；
- `TouchDnd` 将 `touchstart` 和 `touchmove` 事件的接连触发视为交互的开始。

#### 属性

| 名称     | 类型   | 说明                                        | 是否必选 | 默认值 |
| -------- | ------ | ------------------------------------------- | -------- | ------ |
| tag      | string | 渲染**拖放容器**所使用的 html 标签          | 否       | 'div'  |
| instance | object | [拖放交互实例.md](./docs/zh-cn/instance.md) | 是       |        |

#### 插槽

| 名称    | 说明                 | 参数 | 后备内容 |
| ------- | -------------------- | ---- | -------- |
| default | **拖放容器**的子节点 | 无   | 空       |

#### 事件

| 名称         | 说明                           |
| ------------ | ------------------------------ |
| drag         | `API#DndSource`                |
| drag:start   | `API#DndSource`                |
| drag:prevent | `API#DndSource`                |
| drag:enter   | `API#DndDropzone`              |
| drag:over    | `API#DndDropzone`              |
| drag:leave   | `API#DndDropzone`              |
| drop         | `API#DndDropzone`              |
| drag:end     | `API#DndDropzone`              |
| initialized  | `DndProvider` 初始化完成后触发 |

更多信息请参考[拖放交互事件.md](./docs/zh-cn/event.md)。

#### 组件实例

`DndProvider` 不使用 `expose` 暴露任何内容。

### DndSource

`DndSource` 用于渲染**源**：只有尝试拖拽**拖放容器**中的**源**时，`DndProvider` 才能感知到拖拽的发生。

#### 属性

| 名称      | 类型    | 说明                                             | 是否必选 | 默认值                                |
| --------- | ------- | ------------------------------------------------ | -------- | ------------------------------------- |
| tag       | string  | 渲染**源**所使用的 html 标签                     | 否       | 'div'                                 |
| label     | string  | 为**源**绑定一个标签，一般用于分组               | 否       |                                       |
| value     | any     | 为**源**绑定一个值，在某个组内，该值通常是唯一的 | 否       |                                       |
| draggable | boolean | 是否允许拖拽                                     | 否       | true                                  |
| dropzone  | boolean | 是否同时作为**放置区域**                         | 否       | false                                 |
| droppable | boolean | 是否允许放置                                     | 否       | false；true，当 `dropzone` 为 true 时 |

当我们尝试拖拽一个可拖拽的**源**时，拖放交互开始，`DndProvider` 触发 `drag:start` 事件，并将该**源**作为**当前拖拽源**。反之，拖放交互被阻止，`DndProvider` 触发 `drag:prevent` 事件。拖放交互开始后，`DndProvider` 将会定时触发 `drag` 事件。

`DndProvider` 触发事件时，会将相关的**源**作为参数，并支持访问**源**的属性，例如 `label` 和 `value`：它们可以帮助我们快速识别出**源**的身份，并以此决定后续的操作。

> `label` 属性只是起到标记作用，vdnd 内部并没有任何关于分组的逻辑。

**源**可以同时作为**放置区域**，这会带来更多可能性。在后面，我们将了解到**放置区域**。

#### 插槽

| 名称    | 说明           | 参数 | 后备内容 |
| ------- | -------------- | ---- | -------- |
| default | **源**的子节点 | 无   | 空       |

#### 事件

`DndSource` 不触发任何事件。

#### 组件实例

`DndSource` 不使用 `expose` 暴露任何内容。

### DndDropzone

`DndDropzone` 用于渲染**放置区域**：一般来说，只有当我们在**放置区域**上结束拖放交互时，才可能产生实际的放置效果，例如将**当前拖拽源**移动到交互结束时所在的**放置区域**中。

#### 属性

| 名称      | 类型    | 说明                                                   | 是否必选 | 默认值 |
| --------- | ------- | ------------------------------------------------------ | -------- | ------ |
| tag       | string  | 渲染**放置区域**所使用的 html 标签                     | 否       | 'div'  |
| label     | string  | 为**放置区域**绑定一个标签，一般用于分组               | 否       |        |
| value     | any     | 为**放置区域**绑定一个值，在某个组内，该值通常是唯一的 | 否       |        |
| droppable | boolean | 是否允许放置                                           | 否       | true   |

在拖放交互开始后，当我们使用某种指向设备（例如鼠标）指向某个**放置区域**时，`DndProvider` 将会触发 `drag:enter` 事件，并将该**放置区域**作为**当前选择放置区域**。当我们取消指向**当前选择放置区域**时，`DndProvider` 将会触发 `drag:leave` 事件。

在拖放交互进行中时，如果**当前选择放置区域**存在，`DndProvider` 将会定时触发 `drag:over` 事件。

在拖放交互结束时，如果**当前选择放置区域**不存在，`DndProvider` 将只会触发 `drag:end` 事件。否则，`DndProvider` 将会根据**当前选择放置区域**的可放置与否决定触发 `drop` 或 `drag:leave` 事件，并随后触发 `drag:end` 事件。

#### 插槽

| 名称    | 说明                 | 参数 | 后备内容 |
| ------- | -------------------- | ---- | -------- |
| default | **放置区域**的子节点 | 无   | 空       |

#### 事件

`DndDropzone` 不触发任何事件。

#### 组件实例

`DndDropzone` 不使用 `expose` 暴露任何内容。

### DndHandle

`DndHandle` 用于渲染**拖拽触发器**。如果某个**源**中包含**拖拽触发器**，那么只有当我们尝试拖拽该**源**中的**拖拽触发器**时，`DndProvider` 才能感知到我们正在尝试拖拽该**源**，并随后触发 `drag:start` 或 `drag:prevent` 事件。

#### 属性

| 名称 | 类型   | 说明                                 | 是否必选 | 默认值 |
| ---- | ------ | ------------------------------------ | -------- | ------ |
| tag  | string | 渲染**拖拽触发器**所使用的 html 标签 | 否       | 'div'  |

#### 插槽

| 名称    | 说明                   | 参数 | 后备内容 |
| ------- | ---------------------- | ---- | -------- |
| default | **拖拽触发器**的子节点 | 无   | 空       |

#### 事件

`DndHandle` 不触发任何事件。

#### 组件实例

`DndHandle` 不使用 `expose` 暴露任何内容。

## 组合式函数

### useDnd

创建一个[拖放交互实例](./docs/zh-cn/instance.md)，通过选项 `type` 区分实例种类。

### useNativeDnd

创建一个 `NativeDnd` 专用的[拖放交互实例](./docs/zh-cn/instance.md)。

### useMouseDnd

创建一个 `MouseDnd` 专用的[拖放交互实例](./docs/zh-cn/instance.md)。

### useTouchDnd

创建一个 `TouchDnd` 专用的[拖放交互实例](./docs/zh-cn/instance.md)。

## 数组工具函数

vdnd 提供了一组更新响应式数组的工具函数，在实现具体的放置效果时会十分有帮助。

### unshift

在数组头部插入一个元素。

### shift

移除数组中的第一个元素。

### push

在数组尾部插入一个元素。

### pop

移除数组中的最后一个元素。

### splice

移除数组中的多个元素，并可以在移除的位置上插入多个元素。

### find

返回第一个满足条件的元素（从左向右查找）。

### findLast

返回第一个满足条件的元素（从右向左查找）。

### findIndex

返回第一个满足条件的元素的索引（从左向右查找）。

### findLastIndex

返回第一个满足条件的元素的索引（从右向左查找）。

### swap

- 交换两个数组中的元素。
- 交换一个数组中的两个元素。

### remove

移除数组中满足条件的第一个元素。

### insert

在数组某个位置的前或后插入多个元素。

# 感谢

[@shopify/draggable](https://www.npmjs.com/package/@shopify/draggable)为 vdnd 带来了灵感。
