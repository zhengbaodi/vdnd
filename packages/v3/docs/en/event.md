# drag

| Parameter     | Type           | Description                 |
| ------------- | -------------- | --------------------------- |
| type          | string         | 'drag'                      |
| container     | HTMLElement    | **dnd container**           |
| source        | object         | **the current source**      |
| over          | object \| null | **the current drop target** |
| originalEvent | Event \| null  |                             |

The `drag` event emitted by `MouseDnd` or `TouchDnd`, `originalEvent` is null.

`MouseDnd` and `TouchDnd` emit `drag` event per 50ms, the frequency of `NativeDnd` emitting `drag` event is consistent with that of native `drag` event emitted by browser.

Updating elements related to the interaction in the event handlers of this event is **unsafe**, such as removes **the current source** from DOM.

# drag:start

| Parameter     | Type        | Description            |
| ------------- | ----------- | ---------------------- |
| type          | string      | 'drag:start'           |
| container     | HTMLElement | **dnd container**      |
| source        | object      | **the current source** |
| originalEvent | Event       |                        |

Updating elements related to the interaction in the event handlers of this event is **unsafe**.

# drag:prevent

| Parameter     | Type        | Description                       |
| ------------- | ----------- | --------------------------------- |
| type          | string      | 'drag:prevent'                    |
| container     | HTMLElement | **dnd container**                 |
| source        | object      | the **source** attempting to drag |
| originalEvent | Event       |                                   |

Updating elements related to the interaction in the event handlers of this event is **safe**.

# drag:enter

| Parameter     | Type        | Description                                                           |
| ------------- | ----------- | --------------------------------------------------------------------- |
| type          | string      | 'drag:enter'                                                          |
| container     | HTMLElement | **dnd container**                                                     |
| source        | object      | **the current source**                                                |
| enter         | object      | the **dropzone** which is about to become **the current drop target** |
| originalEvent | Event       |                                                                       |

Updating elements related to the interaction in the event handlers of this event is **unsafe**.

# drag:leave

| Parameter     | Type        | Description                                                         |
| ------------- | ----------- | ------------------------------------------------------------------- |
| type          | string      | 'drag:leave'                                                        |
| container     | HTMLElement | **dnd container**                                                   |
| source        | object      | **the current source**                                              |
| leave         | object      | **the current drop target** or **the previous current drop target** |
| originalEvent | Event       |                                                                     |

Updating elements related to the interaction in the event handlers of this event is **unsafe**.

# drag:over

| Parameter     | Type          | Description                 |
| ------------- | ------------- | --------------------------- |
| type          | string        | 'drag:over'                 |
| container     | HTMLElement   | **dnd container**           |
| source        | object        | **the current source**      |
| over          | object        | **the current drop target** |
| originalEvent | Event \| null |                             |

The `drag:over` event emitted by `MouseDnd` or `TouchDnd`, `originalEvent` is null.

`MouseDnd` and `TouchDnd` emit `drag:over` event per 50ms, the frequency of `NativeDnd` emitting `drag:over` event is consistent with that of native `drag:over` event emitted by browser.

Updating elements related to the interaction in the event handlers of this event is **unsafe**.

# drop

| Parameter     | Type        | Description                 |
| ------------- | ----------- | --------------------------- |
| type          | string      | 'drop'                      |
| container     | HTMLElement | **dnd container**           |
| source        | object      | **the current source**      |
| dropzone      | object      | **the current drop target** |
| originalEvent | Event       |                             |

Updating elements related to the interaction in the event handlers of this event is **safe**.

When emitting `drop` event, the interaction state has not been reset, `source` and `over` property of **DndInstance** still are nonnull.

# drag:end

| Parameter     | Type           | Description                 |
| ------------- | -------------- | --------------------------- |
| type          | string         | 'drag:end'                  |
| container     | HTMLElement    | **dnd container**           |
| source        | object         | **the current source**      |
| over          | object \| null | **the current drop target** |
| originalEvent | Event          |                             |

We can terminate the interaction by pressing the `esc` key when using `MouseDnd` or `NativeDnd`.

| Whether **the current drop target** exists or not when terminating | behavior                                                            |
| ------------------------------------------------------------------ | ------------------------------------------------------------------- |
| exists                                                             | `DndProvider` emits `drag:leave` event first, then `drag:end` event |
| does not exist                                                     | `DndProvider` only emits `drag:end` event                           |

Updating elements related to the interaction in the event handlers of this event is **safe**.

When emitting `drag:end` event, the interaction state has been reset, `source` and `over` property of **DndInstance** have been reset to null, and the related styles have been reset also.

# initialized

No Parameters.

Updating elements related to the interaction in the event handlers of this event is **safe**.

If we want to add event handlers by **DndInstace**, then we must do in the event handlers of this event, otherwise it will be unsafe.
