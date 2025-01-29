import { it, describe, expect, beforeEach } from 'vitest';
import DndElement from '../DndElement';

let el: DndElement<any>;
beforeEach(() => {
  el = new DndElement(null, document.body, 'test', 1, true, true, true, true);
});

it('construction', () => {
  expect(el.role.source).toBe(true);
  expect(el.role.dropzone).toBe(true);
});

describe('method#matches', () => {
  it('role', () => {
    expect(
      el.matches({
        role: 'source',
      })
    ).toBe(true);
    expect(
      el.matches({
        role: 'dropzone',
      })
    ).toBe(true);
    expect(
      el.matches({
        role: '*',
      })
    ).toBe(true);

    el.role.source = false;
    el.role.dropzone = false;
    expect(
      el.matches({
        role: 'source',
      })
    ).toBe(false);
    expect(
      el.matches({
        role: 'dropzone',
      })
    ).toBe(false);
    expect(
      el.matches({
        role: '*',
      })
    ).toBe(false);
  });

  it('label', () => {
    expect(
      el.matches({
        label: 'test',
      })
    ).toBe(true);
    expect(
      el.matches({
        label: 'test1',
      })
    ).toBe(false);
    expect(
      el.matches({
        label: ['test1', 'test'],
      })
    ).toBe(true);
    expect(
      el.matches({
        label: ['test1', 'test2'],
      })
    ).toBe(false);
  });

  it('value', () => {
    expect(
      el.matches({
        value: 1,
      })
    ).toBe(true);
    expect(
      el.matches({
        value: 2,
      })
    ).toBe(false);
    expect(
      el.matches({
        value: [2, 1],
      })
    ).toBe(true);
    expect(
      el.matches({
        value: [2, 3],
      })
    ).toBe(false);
  });

  it('element', () => {
    const div1 = document.createElement('div');
    const div2 = document.createElement('div');
    expect(
      el.matches({
        nativeEl: document.body,
      })
    ).toBe(true);
    expect(
      el.matches({
        nativeEl: div1,
      })
    ).toBe(false);
    expect(
      el.matches({
        nativeEl: [div1, document.body],
      })
    ).toBe(true);
    expect(
      el.matches({
        nativeEl: [div1, div2],
      })
    ).toBe(false);
  });

  it('draggable', () => {
    expect(el.matches({ draggable: true })).toBe(true);
    expect(el.matches({ draggable: false })).toBe(false);
  });

  it('droppable', () => {
    expect(el.matches({ droppable: true })).toBe(true);
    expect(el.matches({ droppable: false })).toBe(false);
  });
});
