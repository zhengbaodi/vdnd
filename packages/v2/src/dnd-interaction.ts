import {
  unref as _unref,
  type ComputedRef,
  type Ref,
  type ShallowRef,
  type WritableComputedRef,
} from 'vue';
import type {
  DragEvent,
  DragStartEvent,
  DragPreventEvent,
  DragEnterEvent,
  DragOverEvent,
  DragLeaveEvent,
  DropEvent,
  DragEndEvent,
} from './dnd-events';
import type { DndElement } from './dnd-element';

type MaybeRef<T = any> = T | Ref<T> | ShallowRef<T> | WritableComputedRef<T>;

function unref<T>(ref: MaybeRef<T> | ComputedRef<T>): T {
  return _unref(ref) as T;
}

type PickDndElement<T extends DndElement, Label extends string> = Extract<
  T,
  { label: Label }
>;

type NonNullableProps<O extends object> = {
  [K in keyof O]: NonNullable<O[K]>;
};

export type OnDrag<
  S extends DndElement,
  Over extends DndElement,
  Event extends DragEvent<S, Over> = DragEvent<S, Over>,
> = (e: Event) => void;

export type OnDragStart<S extends DndElement> = (e: DragStartEvent<S>) => void;

export type OnDragPrevent<S extends DndElement> = (
  e: DragPreventEvent<S>
) => void;

export type OnDragEnter<S extends DndElement, Enter extends DndElement> = (
  e: DragEnterEvent<S, Enter>
) => void;

export type OnDragOver<S extends DndElement, Over extends DndElement> = (
  e: DragOverEvent<S, Over>
) => void;

export type OnDragLeave<
  S extends DndElement,
  Leave extends DndElement,
  Enter extends DndElement,
> = (e: DragLeaveEvent<S, Leave, Enter>) => void;

export type OnDrop<S extends DndElement, Dropzone extends DndElement> = (
  e: DropEvent<S, Dropzone>
) => void;

export type OnDragEnd<
  S extends DndElement,
  Over extends DndElement,
  Event extends DragEndEvent<S, Over> = DragEndEvent<S, Over>,
> = (e: Event) => void;

type Draggable<S extends DndElement = DndElement> =
  | MaybeRef<boolean>
  | ComputedRef<boolean>
  | ((source: S) => boolean);
export function unwrapDraggable<S extends DndElement = DndElement>(
  draggable: Draggable<S>,
  source: S
) {
  return typeof draggable === 'function' ? draggable(source) : unref(draggable);
}

type Droppable<
  S extends DndElement = DndElement,
  D extends DndElement = DndElement,
> =
  | MaybeRef<boolean>
  | ComputedRef<boolean>
  | ((dropzone: D, source: S) => boolean);
export function unwrapDroppable<
  S extends DndElement = DndElement,
  D extends DndElement = DndElement,
>(droppable: Droppable<S, D>, source: S, dropzone: D) {
  return typeof droppable === 'function'
    ? droppable(dropzone, source)
    : unref(droppable);
}

export type EffectAllowed = Extract<
  DataTransfer['effectAllowed'],
  'all' | 'uninitialized'
>;

export type DropEffect<
  S extends DndElement = DndElement,
  D extends DndElement = DndElement,
> =
  | MaybeRef<Exclude<DataTransfer['dropEffect'], 'none'>>
  | ComputedRef<Exclude<DataTransfer['dropEffect'], 'none'>>
  | ((dropzone: D, source: S) => Exclude<DataTransfer['dropEffect'], 'none'>);
export function unwrapDropEffect<
  S extends DndElement = DndElement,
  D extends DndElement = DndElement,
>(dropEffect: DropEffect<S, D>, source: S, dropzone: D) {
  return typeof dropEffect === 'function'
    ? dropEffect(dropzone, source)
    : unref(dropEffect);
}

export type DndInteraction1<
  S extends DndElement = DndElement,
  D extends DndElement = DndElement,
> = {
  scope: '*';
  draggable?: Draggable<S>;
  droppable?: Droppable<S, D>;
  onDrag?: OnDrag<S, D>;
  onDragStart?: OnDragStart<S>;
  onDragPrevent?: OnDragPrevent<S>;
  onDragEnter?: OnDragEnter<S, D>;
  onDragOver?: OnDragOver<S, D>;
  onDragLeave?: OnDragLeave<S, D, D>;
  onDrop?: OnDrop<S, D>;
  onDragEnd?: OnDragEnd<S, D>;
};

export type DndInteraction2<
  S extends DndElement = DndElement,
  D extends DndElement = DndElement,
  SLabel extends S['label'] = S['label'],
