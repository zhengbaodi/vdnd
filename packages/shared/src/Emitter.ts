export type Callback<E extends unknown = unknown> = (event: E) => void;

type Callbacks<T extends EventTable> = {
  [K in keyof T]: Callback<T[K]>[];
};

export type EventTable<Payload extends unknown = unknown> = Record<
  string,
  Payload
>;

export default class Emitter<T extends EventTable = EventTable> {
  private callbacks: Partial<Callbacks<T>> = {};
  private onceCallbacks = new Set<Callback<any>>();

  /**
   * Registers callback by event name
   */
  on<K extends keyof T>(type: K, callback: Callback<T[K]>) {
    if (!this.callbacks[type]) {
      this.callbacks[type] = [];
    }

    this.callbacks[type]!.push(callback);

    return this;
  }

  /**
   * Registers disposable callback by event name
   */
  once<K extends keyof T>(type: K, callback: Callback<T[K]>) {
    if (!this.callbacks[type]) {
      this.callbacks[type] = [];
    }

    this.callbacks[type]!.push(callback);

    this.onceCallbacks.add(callback);

    return this;
  }

  /**
   * Unregisters callback by event name
   */
  off<K extends keyof T>(type: K, callback: Callback<T[K]>) {
    if (!this.callbacks[type]) {
      return this;
    }

    const callbacks = this.callbacks[type]!;
    const index = callbacks.indexOf(callback);
    if (index >= 0) {
      callbacks.splice(index, 1);
    }

    this.onceCallbacks.delete(callback);

    return this;
  }

  /**
   * Emits event callbacks by event object
   */
  emit<K extends keyof T>(type: K, payload: T[K]) {
    if (!this.callbacks[type]) {
      return this;
    }

    const callbacks = [...this.callbacks[type]!];
    const caughtErrors: unknown[] = [];

    for (let i = 0; i <= callbacks.length - 1; i++) {
      const callback = callbacks[i];

      try {
        callback(payload);
      } catch (error) {
        caughtErrors.push(error);
      }

      if (this.onceCallbacks.has(callback)) {
        this.off(type, callback);
      }
    }

    if (caughtErrors.length) {
      console.error(
        `[vdnd error]: caught errors while emitting '${type as string}':`
      );
      caughtErrors.forEach((error) => console.error(error));
    }

    return this;
  }

  destroy() {
    this.callbacks = {};
    this.onceCallbacks.clear();
  }
}
