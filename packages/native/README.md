# @vdnd/native

The DOM layer implementation for [@vdnd/v3](https://www.npmjs.com/package/@vdnd/v3).

In native drag-and-drop (DND) interaction, any element such as an `HTMLElement` or an `SVGElement` can potentially be a drop target. As a result, the browser dispatches a lot of DND events during the interaction. However, we only care about a part of these events in most cases.

For this situation, `@vdnd/native` allows us to specify which HTML elements can be involved in the DND interaction. By doing this, it can effectively filter out unexpected DND events, so that we only deal with the relevant ones.

## Usage

```html
<div id="container">
  <div draggable="true" class="dnd-source">
    <div class="dnd-handle" draggable="true">handle</div>
  </div>
  <div class="dnd-dropzone">dnd-dropzone1</div>
  <div class="dnd-dropzone">dnd-dropzone2</div>
  <div>not dropzone</div>
</div>
```

```javascript
import { NativeDnd } from '@vdnd/native';

const container = document.getElementById('container');
const dnd = new NativeDnd(container, {
  source: 'dnd-source',
  dropzone: 'dnd-dropzone',
  handle: 'dnd-handle',
});
dnd.on('dragstart', (e) => {
  // e.cancel();
  console.log('dragstart', e);
  e.originalEvent.dataTransfer!.effectAllowed = 'copy';
});
dnd.on('dragenter', (e) => {
  console.log('dragenter', e);
});
dnd.on('dragover', (e) => {
  // console.log('dragover', e);
});
dnd.on('dragleave', (e) => {
  console.log('dragleave', e);
});
dnd.on('drop', (e) => {
  console.log('drop', e);
});
dnd.on('dragend', (e) => {
  console.log('dragend', e);
});
```
