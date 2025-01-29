import { beforeEach, describe, expect, it } from 'vitest';
import {
  ref,
  shallowRef,
  reactive,
  shallowReactive,
  unref,
  watch,
  nextTick,
} from 'vue';
import {
  unshift,
  shift,
  push,
  pop,
  splice,
  find,
  findLast,
  findIndex,
  findLastIndex,
  swap,
  remove,
  insert,
} from '../array.utils';

const returnTrue = () => true;
const returnFalse = () => false;

function createTestTarget<T>(values: T[]) {
  return {
    raw: [...values],
    ref: ref([...values]),
    shallowRef: shallowRef([...values]),
    reactive: reactive([...values]),
    shallowReactive: shallowReactive([...values]),
  };
}
type TestTarget<T = unknown> = ReturnType<typeof createTestTarget<T>>;

function makeTestTargetEmpty(target: TestTarget) {
  target.raw.length = 0;
  target.ref.value = [];
  target.shallowRef.value = [];
  target.reactive.length = 0;
  target.shallowReactive.length = 0;
  return target;
}

function createTestWatcher(test: TestTarget, callafter: () => void) {
  watch(test.ref, callafter, { flush: 'pre' });
  watch(test.shallowRef, callafter, { flush: 'pre' });
  watch(test.reactive, callafter, { flush: 'pre' });
  watch(test.shallowReactive, callafter, { flush: 'pre' });
}

it('find', () => {
  const obj = createTestTarget([1, 2]);
  expect(find(obj.ref, (a) => a % 2 === 0)).toBe(2);
  expect(find(obj.shallowRef, (a) => a % 2 === 0)).toBe(2);
  expect(find(obj.reactive, (a) => a % 2 === 0)).toBe(2);
  expect(find(obj.shallowReactive, (a) => a % 2 === 0)).toBe(2);
  expect(find(obj.raw, (a) => a % 2 === 0)).toBe(2);
});

it('findLast', () => {
  const obj = createTestTarget([0, 2]);
  expect(findLast(obj.ref, (a) => a % 2 === 0)).toBe(2);
  expect(findLast(obj.shallowRef, (a) => a % 2 === 0)).toBe(2);
  expect(findLast(obj.reactive, (a) => a % 2 === 0)).toBe(2);
  expect(findLast(obj.shallowReactive, (a) => a % 2 === 0)).toBe(2);
  expect(findLast(obj.raw, (a) => a % 2 === 0)).toBe(2);
});

it('findIndex', () => {
  const obj = createTestTarget([1, 2]);
  expect(findIndex(obj.ref, (a) => a % 2 === 0)).toBe(1);
  expect(findIndex(obj.shallowRef, (a) => a % 2 === 0)).toBe(1);
  expect(findIndex(obj.reactive, (a) => a % 2 === 0)).toBe(1);
  expect(findIndex(obj.shallowReactive, (a) => a % 2 === 0)).toBe(1);
  expect(findIndex(obj.raw, (a) => a % 2 === 0)).toBe(1);
});

it('findLastIndex', () => {
  const obj = createTestTarget([0, 2]);
  expect(findLastIndex(obj.ref, (a) => a % 2 === 0)).toBe(1);
  expect(findLastIndex(obj.shallowRef, (a) => a % 2 === 0)).toBe(1);
  expect(findLastIndex(obj.reactive, (a) => a % 2 === 0)).toBe(1);
  expect(findLastIndex(obj.shallowReactive, (a) => a % 2 === 0)).toBe(1);
  expect(findLastIndex(obj.raw, (a) => a % 2 === 0)).toBe(1);
});

it('unshift', async () => {
  let dummy = 0;
  const obj = createTestTarget([1]);
  createTestWatcher(obj, () => dummy++);

  function _test(key: keyof TestTarget) {
    expect(unshift(obj[key], 0)).toBe(2);
    expect(unref(obj[key])).toEqual([0, 1]);
  }
  _test('ref');
  _test('shallowRef');
  _test('reactive');
  _test('shallowReactive');
  _test('raw');
  await nextTick();
  expect(dummy).toBe(4);
});

