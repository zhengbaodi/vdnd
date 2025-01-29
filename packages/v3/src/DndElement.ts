import { isDef, ensureArray } from '@vdnd/shared';

let id = 0;
const generateId = () => id++;

const hasOwn = Object.prototype.hasOwnProperty;

export interface DndElementMatcher<Value = any> {
  /**
   * The internal id of the element must be the specified.
   */
  id?: number;

  /**
   * The element must play the specified role.
   */
  role?: 'source' | 'dropzone' | '*';

  /**
   * The label of the element must be one of the specified.
   */
  label?: string | string[];

  /**
   * The value of the element must be the specified, vdnd will use `Object.is` to compare.
   */
  value?: Value;

  /**
   * The nativeEl of the element must be one of the specified.
   */
  nativeEl?: HTMLElement | HTMLElement[];

  /**
   * The the element must be droppable or not.
   */
  droppable?: boolean;

  /**
   * The the element must be draggable or not.
   */
  draggable?: boolean;
}

export default class DndElement<Value = any> {
  /** internal id */
  id = generateId();

  role: {
    /** true, if as source */
    source: boolean;

    /** true, if as dropzone */
    dropzone: boolean;
  };

  children: DndElement<Value>[] = [];

  constructor(
    public parent: DndElement<Value> | null,
    public nativeEl: HTMLElement | null,
    public label: string | undefined = void 0,
    public value: Value | undefined = void 0,
    source = false,
    public draggable = false,
    dropzone = false,
    public droppable = false
  ) {
    this.role = {
      source: source,
      dropzone: dropzone,
    };
  }

  /**
   * Returns true, if the element satisfies specified matcher.
   */
  matches(matcher: DndElementMatcher) {
    let count = 0;

    for (const key in matcher) {
      if (!isDef(matcher[key]) || !hasOwn.call(matcher, key)) continue;

      switch (key as keyof DndElementMatcher) {
        case 'role': {
          count++;
          const { source, dropzone } = this.role;
          if (
            (matcher.role === 'source' && !source) ||
            (matcher.role === 'dropzone' && !dropzone) ||
            (matcher.role === '*' && (!source || !dropzone))
          )
            return false;
          break;
        }

        case 'id':
        case 'draggable':
        case 'droppable': {
          count++;
          if (!Object.is(this[key], matcher[key])) {
            return false;
          }
          break;
        }

        case 'label':
        case 'value':
        case 'nativeEl': {
          count++;
          if (
            ensureArray(matcher[key]).every(
              (item) => !Object.is(this[key], item)
            )
          ) {
            return false;
          }
          break;
        }
      }
    }

    return count > 0;
  }
}
