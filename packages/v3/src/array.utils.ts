import { isRef, unref } from 'vue';
import type { Ref } from 'vue';

type MaybeRef<T> = T | Ref<T>;

/**
 * Inserts new elements at the start of an array, and returns the new length of the array.
 * @param array The array.
 * @param items Elements to insert at the start of the array.
 */
export function unshift<T = unknown>(array: MaybeRef<T[]>, ...items: T[]) {
  const target = isRef(array) ? [...array.value] : array;
  const ret = target.unshift(...items);
  if (isRef(array)) {
    array.value = target;
  }
  return ret;
}

/**
 * Removes the first element from an array and returns it. If the array is empty, undefined is returned and the array is not modified.
 * @param array The array.
 */
export function shift<T = unknown>(array: MaybeRef<T[]>) {
  if (!unref(array).length) return void 0;

  const target = isRef(array) ? [...array.value] : array;
  const ret = target.shift();
  if (isRef(array)) {
    array.value = target;
  }
  return ret;
}

/**
 * Appends new elements to the end of an array, and returns the new length of the array.
 * @param array The array.
 * @param items New elements to add to the array.
 */
export function push<T = unknown>(array: MaybeRef<T[]>, ...items: T[]) {
  const target = isRef(array) ? [...array.value] : array;
  const ret = target.push(...items);
  if (isRef(array)) {
    array.value = target;
  }
  return ret;
}

/**
 * Removes the last element from an array and returns it. If the array is empty, undefined is returned and the array is not modified.
 * @param array The array.
 */
export function pop<T = unknown>(array: MaybeRef<T[]>) {
  if (!unref(array).length) return void 0;

  const target = isRef(array) ? [...array.value] : array;
  const ret = target.pop();
  if (isRef(array)) {
    array.value = target;
  }
  return ret;
}

/**
 * Removes elements from an array and, if necessary, inserts new elements in their place, returning the deleted elements.
 * @param array The array.
 * @param start The zero-based location in the array from which to start removing elements.
 * @param deleteCount The number of elements to remove.
 * @returns An array containing the elements that were deleted.
 */
export function splice<T = unknown>(
  array: MaybeRef<T[]>,
  start: number,
  deleteCount?: number
): T[];
/**
 * Removes elements from an array and, if necessary, inserts new elements in their place, returning the deleted elements.
 * @param array The array.
 * @param start The zero-based location in the array from which to start removing elements.
 * @param deleteCount The number of elements to remove.
 * @param items Elements to insert into the array in place of the deleted elements.
 * @returns An array containing the elements that were deleted.
 */
export function splice<T = unknown>(
  array: MaybeRef<T[]>,
  start: number,
  deleteCount: number,
  ...items: T[]
): T[];
export function splice<T = unknown>(
  array: MaybeRef<T[]>,
  start: number,
  deleteCount?: number,
  ...items: T[]
): T[] {
  let ret: T[] = [];
  const target = isRef(array) ? [...array.value] : array;

  if (typeof deleteCount === 'undefined') {
    ret = target.splice(start);
  } else if (items.length === 0) {
    ret = target.splice(start, deleteCount);
  } else {
    ret = target.splice(start, deleteCount, ...items);
  }

  if (isRef(array)) {
    array.value = target;
  }

  return ret;
}

/**
 * Returns the value of the first element in the array where predicate is true, and undefined otherwise.
 * @param array The array.
 * @param predicate find calls predicate once for each element of the array, in ascending
 * order, until it finds one where predicate returns true. If such an element is found,
 * find immediately returns that element value. Otherwise, find returns undefined.
 */
export function find<T = unknown>(
  array: MaybeRef<T[]>,
  predicate: (value: T, index: number, obj: T[]) => unknown
) {
  return unref(array).find(predicate);
}

/**
 * Returns the value of the last element in the array where predicate is true, and undefined otherwise.
 * @param array The array.
 * @param predicate findLast calls predicate once for each element of the array, in descending
 * order, until it finds one where predicate returns true. If such an element is found,
 * findLast immediately returns that element value. Otherwise, find returns undefined.
 */
export function findLast<T = unknown>(
  array: MaybeRef<T[]>,
  predicate: (value: T, index: number, obj: T[]) => unknown
) {
  return unref(array).findLast(predicate);
}

/**
 * Returns the index of the first element in the array where predicate is true, and -1 otherwise.
 * @param array The array.
 * @param predicate findIndex calls predicate once for each element of the array, in ascending
 * order, until it finds one where predicate returns true. If such an element is found,
 * findIndex immediately returns that element index. Otherwise, findIndex returns -1.
 */
export function findIndex<T = unknown>(
  array: MaybeRef<T[]>,
  predicate: (value: T, index: number, obj: T[]) => unknown
) {
  return unref(array).findIndex(predicate);
}

