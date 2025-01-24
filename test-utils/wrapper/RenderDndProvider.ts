import { defineComponent, h, isVNode, VNode } from 'vue';
import { DOMWrapper, mount } from '@vue/test-utils';
import {
  useMouseDnd,
  useNativeDnd,
  useTouchDnd,
} from '@wrapper/compositions/UseDndInstance';
import DndSource from '@wrapper/components/DndSource';
import DndHandle from '@wrapper/components/DndHandle';
import DndDropzone from '@wrapper/components/DndDropzone';
import MouseDnd from '@wrapper/components/MouseDnd';
import TouchDnd from '@wrapper/components/TouchDnd';
import NativeDnd from '@wrapper/components/NativeDnd';
import { defaultDndClasses } from '@wrapper/compositions/UseDndProvider';
import {
  DndProvider,
  DndOptions,
  DndInstance,
  DndType,
  MouseDndOptions,
  TouchDndOptions,
  NativeDndOptions,
} from './Types';

const body = new DOMWrapper(document.body);

const cleanups: (() => void)[] = [];
export function releaseDndProviders() {
  cleanups.forEach((cleanup) => cleanup());
  cleanups.length = 0;
}

function _renderDndProvider<O extends DndOptions>(
  Provider: DndProvider,
  options: Omit<O, 'type'>,
  children: VNode | VNode[] | (() => any) = []
) {
  let dnd!: DndInstance<O>;
  const Wrapper = defineComponent(() => {
    const type = getDndType(Provider);
    const useDnd =
      type === 'mouse'
        ? useMouseDnd
        : type === 'touch'
          ? useTouchDnd
          : useNativeDnd;
    dnd = useDnd(options) as DndInstance<O>;
    return () =>
      h(
        // @ts-ignore
        Provider,
        {
          class: 'root',
          instance: dnd,
        },
        typeof children === 'function' ? children : () => children
      );
  });
  const wrapper = mount(Wrapper, {
    attachTo: document.body,
  });
  const container = wrapper.find('.root').element;
  const _Provider = wrapper.findComponent(Provider);
  const Handle = wrapper.findComponent(DndHandle);
  const Handles = wrapper.findAllComponents(DndHandle);
  const Sources = wrapper
    .findAllComponents(DndSource)
    .filter((s) => s.exists());
  const Dropzones = wrapper
    .findAllComponents(DndDropzone)
    .filter((d) => d.exists());
  const destroy = () => {
    const mirror = body.find(`.${defaultDndClasses['mirror']}`);
    if (mirror.exists()) {
      mirror.element.remove();
    }
    wrapper.unmount();
  };

  const _Dropzones = [
    ...Dropzones,
    ...Sources.filter((source) => source.props('dropzone')),
  ].sort((a, b) => {
    const vm1 = a.getCurrentComponent();
    const vm2 = b.getCurrentComponent();
    return vm1.uid < vm2.uid ? -1 : 1;
  });

  return {
    destroy,
    container,
    instance: dnd,
    provider: _Provider,
    handle: Handle.exists() ? Handle : null,
    handles: Handles.filter((Handle) => Handle.exists()),
    source: Sources[0] || null,
    sources: Sources,
    dropzone: _Dropzones[0] || null,
    dropzones: _Dropzones,
  };
}

type RenderedResult = Omit<ReturnType<typeof _renderDndProvider>, 'destroy'>;

type ProviderChildren = VNode | VNode[] | (() => any);

function getDndType(provider: DndProvider): DndType {
  switch (provider) {
    case MouseDnd:
      return 'mouse';
    case TouchDnd:
      return 'touch';
    case NativeDnd:
      return 'native';
    default:
      throw new Error(`Unknown Provider: ${provider}`);
  }
}

type OmitTypeProp<T> = Omit<T, 'type'>;

type GetDndOptionsWithoutTypeByProvider<P extends DndProvider> =
  P extends typeof MouseDnd
    ? OmitTypeProp<MouseDndOptions>
    : P extends typeof TouchDnd
      ? OmitTypeProp<TouchDndOptions>
      : P extends typeof NativeDnd
        ? OmitTypeProp<NativeDndOptions>
        : never;

export function renderDndProvider<P extends DndProvider>(
  Provider: P,
  options: GetDndOptionsWithoutTypeByProvider<P>,
  children?: ProviderChildren
): RenderedResult;
export function renderDndProvider<P extends DndProvider>(
  Provider: P,
  children: ProviderChildren
): RenderedResult;
export function renderDndProvider<P extends DndProvider>(
  Provider: P
): RenderedResult;
export function renderDndProvider<P extends DndProvider>(
  Provider: P,
  optionsOrChildren?: GetDndOptionsWithoutTypeByProvider<P> | ProviderChildren,
  children: ProviderChildren = []
) {
  let _options: GetDndOptionsWithoutTypeByProvider<P>;
  let _children: () => VNode[];
  if (isVNode(optionsOrChildren)) {
    _children = () => [optionsOrChildren];
    _options = {} as GetDndOptionsWithoutTypeByProvider<P>;
  } else if (typeof optionsOrChildren === 'function') {
    _children = optionsOrChildren;
    _options = {} as GetDndOptionsWithoutTypeByProvider<P>;
  } else if (Array.isArray(optionsOrChildren)) {
    _children = () => optionsOrChildren;
    _options = {} as GetDndOptionsWithoutTypeByProvider<P>;
  } else {
    _children =
      typeof children === 'function'
        ? children
        : () => (isVNode(children) ? [children] : children);
    _options = optionsOrChildren as GetDndOptionsWithoutTypeByProvider<P>;
  }

  const { destroy, ...result } = _renderDndProvider(
    Provider,
    _options,
    _children
  );

  cleanups.push(destroy);

  return result;
}
