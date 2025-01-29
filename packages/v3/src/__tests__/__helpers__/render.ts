import { defineComponent, h, VNode } from 'vue';
import { DOMWrapper, mount } from '@vue/test-utils';
import {
  DndType,
  DndInstance,
  DndOptions,
  NativeDnd,
  MouseDnd,
  TouchDnd,
  DndProvider,
  useMouseDnd,
  useNativeDnd,
  useTouchDnd,
  DndSource,
  DndHandle,
  DndDropzone,
  defaultDndClasses,
} from '../..';

const body = new DOMWrapper(document.body);

export type ProviderChildren = VNode | VNode[] | (() => any);

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

export function renderDndProvider(
  Provider: DndProvider,
  options: Omit<DndOptions, 'type'>,
  children: ProviderChildren
) {
  let dnd!: DndInstance;
  const Wrapper = defineComponent(() => {
    const type = getDndType(Provider);
    const useDnd =
      type === 'mouse'
        ? useMouseDnd
        : type === 'touch'
          ? useTouchDnd
          : useNativeDnd;
    dnd = useDnd(options) as DndInstance;
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
