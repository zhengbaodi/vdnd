# @vdnd/v3

A Vue drag-and-drop(DND) component library that is easy to use.

## Features

If we intend to handle DND interaction logic using the native event-driven approach, two issues will likely arise:

1. The default behaviors and triggering timings of native DND events may initially seem confusing or, in most cases, not what we expect (you can verify this by observing the triggering timings of the `dragenter` and `dragleave` events, especially when an element contains descendant elements).

2. The event-driven approach scatters our interaction logic across various event handlers, even though they are interrelated.

Given this, `vdnd` offers the capability to group the entire DND interaction logic. It allows us to organize interrelated interaction logic together and handle them in a more intuitive manner.

## Installation

```cmd
npm i @vdnd/v3;
npm i @vdnd/demo.css --no-save;
```

## Usage

```html
<DndContainer :model="dnd">
  <DndSource label="image">image source</DndSource>
  <DndDropzone label="canvas">canvas</DndDropzone>
</DndContainer>
```

```typescript
// import '@vdnd/demo.css';
import { useDndModel, DndContainer, DndSource, DndDropzone } from '@vdnd/v3';

const dnd = useDndModel();
dnd.defineInteraction({
  scope: 's+d',
  source: 'image',
  dropzone: 'canvas',
  dropEffect: 'link',
  onDrop(e) {
    console.log('drop, image -> canvas, ', e);
  },
});
```

## API

### IDndSuite

A type helper for type inference.

```typescript
import { DndSuite, type IDndSuite } from '@vdnd/v3';

type ImageSource = {
  label: 'image';
  data: undefined;
};
type TextSource = {
  label: 'text';
  data: undefined;
};
type IDndSource = ImageSource | TextSource;

type CanvasDropzone = {
  label: 'canvas';
  data: undefined;
};
type IDndDropzone = CanvasDropzone;

const { useDndModel, injectDndModel, DndContainer, DndSource, DndDropzone, DndHandle } = DndSuite as IDndSuite<
  IDndSource,
  IDndDropzone
>;

export { useDndModel, injectDndModel, DndContainer, DndSource, DndDropzone, DndHandle };

export type * from '@vdnd/v3';
```

### DndContainer

`DndContainer` defines the boundaries for DND interaction and performs two key functions:

1. It detects DND interactions occurring within the container and synchronizes them with the `model`. Example: When a user drags a source and selects an element as the current drop target, the `DndContainer` calls the `onDragStart` and `onDragEnter` callbacks in the `model`.

2. It influences actual user interactions based on the interaction properties of the `model`. Example: If the `draggable` property of a source is set to false, the `DndContainer` prevents the user from dragging that source and calls the `onDragPrevent` callbacks in the `model`.

### DndSource

`DndSource` represents an element that is allowed to be dragged, which we refer to as the "source".

The source supports marking its type using the `label` property and binding custom data via the `data` property.

### DndDropzone

`DndDropzone` represents an area where the current drag source can be dropped, which we refer to as the "drop target".

The drop target supports marking its type using the `label` property and binding custom data via the `data` property.

### DndHandle

`DndHandle` is the drag trigger for the source.

If we want to drag a source that contains drag triggers, we can only drag the source by dragging one of the triggers.

Dragging other elements in the source will not put the source into drag mode, and the entire DND interaction will not begin.

### injectDndModel

Inject the dnd-model provided by the `DndContainer`.

The `DndContainer` will provide the model it received for its descendant components.

### useDndModel

```typescript
import { useDndModel } from '@vdnd/v3';

const dnd = useDndModel({
  classes: {
    container: 'dnd-container', // default
    source: 'dnd-source', // default
    dropzone: 'dnd-dropzone', // default
    handle: 'dnd-handle', // default
    'source:dragging': 'is-dragging', // default: `${source}--dragging`
    'source:draggable': 'is-draggable', // default: `${source}--draggable`
    'source:disabled': 'is-disabled', // default: `${source}--disabled`
    'dropzone:over': 'is-over', // default: `${dropzone}--over`
    'dropzone:droppable': 'is-droppable', // default: `${dropzone}--droppable`
    'dropzone:disabled': 'is-disabled', // default: `${dropzone}--disabled`
  },
  interactions: [],
});
```