it('shift', async () => {
  let dummy = 0;
  const obj = createTestTarget([1, 2]);
  createTestWatcher(obj, () => dummy++);

  const empty = [];
  expect(shift(empty)).toBeUndefined();
  expect(empty).toEqual([]);
  function _test(key: keyof TestTarget) {
    expect(shift(obj[key])).toBe(1);
    expect(unref(obj[key])).toEqual([2]);
  }
  _test('ref');
  _test('shallowRef');
  _test('reactive');
  _test('shallowReactive');
  _test('raw');
  await nextTick();
  expect(dummy).toBe(4);
});

it('push', async () => {
  let dummy = 0;
  const obj = createTestTarget([1]);
  createTestWatcher(obj, () => dummy++);

  function _test(key: keyof TestTarget) {
    expect(push(obj[key], 2)).toBe(2);
    expect(unref(obj[key])).toEqual([1, 2]);
  }
  _test('ref');
  _test('shallowRef');
  _test('reactive');
  _test('shallowReactive');
  _test('raw');
  await nextTick();
  expect(dummy).toBe(4);
});

it('pop', async () => {
  let dummy = 0;
  const obj = createTestTarget([1, 2]);
  createTestWatcher(obj, () => dummy++);

  const empty = [];
  expect(pop(empty)).toBeUndefined();
  expect(empty).toEqual([]);
  function _test(key: keyof TestTarget) {
    expect(pop(obj[key])).toBe(2);
    expect(unref(obj[key])).toEqual([1]);
  }
  _test('ref');
  _test('shallowRef');
  _test('reactive');
  _test('shallowReactive');
  _test('raw');
  await nextTick();
  expect(dummy).toBe(4);
});

describe('splice', () => {
  let obj: TestTarget<number>;
  beforeEach(() => {
    obj = createTestTarget([1, 2]);
  });

  it('signature: (array, start)', async () => {
    let dummy = 0;
    createTestWatcher(obj, () => dummy++);

    function _test(key: keyof TestTarget) {
      expect(splice(obj[key], 0)).toEqual([1, 2]);
      expect(unref(obj[key])).toEqual([]);
    }
    _test('ref');
    _test('shallowRef');
    _test('reactive');
    _test('shallowReactive');
    _test('raw');
    await nextTick();
    expect(dummy).toBe(4);
  });

  it('signature: (array, start, deleteCount)', async () => {
    let dummy = 0;
    createTestWatcher(obj, () => dummy++);

    function _test(key: keyof TestTarget) {
      expect(splice(obj[key], 0, 1)).toEqual([1]);
      expect(unref(obj[key])).toEqual([2]);
    }
    _test('ref');
    _test('shallowRef');
    _test('reactive');
    _test('shallowReactive');
    _test('raw');
    await nextTick();
    expect(dummy).toBe(4);
  });

  it('signature: (array, start, deleteCount, ...items)', async () => {
    let dummy = 0;
    createTestWatcher(obj, () => dummy++);

    function _test(key: keyof TestTarget) {
      expect(splice(obj[key], 0, 1, 0)).toEqual([1]);
      expect(unref(obj[key])).toEqual([0, 2]);
    }
    _test('ref');
    _test('shallowRef');
    _test('reactive');
    _test('shallowReactive');
    _test('raw');
    await nextTick();
    expect(dummy).toBe(4);
  });
});

