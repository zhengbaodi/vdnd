# 介绍

> 为了更好地理解本章内容，请先阅读[README](../../README.zh-cn.md)中的API#组件章节。

**拖放交互实例**允许我们自定义拖放交互的细节，并提供了一些非常实用的方法。

vdnd 提供了 `useNativeDnd`、`useMouseDnd` 和 `useTouchDnd` 三种创建**拖放交互实例**的方法，它们分别用于 `NativeDnd`、`MouseDnd` 和 `TouchDnd`。vdnd 也提供了方法 `useDnd`，它通过 `type` 选项来定义实例的种类。

> vdnd 不推荐使用 `useDnd`，因为它需要指定更多的泛型才能带来良好的类型推导。

# 实例选项

创建**拖放交互实例**时提供的选项对象。

在下文中，若不对选项做特殊说明，则默认其为通用选项。

## strict

是否开启严格模式：**当前拖拽源**无法作为**当前选择放置区域**。

| 类型    | 是否必选 | 默认值 |
| ------- | -------- | ------ |
| boolean | 否       | false  |

开启严格模式意味着：

- **当前拖拽源**无法作为触发 `drag:enter`、`drag:leave`、`drag:over` 、`drop` 事件的条件。
- vdnd 不会为**当前拖拽源**附加 `classes['dropzone:over']`、`classes['dropzone:droppable']`、`classes['dropzone:disabled']` 类名。

## debug

是否开启调试模式。开启调试模式后，vdnd 会通过[自定义属性](https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLElement/dataset)的方式将**源**和**放置区域**的属性呈现在 DOM 中。

| 类型                | 是否必选 | 默认值 |
| ------------------- | -------- | ------ |
| boolean \| string[] | 否       | false  |

通过将 `debug` 设置为 `string[]` 类型的数据，可以自定义要调试的属性：`id`、`label`、`value`、`value-type`、`role`、`draggable`、`droppable`。

- `id`：vdnd 内部生成的唯一标识。
- `role`：作为**源**还是**放置区域**，亦或都是。
- `value-type`：值的类型

如果 `debug` 的值为 true，将会调试以上所有属性。

## source

**源**的类名。vdnd 会根据一个元素是否拥有该类名判断其是否为**源**。

| 类型   | 是否必选 | 默认值       |
| ------ | -------- | ------------ |
| string | 否       | 'dnd-source' |

## dropzone

**放置区域**的类名。vdnd 会根据一个元素是否拥有该类名判断其是否为**放置区域**。

| 类型   | 是否必选 | 默认值         |
| ------ | -------- | -------------- |
| string | 否       | 'dnd-dropzone' |

## handle

**拖拽触发器**的类名。vdnd 会根据一个元素是否拥有该类名判断其是否为**拖拽触发器**。

| 类型   | 是否必选 | 默认值       |
| ------ | -------- | ------------ |
| string | 否       | 'dnd-handle' |

## classes

根据拖放交互状态为**源**或**放置区域**附加的类名。

| 类型             | 是否必选 | 默认值 |
| ---------------- | -------- | ------ |
| Partial<object\> | 否       | 见下   |

| 属性名             | 类型               | 说明                                                   | 默认值                    |
| ------------------ | ------------------ | ------------------------------------------------------ | ------------------------- |
| source:dragging    | string \| string[] | 为**当前拖拽源**附加的类名                             | 'dnd-source--dragging'    |
| source:draggable   | string \| string[] | 为所有可拖拽的**源**附加的类名                         | 'dnd-source--draggable'   |
| source:disabled    | string \| string[] | 为所有不可拖拽的**源**附加的类名                       | 'dnd-source--disabled'    |
| dropzone:over      | string \| string[] | 拖放交互开始后，为**当前选择放置区域**附加的类名       | 'dnd-dropzone--over'      |
| dropzone:droppable | string \| string[] | 拖放交互开始后，为所有可放置的**放置区域**附加的类名   | 'dnd-dropzone--droppable' |
| dropzone:disabled  | string \| string[] | 拖放交互开始后，为所有不可放置的**放置区域**附加的类名 | 'dnd-dropzone--disabled'  |

