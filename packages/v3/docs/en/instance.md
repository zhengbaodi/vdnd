# Introduction

We can customize details of the drag and drop interaction by **DndInstance** that also provides some helpful methods.

Vdnd provides three functions to create **DndInstance**: `useNativeDnd`, `useMouseDnd` and `useTouchDnd`, they are used for `NativeDnd`, `MouseDnd` and `TouchDnd` respectively. In addition, `useDnd` is also provided, it distinguishs type of created instance by the `type` option.

> Vdnd does not recommend `useDnd`, because we need to provide more generic types for better type inference.

# Instance options

The options are used for creating **DndInstance**, and it can be `reactive` or `shallowReactive`.

In the following, the mentioned options are general option by default, unless special instructions.

## strict

Enables strict mode or not: **the current source** will not act as **the current drop target**.

| Type    | Required | Default |
| ------- | -------- | ------- |
| boolean | false    | false   |

Enables strict mode means:

- **The current source** cannot be used as conditions to emit `drag:enter`, `drag:leave`, `drag:over` or `drop` events.
- Vdnd will not attach `classes['dropzone:over']`, `classes['dropzone:droppable']` and `classes['dropzone:disabled']` to **the current source**.

## debug

Enables debugging mode or not. If enabled, vdnd will present properties of **source** and **dropzone** in DOM by [custom attributes](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset).

| Type                | Required | Default |
| ------------------- | -------- | ------- |
| boolean \| string[] | false    | false   |

We can customize the properties to be debugged: `id`, `label`, `value`, `value-type`, `role`, `draggable` and `droppable`, if `debug` is set to `string[]`.

- `id`: internal unique id.
- `role`: acts as **source** or **dropzone**, or both.
- `value-type`: type of the `value`.

If `debug` is true, all of the above properties will be debugged.

## source

Class of **source**. vdnd will determine whether an element is **source** based on whether it owns the class.

| Type   | Required | Default      |
| ------ | -------- | ------------ |
| string | false    | 'dnd-source' |

## dropzone

Class of **dropzone**. vdnd will determine whether an element is **dropzone** based on whether it owns the class.

| Type   | Required | Default        |
| ------ | -------- | -------------- |
| string | false    | 'dnd-dropzone' |

## handle

Class of **handle**. vdnd will determine whether an element is **handle** based on whether it owns the class.

| Type   | Required | Default      |
| ------ | -------- | ------------ |
| string | false    | 'dnd-handle' |

## classes

The classes attached to **source** and **dropzone** according to the interaction state.

| Type             | Required | Default   |
| ---------------- | -------- | --------- |
| Partial<object\> | false    | see below |

<style>
table tr td:nth-child(1),
table tr td:nth-child(2),
table tr td:nth-child(4)  {
  white-space: nowrap;
}
</style>

| Name               | Type               | Description                                                                       | Default                   |
| ------------------ | ------------------ | --------------------------------------------------------------------------------- | ------------------------- |
| source:dragging    | string \| string[] | classes attached to **the current source**                                        | 'dnd-source--dragging'    |
| source:draggable   | string \| string[] | classes attached to all draggable **sources**                                     | 'dnd-source--draggable'   |
| source:disabled    | string \| string[] | classes attached to all not draggable **sources**                                 | 'dnd-source--disabled'    |
| dropzone:over      | string \| string[] | after the interaction starts, classes attached to **the current drop target**     | 'dnd-dropzone--over'      |
| dropzone:droppable | string \| string[] | after the interaction starts, classes attached to all droppable **dropzones**     | 'dnd-dropzone--droppable' |
| dropzone:disabled  | string \| string[] | after the interaction starts, classes attached to all not droppable **dropzones** | 'dnd-dropzone--disabled'  |

## mirror

The mirror options. vdnd will create the mirror of **the current source** when the interaction starts.

| Type             | Required | Default   |
| ---------------- | -------- | --------- |
| Partial<object\> | false    | see below |

| Name                | Type               | Description                                                                       | Default                                   |
| ------------------- | ------------------ | --------------------------------------------------------------------------------- | ----------------------------------------- |
| create              | (e) => Node        | customizes creation of the mirror                                                 | _cloneNode_                               |
| className           | string \| string[] | classes attached to the mirror                                                    | 'dnd-mirror'                              |
| constrainDimensions | boolean            | keeps the dimensions of the mirror consistent with that of **the current source** | false                                     |
| cursorOffsetX       | number             | vdnd imitates DataTransfer.setDrawImage for implementation                        |                                           |
| cursorOffsetY       | number             | vdnd imitates DataTransfer.setDrawImage for implementation                        |                                           |
| appendTo            | mixed              | The parent node used when inserting the mirror                                    | the parent node of **the current source** |

https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer/setDragImage

Note: this option only functions for `useMouseDnd` and `useTouchDnd`.

## delay

`TouchDnd` considers the consecutive occurrences of `touchstart` and `touchmove` events as the start of the interaction. The `delay` option is used for defining the minimum time interval(milliseconds) between occurrences of `touchstart` and `touchmove` events, the interaction only starts when actual interval is greater than or equal to the minimum interval.

This option will be helpful in the scrolling scene on mobile device: [online example](https://zhengbaodi.github.io/vdnd/?lang=en&index=6).

| Type   | Required | Default |
| ------ | -------- | ------- |
| number | false    | 100     |

Note: this option only functions for `useTouchDnd`.

## suppressUIEvent

> This option is experimental.

Browser will suppress `UIEvent` during the native drag and drop interaction, such as we cannot save the web page by `ctrl+s`. This option is used for imitating this behavior.

| Type    | Required | Default |
| ------- | -------- | ------- |
| boolean | false    | false   |

Note: this option only functions for `useMouseDnd`.

# Instance properties

## options

| Type   | Description      |
| ------ | ---------------- |
| object | instance options |

Vdnd supports triggering side effects through **instance.options=xxx**.

When we update instance options, if the interaction is in progress, vdnd **will not apply the newest intance options immediately**, but after the end of the interaction.

## source

| Type           | Description            |
| -------------- | ---------------------- |
| object \| null | **the current source** |

## over

| Type           | Description                |
| -------------- | -------------------------- |
| object \| null | **the current dop target** |

## rootDndElement

**Source** and **dropzone** are referred to as **DndElement**, and **DndElement** can nest each other. Vdnd will create a **RootDndElement** to build a **DndElementTree** (**RootDndElement** is neither **source** nor **dropzone**).

| Type   | Description        |
| ------ | ------------------ |
| object | **RootDndElement** |

# Instance methods

## on/once/off

We can add the event handlers of the interaction events by `DndIntance`, these event handlers will be called after the event handlers of `DndProvider`. Please add event handlers after `DndProvider` emitting `initialized` event, otherwise it will be unsafe.

## isDragging

Whether **the current source** meets the specified conditions or not? This method will read the `source` property of `DndInstance`, therefor reactive.

## isOver

Whether **the current drop target** meets the specified conditions or not? This method will read the `over` property of `DndInstance`, therefor reactive.