describe('swaps elements in an array', () => {
  let obj: TestTarget<number>;
  beforeEach(() => {
    obj = createTestTarget([1, 2]);
  });

  it('should return false and should not modify the array, if the array is empty', async () => {
    let dummy = 0;
    makeTestTargetEmpty(obj);
    createTestWatcher(obj, () => dummy++);
    function _test(key: keyof TestTarget) {
      expect(swap(obj[key], 0, 1)).toBe(false);
      expect(unref(obj[key])).toEqual([]);
    }
    _test('ref');
    _test('shallowRef');
    _test('reactive');
    _test('shallowReactive');
    _test('raw');
    await nextTick();
    expect(dummy).toBe(0);
  });

  it('should return false and should not modify the array, if an index is invalid', async () => {
    let dummy = 0;
    createTestWatcher(obj, () => dummy++);
    function _test(key: keyof TestTarget) {
      expect(swap(obj[key], -1, 0)).toBe(false);
      expect(swap(obj[key], 0, -1)).toBe(false);
      expect(unref(obj[key])).toEqual([1, 2]);
    }
    _test('ref');
    _test('shallowRef');
    _test('reactive');
    _test('shallowReactive');
    _test('raw');
    await nextTick();
    expect(dummy).toBe(0);
  });

  describe('should return true and modify the array, if parameters are expected', () => {
    it('index1(number) + index2(number)', async () => {
      let dummy = 0;
      createTestWatcher(obj, () => dummy++);
      function _test(key: keyof TestTarget) {
        expect(swap(obj[key], 0, 1)).toBe(true);
        expect(unref(obj[key])).toEqual([2, 1]);
      }
      _test('ref');
      _test('shallowRef');
      _test('reactive');
      _test('shallowReactive');
      _test('raw');
      await nextTick();
      expect(dummy).toBe(4);
    });

    it('index1(number) + index2(predicate)', async () => {
      let dummy = 0;
      createTestWatcher(obj, () => dummy++);
      function _test(key: keyof TestTarget) {
        expect(swap(obj[key], 1, returnTrue)).toBe(true);
        expect(unref(obj[key])).toEqual([2, 1]);
      }
      _test('ref');
      _test('shallowRef');
      _test('reactive');
      _test('shallowReactive');
      _test('raw');
      await nextTick();
      expect(dummy).toBe(4);
    });

    it('index1(predicate) + index2(number)', async () => {
      let dummy = 0;
      createTestWatcher(obj, () => dummy++);
      function _test(key: keyof TestTarget) {
        expect(swap(obj[key], returnTrue, 1)).toBe(true);
        expect(unref(obj[key])).toEqual([2, 1]);
      }
      _test('ref');
      _test('shallowRef');
      _test('reactive');
      _test('shallowReactive');
      _test('raw');
      await nextTick();
      expect(dummy).toBe(4);
    });

    it('index1(predicate) + index2(predicate)', async () => {
      let dummy = 0;
      createTestWatcher(obj, () => dummy++);
      function _test(key: keyof TestTarget) {
        expect(swap(obj[key], returnTrue, (_, index) => index === 1)).toBe(
          true
        );
        expect(unref(obj[key])).toEqual([2, 1]);
      }
      _test('ref');
      _test('shallowRef');
      _test('reactive');
      _test('shallowReactive');
      _test('raw');
      await nextTick();
      expect(dummy).toBe(4);
    });
  });
});

