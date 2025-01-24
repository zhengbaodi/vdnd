# drag

| 事件参数      | 类型           | 说明                 |
| ------------- | -------------- | -------------------- |
| type          | string         | 'drag'               |
| container     | HTMLElement    | **拖放容器**         |
| source        | object         | **当前拖拽源**       |
| over          | object \| null | **当前选择放置区域** |
| originalEvent | Event \| null  |                      |

`MouseDnd` 和 `TouchDnd` 触发的 `drag` 事件，`originalEvent` 为 null。

`MouseDnd` 和 `TouchDnd` 会每 50ms 触发一次 `drag` 事件，`NativeDnd` 触发 `drag` 事件的频率与原生 `drag` 事件一致。

在该事件的监听器中更新拖放交互相关的 DOM 元素是**不安全**的，例如将**当前拖拽源**从 DOM 中移除。

# drag:start

| 事件参数      | 类型        | 说明           |
| ------------- | ----------- | -------------- |
| type          | string      | 'drag:start'   |
| container     | HTMLElement | **拖放容器**   |
| source        | object      | **当前拖拽源** |
| originalEvent | Event       |                |

在该事件的监听器中更新拖放交互相关的 DOM 元素是**不安全**的。

# drag:prevent

| 事件参数      | 类型        | 说明             |
| ------------- | ----------- | ---------------- |
| type          | string      | 'drag:prevent'   |
| container     | HTMLElement | **拖放容器**     |
| source        | object      | 尝试拖拽的**源** |
| originalEvent | Event       |                  |

在该事件的监听器中更新拖放交互相关的 DOM 元素是**安全**的。

# drag:enter

| 事件参数      | 类型        | 说明                               |
| ------------- | ----------- | ---------------------------------- |
| type          | string      | 'drag:enter'                       |
| container     | HTMLElement | **拖放容器**                       |
| source        | object      | **当前拖拽源**                     |
| enter         | object      | 即将作为**当前选择**的**放置区域** |
| originalEvent | Event       |                                    |

在该事件的监听器中更新拖放交互相关的 DOM 元素是**不安全**的。

# drag:leave

| 事件参数      | 类型        | 说明                                           |
| ------------- | ----------- | ---------------------------------------------- |
| type          | string      | 'drag:leave'                                   |
| container     | HTMLElement | **拖放容器**                                   |
| source        | object      | **当前拖拽源**                                 |
| leave         | object      | 上个**当前选择放置区域**或**当前选择放置区域** |
| originalEvent | Event       |                                                |

在该事件的监听器中更新拖放交互相关的 DOM 元素是**不安全**的。

# drag:over

| 事件参数      | 类型          | 说明                 |
| ------------- | ------------- | -------------------- |
| type          | string        | 'drag:over'          |
| container     | HTMLElement   | **拖放容器**         |
| source        | object        | **当前拖拽源**       |
| over          | object        | **当前选择放置区域** |
| originalEvent | Event \| null |                      |

`MouseDnd` 和 `TouchDnd` 触发的 `drag:over` 事件，`originalEvent` 为 null。

`MouseDnd` 和 `TouchDnd` 会每 50ms 触发一次 `drag:over` 事件，`NativeDnd` 触发 `drag:over` 事件的频率与原生 `dragover` 事件一致。

在该事件的监听器中更新拖放交互相关的 DOM 元素是**不安全**的。

# drop

| 事件参数      | 类型        | 说明                 |
| ------------- | ----------- | -------------------- |
| type          | string      | 'drop'               |
| container     | HTMLElement | **拖放容器**         |
| source        | object      | **当前拖拽源**       |
| dropzone      | object      | **当前选择放置区域** |
| originalEvent | Event       |                      |

在该事件的监听器中更新拖放交互相关的 DOM 元素是**安全**的。

`drop` 事件触发时，**拖放交互实例**的状态尚未被重置，`source` 和 `over` 属性值均为非空。

# drag:end

| 事件参数      | 类型           | 说明                 |
| ------------- | -------------- | -------------------- |
| type          | string         | 'drag:end'           |
| container     | HTMLElement    | **拖放容器**         |
| source        | object         | **当前拖拽源**       |
| over          | object \| null | **当前选择放置区域** |
| originalEvent | Event          |                      |

`MouseDnd` 和 `NativeDnd` 可以通过按下 `esc` 键终止拖放交互：

| 终止交互时是否存在当前选择放置区域 | 行为                                     |
| ---------------------------------- | ---------------------------------------- |
| 是                                 | 先后触发 `drag:leave` 与 `drag:end` 事件 |
| 否                                 | 触发 `drag:end` 事件                     |

在该事件的监听器中更新拖放交互相关的 DOM 元素是**安全**的。

`drag:end` 事件触发时，**拖放交互实例**的状态已被重置，`source` 和 `over` 属性值均被重置为 null，相关样式已从 DOM 中移除。

# initialized

无参数。

在该事件的监听器中更新拖放交互相关的 DOM 元素是**安全**的。

如果我们想通过**拖放交互实例**监听拖放交互事件，那么需要在该事件的监听器中进行监听，否则将是**不安全**的。
