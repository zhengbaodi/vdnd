import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { watchSyncEffect } from 'vue';
import useDndInstance, { DndInstance } from '../../compositions/UseDndInstance';
import { MouseDndOptions } from '../../types';
import DndElement from '../../DndElement';

let inst: DndInstance<MouseDndOptions>;

const el = new DndElement(null, null, null, null, false, false, false, false);

beforeEach(() => {
  inst = useDndInstance({
    type: 'mouse',
  });
});

afterEach(() => {
  inst.$destroy();
});

it("'options' should be reactive", () => {
  let dummy = 0;
  watchSyncEffect(() => {
    dummy += Number(!!inst.options);
  });
  inst.options.strict = true;
  inst.options = {
    strict: false,
  };
  expect(dummy).toBe(2);
});

it('should work as emitter', () => {
  const onDrag = vi.fn();
  const onDragStart = vi.fn();

  inst.on('drag', onDrag);
  inst.$emit('drag', {} as any);
  inst.off('drag', onDrag);
  inst.$emit('drag', {} as any);
  expect(onDrag).toBeCalledTimes(1);

  inst.once('drag:start', onDragStart);
  inst.$emit('drag:start', {} as any);
  inst.$emit('drag:start', {} as any);
  expect(onDragStart).toBeCalledTimes(1);
});

it('rootDndElement get/set', () => {
  inst.$setRootDndElement(el);
  expect(inst.rootDndElement).toBe(el);
});

describe('apis about source', () => {
  it('get/set', () => {
    expect(inst.source).toBeNull();
    inst.$setSource(el);
    expect(inst.source).toBe(el);
  });

  it('isDragging', () => {
    expect(inst.isDragging()).toBe(false);
    inst.$setSource(
      new DndElement(null, null, 'label', 'value', true, true, true, true)
    );
    expect(inst.isDragging()).toBe(true);
    expect(inst.isDragging('label')).toBe(true);
    expect(inst.isDragging(['xxx', 'label'])).toBe(true);
    expect(inst.isDragging({ value: 'value' })).toBe(true);
  });
});

describe('apis about over', () => {
  it('get/set', () => {
    expect(inst.over).toBeNull();
    inst.$setOver(el);
    expect(inst.over).toBe(el);
  });

  it('isOver', () => {
    expect(inst.isOver()).toBe(false);
    inst.$setOver(
      new DndElement(null, null, 'label', 'value', true, true, true, true)
    );
    expect(inst.isOver()).toBe(true);
    expect(inst.isOver('label')).toBe(true);
    expect(inst.isOver(['xxx', 'label'])).toBe(true);
    expect(inst.isOver({ value: 'value' })).toBe(true);
  });
});