describe('swaps elements between two arrays', () => {
  let obj1: TestTarget<number>;
  let obj2: TestTarget<number>;
  beforeEach(() => {
    obj1 = createTestTarget([1, 2]);
    obj2 = createTestTarget([3, 4]);
  });

  it('should return false and should not modify arrays, if an array is empty', async () => {
    let dummy = 0;
    createTestWatcher(obj1, () => dummy++);
    function _test(key: keyof TestTarget) {
      expect(swap([], 0, obj1[key], 0)).toBe(false);
      expect(swap(obj1[key], 0, [], 0)).toBe(false);
      expect(unref(obj1[key])).toEqual([1, 2]);
    }
    _test('ref');
    _test('shallowRef');
    _test('reactive');
    _test('shallowReactive');
    _test('raw');
    await nextTick();
    expect(dummy).toBe(0);
  });

  it('should return false and should not modify arrays, if an index is invalid', async () => {
    let dummy = 0;
    createTestWatcher(obj1, () => dummy++);
    function _test(key: keyof TestTarget) {
      expect(swap(obj1[key], -1, obj2[key], 0)).toBe(false);
      expect(swap(obj1[key], 0, obj2[key], -1)).toBe(false);
      expect(unref(obj1[key])).toEqual([1, 2]);
      expect(unref(obj2[key])).toEqual([3, 4]);
    }
    _test('ref');
    _test('shallowRef');
    _test('reactive');
    _test('shallowReactive');
    _test('raw');
    await nextTick();
    expect(dummy).toBe(0);
  });

  describe('should return true and modify arrays, if parameters are expected', () => {
    it('index1(number) + index2(number)', async () => {
      let dummy = 0;
      createTestWatcher(obj1, () => dummy++);
      createTestWatcher(obj2, () => dummy++);
      function _test(key: keyof TestTarget) {
        expect(swap(obj1[key], 0, obj2[key], 0)).toBe(true);
        expect(unref(obj1[key])).toEqual([3, 2]);
        expect(unref(obj2[key])).toEqual([1, 4]);
      }
      _test('ref');
      _test('shallowRef');
      _test('reactive');
      _test('shallowReactive');
      _test('raw');
      await nextTick();
      expect(dummy).toBe(8);
    });

    it('index1(number) + index2(predicate)', async () => {
      let dummy = 0;
      createTestWatcher(obj1, () => dummy++);
      createTestWatcher(obj2, () => dummy++);
      function _test(key: keyof TestTarget) {
        expect(swap(obj1[key], 0, obj2[key], returnTrue)).toBe(true);
        expect(unref(obj1[key])).toEqual([3, 2]);
        expect(unref(obj2[key])).toEqual([1, 4]);
      }
      _test('ref');
      _test('shallowRef');
      _test('reactive');
      _test('shallowReactive');
      _test('raw');
      await nextTick();
      expect(dummy).toBe(8);
    });

    it('index1(predicate) + index2(number)', async () => {
      let dummy = 0;
      createTestWatcher(obj1, () => dummy++);
      createTestWatcher(obj2, () => dummy++);
      function _test(key: keyof TestTarget) {
        expect(swap(obj1[key], returnTrue, obj2[key], 0)).toBe(true);
        expect(unref(obj1[key])).toEqual([3, 2]);
        expect(unref(obj2[key])).toEqual([1, 4]);
      }
      _test('ref');
      _test('shallowRef');
      _test('reactive');
      _test('shallowReactive');
      _test('raw');
      await nextTick();
      expect(dummy).toBe(8);
    });

    it('index1(predicate) + index2(predicate)', async () => {
      let dummy = 0;
      createTestWatcher(obj1, () => dummy++);
      createTestWatcher(obj2, () => dummy++);
      function _test(key: keyof TestTarget) {
        expect(swap(obj1[key], returnTrue, obj2[key], returnTrue)).toBe(true);
        expect(unref(obj1[key])).toEqual([3, 2]);
        expect(unref(obj2[key])).toEqual([1, 4]);
      }
      _test('ref');
      _test('shallowRef');
      _test('reactive');
      _test('shallowReactive');
      _test('raw');
      await nextTick();
      expect(dummy).toBe(8);
    });
  });
});