> = {
  scope: 's';
  source: SLabel;
  draggable?: Draggable<PickDndElement<S, SLabel>>;
  onDrag?: OnDrag<PickDndElement<S, SLabel>, D>;
  onDragStart?: OnDragStart<PickDndElement<S, SLabel>>;
  onDragPrevent?: OnDragPrevent<PickDndElement<S, SLabel>>;
  onDragEnter?: OnDragEnter<PickDndElement<S, SLabel>, D>;
  onDragOver?: OnDragOver<PickDndElement<S, SLabel>, D>;
  onDragLeave?: OnDragLeave<PickDndElement<S, SLabel>, D, D>;
  onDrop?: OnDrop<PickDndElement<S, SLabel>, D>;
  onDragEnd?: OnDragEnd<PickDndElement<S, SLabel>, D>;
};
export type DistributiveDndInteraction2<
  S extends DndElement,
  D extends DndElement,
> = S extends any ? DndInteraction2<S, D> : never;

export type DndInteraction3<
  S extends DndElement = DndElement,
  D extends DndElement = DndElement,
  E0 extends DndElement = D,
  DLabel extends D['label'] = D['label'],
> = {
  scope: 'd';
  dropzone: DLabel;
  droppable?: Droppable<S, PickDndElement<D, DLabel>>;
  onDrag?: OnDrag<
    S,
    PickDndElement<D, DLabel>,
    NonNullableProps<DragEvent<S, PickDndElement<D, DLabel>>>
  >;
  onDragEnter?: OnDragEnter<S, PickDndElement<D, DLabel>>;
  onDragOver?: OnDragOver<S, PickDndElement<D, DLabel>>;
  onDragLeave?: OnDragLeave<S, PickDndElement<D, DLabel>, E0>;
  onDrop?: OnDrop<S, PickDndElement<D, DLabel>>;
  onDragEnd?: OnDragEnd<
    S,
    PickDndElement<D, DLabel>,
    NonNullableProps<DragEndEvent<S, PickDndElement<D, DLabel>>>
  >;
};
export type DistributiveDndInteraction3<
  S extends DndElement,
  D extends DndElement,
  E0 extends DndElement = D,
> = D extends any ? DndInteraction3<S, D, E0> : never;

export type DndInteraction4<
  S extends DndElement = DndElement,
  D extends DndElement = DndElement,
  E0 extends DndElement = D,
  SLabel extends S['label'] = S['label'],
  DLabel extends D['label'] = D['label'],
> = {
  scope: 's+d';
  source: SLabel;
  dropzone: DLabel;
  droppable?: Droppable<PickDndElement<S, SLabel>, PickDndElement<D, DLabel>>;
  dropEffect?: DropEffect<PickDndElement<S, SLabel>, PickDndElement<D, DLabel>>;
  onDrag?: OnDrag<
    PickDndElement<S, SLabel>,
    PickDndElement<D, DLabel>,
    NonNullableProps<
      DragEvent<PickDndElement<S, SLabel>, PickDndElement<D, DLabel>>
    >
  >;
  onDragEnter?: OnDragEnter<
    PickDndElement<S, SLabel>,
    PickDndElement<D, DLabel>
  >;
  onDragOver?: OnDragOver<PickDndElement<S, SLabel>, PickDndElement<D, DLabel>>;
  onDragLeave?: OnDragLeave<
    PickDndElement<S, SLabel>,
    PickDndElement<D, DLabel>,
    E0
  >;
  onDrop?: OnDrop<PickDndElement<S, SLabel>, PickDndElement<D, DLabel>>;
  onDragEnd?: OnDragEnd<
    PickDndElement<S, SLabel>,
    PickDndElement<D, DLabel>,
    NonNullableProps<
      DragEndEvent<PickDndElement<S, SLabel>, PickDndElement<D, DLabel>>
    >
  >;
};
export type DistributiveDndInteraction4<
  S extends DndElement,
  D extends DndElement,
  E0 extends DndElement = D,
> = S extends any ? (D extends any ? DndInteraction4<S, D, E0> : never) : never;

export type DndInteraction<
  S extends DndElement = DndElement,
  D extends DndElement = DndElement,
  E0 extends DndElement = D,
> =
  | DndInteraction1<S, D>
  | DistributiveDndInteraction2<S, D>
  | DistributiveDndInteraction3<S, D, E0>
  | DistributiveDndInteraction4<S, D, E0>;

export function inferDropEffect(
  effectAllowed: DataTransfer['effectAllowed']
): DataTransfer['dropEffect'] {
  switch (effectAllowed) {
    case 'none':
    default:
      return 'none';
    case 'copy':
    case 'copyLink':
    case 'copyMove':
    case 'all':
    case 'uninitialized':
      return 'copy';
    case 'link':
    case 'linkMove':
      return 'link';
    case 'move':
      return 'move';
  }
}