## mirror

镜像相关选项。vdnd 会在拖放交互开始后，基于**当前拖拽源**创建镜像。

| 类型             | 是否必选 | 默认值 |
| ---------------- | -------- | ------ |
| Partial<object\> | 否       | 见下   |

| 属性名              | 类型        | 说明                                               | 默认值                 |
| ------------------- | ----------- | -------------------------------------------------- | ---------------------- |
| create              | (e) => Node | 自定义镜像的创建                                   | _cloneNode_            |
| className           | string      | 为镜像附加的类名                                   | 'dnd-mirror'           |
| constrainDimensions | boolean     | 是否使镜像的尺寸（宽与高）与**当前拖拽源**保持一致 | false                  |
| cursorOffsetX       | number      | vdnd 模仿了 DataTransfer.setDrawImage 进行实现     |                        |
| cursorOffsetY       | number      | vdnd 模仿了 DataTransfer.setDrawImage 进行实现     |                        |
| appendTo            | mixed       | 插入镜像时所使用的父元素                           | **当前拖拽源**的父元素 |

https://developer.mozilla.org/zh-CN/docs/Web/API/DataTransfer/setDragImage

注：该选项仅对 `useMouseDnd` 和 `useTouchDnd` 生效。

## delay

`TouchDnd` 将 `touchstart` 和 `touchmove` 事件的接连触发视为拖放交互的开始。而 `delay` 选项用于定义这两个事件发生的最小间隔时间（毫秒），只有实际间隔时间大于或等于最小间隔时间时，拖放交互才会开始。

该选项在移动端的滚动场景中会十分有帮助：[在线示例](http://zbd329.top/vdnd/?lang=zh-cn&index=6)。

| 类型   | 是否必选 | 默认值 |
| ------ | -------- | ------ |
| number | 否       | 100    |

注：该选项仅对 `useTouchDnd` 生效。

## suppressUIEvent

> 该选项是实验性的。

浏览器的原生拖放交互会在交互进行中时**抑制** `UIEvent` 的发生，例如我们将无法使用 `ctrl+s` 保存网页。该选项用来模拟此行为。

| 类型    | 是否必选 | 默认值 |
| ------- | -------- | ------ |
| boolean | 否       | false  |

注：该选项仅对 `useMouseDnd` 生效。

# 实例属性

## options

| 类型   | 说明     |
| ------ | -------- |
| object | 实例选项 |

vdnd 支持通过 **instance.options = xxx** 和 **instance.options.xxx = xxx** 来更新实例选项。

当我们更新实例选项时，如果拖放交互正在进行，vdnd 将**不会立即应用最新的实例选项**，而是会在拖放交互结束后应用。反之，vdnd 将会立即应用。

## source

| 类型           | 说明           |
| -------------- | -------------- |
| object \| null | **当前拖拽源** |

## over

| 类型           | 说明                 |
| -------------- | -------------------- |
| object \| null | **当前选择放置区域** |

## rootDndElement

**源**和**放置区域**统称为**拖放元素**，**拖放元素**可以存在嵌套关系。而 `DndProvider` 会生成一个**根拖放元素**来构建一棵**拖放元素树**（**根拖放元素**即不是**源**也不是**放置区域**）。

| 类型   | 说明           |
| ------ | -------------- |
| object | **根拖放元素** |

# 实例方法

## on/once/off

vdnd 支持通过**拖放交互实例**监听拖放交互事件。通过**拖放交互实例**添加的事件监听器会晚于 `DndProvider` 上的监听器触发。请确保你的监听操作在 `DndProvider` 触发 `initialized` 事件后执行，否则将是**不安全**的。

## isDragging

**当前拖拽源**是否满足指定条件？该方法会读取**拖放交互实例**的 `source` 属性，因而是响应式的。

## isOver

**当前选择放置区域**是否满足指定条件？该方法会读取**拖放交互实例**的 `over` 属性，因而是响应式的。