describe('remove', () => {
  let obj: TestTarget<number>;
  beforeEach(() => {
    obj = createTestTarget([1, 2]);
  });

  it('should return undefined and should not modify array, if the array is empty', async () => {
    let dummy = 0;
    makeTestTargetEmpty(obj);
    createTestWatcher(obj, () => dummy++);
    function _test(key: keyof TestTarget) {
      expect(remove(obj[key], 0)).toBeUndefined();
      expect(unref(obj[key])).toEqual([]);
    }
    _test('ref');
    _test('shallowRef');
    _test('reactive');
    _test('shallowReactive');
    _test('raw');
    await nextTick();
    expect(dummy).toBe(0);
  });

  it('should return undefined and should not modify array, if the index is invalid', async () => {
    let dummy = 0;
    createTestWatcher(obj, () => dummy++);
    function _test(key: keyof TestTarget) {
      expect(remove(obj[key], -1)).toBeUndefined();
      expect(remove(obj[key], 100)).toBeUndefined();
      expect(remove(obj[key], returnFalse)).toBeUndefined();
      expect(unref(obj[key])).toEqual([1, 2]);
    }
    _test('ref');
    _test('shallowRef');
    _test('reactive');
    _test('shallowReactive');
    _test('raw');
    await nextTick();
    expect(dummy).toBe(0);
  });

  describe('should return the removed element and modify array, if parameters are expected', () => {
    it('the index is a number', async () => {
      let dummy = 0;
      createTestWatcher(obj, () => dummy++);

      function _test(key: keyof TestTarget) {
        expect(remove(obj[key], 0)).toBe(1);
        expect(unref(obj[key])).toEqual([2]);
      }
      _test('ref');
      _test('shallowRef');
      _test('reactive');
      _test('shallowReactive');
      _test('raw');
      await nextTick();
      expect(dummy).toBe(4);
    });

    it('finds the index by the predicate function', async () => {
      let dummy = 0;
      createTestWatcher(obj, () => dummy++);

      function _test(key: keyof TestTarget) {
        expect(remove(obj[key], returnTrue)).toBe(1);
        expect(unref(obj[key])).toEqual([2]);
      }
      _test('ref');
      _test('shallowRef');
      _test('reactive');
      _test('shallowReactive');
      _test('raw');
      await nextTick();
      expect(dummy).toBe(4);
    });
  });
});

describe('insert', () => {
  let obj: TestTarget<number>;
  beforeEach(() => {
    obj = createTestTarget([1, 2]);
  });

  it('should return current length of the array and should not modify it, if the index is invalid', async () => {
    let dummy = 0;
    createTestWatcher(obj, () => dummy++);

    function _test(key: keyof TestTarget) {
      expect(insert(obj[key], returnFalse, 'before', 1)).toBe(2);
      expect(insert(obj[key], returnFalse, -1, 1)).toBe(2);
      expect(insert(obj[key], returnFalse, 'after', 1)).toBe(2);
      expect(insert(obj[key], returnFalse, 1, 1)).toBe(2);
      expect(unref(obj[key])).toEqual([1, 2]);
    }
    _test('ref');
    _test('shallowRef');
    _test('reactive');
    _test('shallowReactive');
    _test('raw');
    await nextTick();
    expect(dummy).toBe(0);
  });

  describe('should return new length of the array and modify it, if parameters are expected', () => {
    it('inserts elements at the before of the index', async () => {
      let dummy = 0;
      createTestWatcher(obj, () => dummy++);

      function _test(key: keyof TestTarget) {
        expect(insert(obj[key], 0, 'before', -1, 0)).toBe(4);
        expect(insert(obj[key], 0, -1, -2)).toBe(5);
        expect(unref(obj[key])).toEqual([-2, -1, 0, 1, 2]);
      }
      _test('ref');
      _test('shallowRef');
      _test('reactive');
      _test('shallowReactive');
      _test('raw');
      await nextTick();
      expect(dummy).toBe(4);
    });

    it('inserts elements at the after of the index', async () => {
      let dummy = 0;
      createTestWatcher(obj, () => dummy++);

      function _test(key: keyof TestTarget) {
        expect(insert(obj[key], 1, 'after', 3, 4)).toBe(4);
        expect(insert(obj[key], 3, 1, 5)).toBe(5);
        expect(unref(obj[key])).toEqual([1, 2, 3, 4, 5]);
      }
      _test('ref');
      _test('shallowRef');
      _test('reactive');
      _test('shallowReactive');
      _test('raw');
      await nextTick();
      expect(dummy).toBe(4);
    });

    it('finds the index by the predicate function', async () => {
      let dummy = 0;
      createTestWatcher(obj, () => dummy++);
      const predicate = (_: number, index: number) => index === 0;

      function _test(key: keyof TestTarget) {
        expect(insert(obj[key], predicate, 'before', 0)).toBe(3);
        expect(unref(obj[key])).toEqual([0, 1, 2]);
      }
      _test('ref');
      _test('shallowRef');
      _test('reactive');
      _test('shallowReactive');
      _test('raw');
      await nextTick();
      expect(dummy).toBe(4);
    });
  });
});