#### dnd.defineInteraction

Define a set of related DND interaction logic, consisting of

1. Properties: `draggable`, `droppable`, `dropEffect`.

2. Event callbacks: `onDrag`, `onDragStart`, `onDragPrevent`, `onDragEnter`, `onDragOver`, `onDragLeave`, `onDrop`, `onDragEnd`.

3. Their scope, which restricts the target objects of the properties and the triggering conditions for the event callbacks.

#### draggable

```typescript
dnd.defineInteraction({
  scope: '*',
  draggable(source) {
    // the source is unknown
    return true;
  },
});

dnd.defineInteraction({
  scope: 's',
  source: 'image',
  draggable(source) {
    // the source's type must be `ImageSource`
    return false;
  },
  onDragPrevent(e) {
    // the e.source's type must be `ImageSource`
    console.log('dragprevent', e);
  },
});
```

#### droppable

```typescript
dnd.defineInteraction({
  scope: '*',
  droppable(dropzone, source) {
    // the source and dropzone are unknown
    return true;
  },
});

dnd.defineInteraction({
  scope: 'd',
  dropzone: 'canvas',
  droppable(dropzone, source) {
    // the source is unknown
    // the dropzone's type must be `CanvasDropzone`
    return true;
  },
  onDrop(e) {
    // the e.source is unknown
    // the e.dropzone's type must be `CanvasDropzone`
    console.log(e.source.label !== 'image'); // true, see below
  },
});

dnd.defineInteraction({
  scope: 's+d',
  source: 'image',
  dropzone: 'canvas',
  droppable(dropzone, source) {
    // the source's type must be `ImageSource`
    // the dropzone's type must be `CanvasDropzone`
    return false;
  },
});
```

#### dropEffect

```typescript
dnd.defineInteraction({
  scope: 's+d',
  source: 'image',
  dropzone: 'canvas',
  dropEffect(dropzone, source) {
    return 'link';
  },
  onDrop(e) {
    // the e.source's type must be `ImageSource`
    // the e.dropzone's type must be `CanvasDropzone`
    console.log('drop, image -> canvas, ', e);
  },
});
```

#### dnd.isDragging

```typescript
dnd.defineInteraction({
  scope: '*',
  onDragStart(e) {
    console.log(dnd.isDragging()); // true
    console.log(dnd.isDragging(e.source)); // true
    console.log(dnd.isDragging('image')); // unknown
  },
});
```

#### dnd.isOver

```typescript
dnd.defineInteraction({
  scope: '*',
  onDragEnter(e) {
    console.log(dnd.isOver()); // true
    console.log(dnd.isOver(e.enter)); // true
    console.log(dnd.isOver('canvas')); // unknown
  },
});
```

#### dnd.isDraggable

```typescript
dnd.defineInteraction({
  scope: '*',
  onDragStart(e) {
    console.log(dnd.isDraggable(e.source)); // true
  },
  onDragPrevent(e) {
    console.log(dnd.isDraggable(e.source)); // false
  },
});
```

#### dnd.isDroppable

```typescript
dnd.defineInteraction({
  scope: '*',
  onDragEnter(e) {
    console.log(dnd.isDroppable(e.enter)); // unknown
  },
  onDrop(e) {
    console.log(dnd.isDroppable(e.dropzone)); // true
  },
});
```

#### dnd.findHTMLElement

```typescript
onMounted(() => {
  console.log(dnd.findHTMLElement('container'));
});
```

#### dnd.findHTMLElements

```typescript
onMounted(() => {
  console.log(dnd.findHTMLElements('source'));
  console.log(dnd.findHTMLElements('dropzone'));
});
```
