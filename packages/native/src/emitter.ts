type Callback<E extends unknown = unknown> = (event: E) => void;

type Callbacks<T extends EventTable> = {
  [K in keyof T]: Callback<T[K]>[];
};

type EventTable<Payload = unknown> = Record<string, Payload>;

export class Emitter<T extends EventTable = EventTable> {
  private callbacks: Partial<Callbacks<T>> = {};
  private disposableCallbacks = new Set<Callback<any>>();

  on<K extends keyof T>(type: K, callback: Callback<T[K]>) {
    if (!this.callbacks[type]) {
      this.callbacks[type] = [];
    }

    this.callbacks[type]!.push(callback);

    return this;
  }

  once<K extends keyof T>(type: K, callback: Callback<T[K]>) {
    if (!this.callbacks[type]) {
      this.callbacks[type] = [];
    }

    this.callbacks[type]!.push(callback);

    this.disposableCallbacks.add(callback);

    return this;
  }

  off<K extends keyof T>(type: K, callback: Callback<T[K]>) {
    if (!this.callbacks[type]) {
      return this;
    }

    const callbacks = this.callbacks[type]!;
    const index = callbacks.indexOf(callback);
    if (index >= 0) {
      callbacks.splice(index, 1);
    }

    this.disposableCallbacks.delete(callback);

    return this;
  }

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

      if (this.disposableCallbacks.has(callback)) {
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
    this.disposableCallbacks.clear();
  }
}