/**
 * Returns the index of the last element in the array where predicate is true, and -1 otherwise.
 * @param array The array.
 * @param predicate findLastIndex calls predicate once for each element of the array, in descending
 * order, until it finds one where predicate returns true. If such an element is found,
 * findLastIndex immediately returns that element index. Otherwise, findLastIndex returns -1.
 */
export function findLastIndex<T = unknown>(
  array: MaybeRef<T[]>,
  predicate: (value: T, index: number, obj: T[]) => unknown
) {
  return unref(array).findLastIndex(predicate);
}

/**
 * Swaps elements in an array, and returns true if successfully swapped, and false otherwise.
 * @param array The array.
 * @param where1 The first location of the element to be swapped in the array,
 * supports index and predicate function to find index.
 * @param where2 The second location of the element to be swapped in the array,
 * supports index and predicate function to find index.
 */
export function swap<T = unknown>(
  array: MaybeRef<T[]>,
  where1: number | ((value: T, index: number, obj: T[]) => unknown),
  where2: number | ((value: T, index: number, obj: T[]) => unknown)
): boolean;
/**
 * Swaps elements between two arrays, and returns true if successfully swapped, and false otherwise.
 * @param array1 The first array.
 * @param where1 The location of the element to be swapped in the first array, supports index and predicate function to find index.
 * @param array2 The second array.
 * @param where1 The location of the element to be swapped in the second array, supports index and predicate function to find index.
 */
export function swap<T = unknown>(
  array1: MaybeRef<T[]>,
  where1: number | ((value: T, index: number, obj: T[]) => unknown),
  array2: MaybeRef<T[]>,
  where2: number | ((value: T, index: number, obj: T[]) => unknown)
): boolean;
export function swap<T = unknown>(
  array1: MaybeRef<T[]>,
  where1: number | ((value: T, index: number, obj: T[]) => unknown),
  array2OrWhere2:
    | MaybeRef<T[]>
    | number
    | ((value: T, index: number, obj: T[]) => unknown),
  where2?: number | ((value: T, index: number, obj: T[]) => unknown)
) {
  if (!unref(array1).length) return false;
  const array2 =
    typeof array2OrWhere2 !== 'number' && typeof array2OrWhere2 !== 'function'
      ? array2OrWhere2
      : array1;
  if (!unref(array2).length) return false;

  const _index1 =
    typeof where1 === 'number' ? where1 : findIndex(array1, where1);
  if (_index1 < 0 || _index1 > unref(array1).length - 1) {
    return false;
  }

  const _where2 =
    typeof array2OrWhere2 === 'number' || typeof array2OrWhere2 === 'function'
      ? array2OrWhere2
      : where2!;
  const _index2 =
    typeof _where2 === 'number' ? _where2 : findIndex(array2, _where2);
  if (_index2 < 0 || _index2 > unref(array2).length - 1) {
    return false;
  }

  const target1 = isRef(array1) ? [...array1.value] : array1;
  const target2 =
    array1 === array2 ? target1 : isRef(array2) ? [...array2.value] : array2;
  const temp = target1[_index1];
  target1[_index1] = target2[_index2];
  target2[_index2] = temp;
  if (isRef(array1)) {
    array1.value = target1;
  }
  if (isRef(array2) && array1 !== array2) {
    array2.value = target2;
  }
  return true;
}

/**
 * Removes a element from an array, and returns it if successfully removed, and undefined otherwise.
 * @param array - The array.
 * @param where - The location of the element to be removed, supports index and predicate function to find index.
 */
export function remove<T = unknown>(
  array: MaybeRef<T[]>,
  where: number | ((value: T, index: number, obj: T[]) => unknown)
) {
  if (!unref(array).length) return void 0;
  const index = typeof where === 'number' ? where : findIndex(array, where);
  if (index < 0 || index > unref(array).length - 1) return void 0;

  const target = isRef(array) ? [...array.value] : array;
  const ret = target.splice(index, 1)[0];
  if (isRef(array)) {
    array.value = target;
  }
  return ret;
}

/**
 * Inserts elements at specified position in an array, and returns the new length of the array.
 * @param array - The array.
 * @param where - The insertion location, supports index and predicate function to find index.
 * @param direction - Insert at the front or at the back of the insertion location.
 * @param items Elements to insert into the array.
 */
export function insert<T = unknown>(
  array: MaybeRef<T[]>,
  where: number | ((value: T, index: number, obj: T[]) => unknown),
  direction: 'before' | 'after' | -1 | 1,
  ...items: T[]
) {
  let index = typeof where === 'number' ? where : findIndex(array, where);
  if (index === -1 && typeof where === 'function') return unref(array).length;

  const target = isRef(array) ? [...array.value] : array;
  if (direction === 'after' || direction === 1) {
    index++;
  }
  target.splice(index, 0, ...items);
  if (isRef(array)) {
    array.value = target;
  }

  return target.length;
}
