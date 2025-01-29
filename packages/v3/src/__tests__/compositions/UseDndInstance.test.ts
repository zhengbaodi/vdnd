import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { watchSyncEffect } from 'vue';
import { useDnd, DndElement, MouseDndOptions, DndInstance } from '../../';

let dnd: DndInstance<MouseDndOptions>;

const el = new DndElement(
  null,
  null,
  void 0,
  void 0,
  false,
  false,
  false,
  false
);

beforeEach(() => {
  dnd = useDnd({
    type: 'mouse',
  });
});

afterEach(() => {
  dnd.$destroy();
});

it("'options' should be reactive", () => {
  let dummy = 0;
  watchSyncEffect(() => {
    dummy += Number(!!dnd.options);
  });
  dnd.options.strict = true;
  dnd.options = {
    strict: false,
  };
  expect(dummy).toBe(2);
});

it('should work as emitter', () => {
  const onDrag = vi.fn();
  const onDragStart = vi.fn();

  dnd.on('drag', onDrag);
  dnd.$emit('drag', {} as any);
  dnd.off('drag', onDrag);
  dnd.$emit('drag', {} as any);
  expect(onDrag).toBeCalledTimes(1);

  dnd.once('drag:start', onDragStart);
  dnd.$emit('drag:start', {} as any);
  dnd.$emit('drag:start', {} as any);
  expect(onDragStart).toBeCalledTimes(1);
});

it('rootDndElement get/set', () => {
  dnd.$setRootDndElement(el);
  expect(dnd.rootDndElement).toBe(el);
});

describe('apis about source', () => {
  it('get/set', () => {
    expect(dnd.source).toBeNull();
    dnd.$setSource(el);
    expect(dnd.source).toBe(el);
  });

  it('isDragging', () => {
    expect(dnd.isDragging()).toBe(false);
    dnd.$setSource(
      new DndElement(null, null, 'label', 'value', true, true, true, true)
    );
    expect(dnd.isDragging()).toBe(true);
    expect(dnd.isDragging('label')).toBe(true);
    expect(dnd.isDragging(['xxx', 'label'])).toBe(true);
    expect(dnd.isDragging({ value: 'value' })).toBe(true);
  });
});

describe('apis about over', () => {
  it('get/set', () => {
    expect(dnd.over).toBeNull();
    dnd.$setOver(el);
    expect(dnd.over).toBe(el);
  });

  it('isOver', () => {
    expect(dnd.isOver()).toBe(false);
    dnd.$setOver(
      new DndElement(null, null, 'label', 'value', true, true, true, true)
    );
    expect(dnd.isOver()).toBe(true);
    expect(dnd.isOver('label')).toBe(true);
    expect(dnd.isOver(['xxx', 'label'])).toBe(true);
    expect(dnd.isOver({ value: 'value' })).toBe(true);
  });
});
