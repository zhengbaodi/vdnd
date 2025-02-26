export type HowToSuppress = {
  preventDefault?: boolean;
  stopPropagation?: boolean;
  stopImmediatePropagation?: boolean;
};

export type Listener = (e: Event) => void;

export class ListenerProxy {
  private destoryed = false;
  constructor(
    public readonly type: string,
    private listener: Listener,
    public readonly options: AddEventListenerOptions
  ) {
    if (this.options.signal) {
      if (this.options.signal.aborted) {
        this.destroy();
      } else {
        this.options.signal.addEventListener('abort', this.onSignalAborted);
      }
    }
  }

  is(listenr: Listener) {
    return this.listener === listenr;
  }

  call(e: Event) {
    if (this.destoryed || e.type !== this.type) return;
    try {
      if (this.options.passive) {
        e.preventDefault = () => {};
      }
      this.listener(e);
    } finally {
      if (this.options.once) {
        this.destroy();
      }
    }
  }

  destroy() {
    this.destoryed = true;
    this.options.signal?.removeEventListener('abort', this.onSignalAborted);
  }

  private onSignalAborted = () => {
    this.destroy();
  };
}

export function findListenerProxy(
  proxys: Iterable<ListenerProxy>,
  listener: Listener
) {
  for (const proxy of proxys) {
    if (proxy.is(listener)) {
      return proxy;
    }
  }
  return null;
}

export class SpecificEventSuppressor {
  private readonly scopeToAliveListeners = new Map<
    string,
    Set<ListenerProxy>
  >();

  constructor(
    public readonly type: string,
    private readonly behavior: HowToSuppress,
    private readonly isEnabled: () => boolean,
    private readonly isTrustedEvent: (e: Event) => boolean
  ) {
    document.addEventListener(type, this.suppress, {
      capture: true,
    });
  }

  private findAliveListener(scope: string, listener: Listener) {
    const aliveListeners = this.scopeToAliveListeners.get(scope);
    if (!aliveListeners) return null;
    return findListenerProxy(aliveListeners.values(), listener);
  }

  private suppress = (e: Event) => {
    // we do not suppress the event dispatched by 'dispatchEvent'
    if (!this.isEnabled() || !this.isTrustedEvent(e)) return;
    if (this.behavior.preventDefault) {
      e.preventDefault();
    }
    if (this.behavior.stopPropagation) {
      e.stopPropagation();
    }
    if (this.behavior.stopImmediatePropagation) {
      e.stopImmediatePropagation();
    }
    for (const aliveListeners of this.scopeToAliveListeners.values()) {
      for (const proxy of aliveListeners) {
        if (proxy.options.capture) proxy.call(e);
      }
      for (const proxy of aliveListeners) {
        if (!proxy.options.capture) proxy.call(e);
      }
    }
  };

  addAliveEventListener(
    scope: string,
    type: string,
    listener: Listener,
    options: AddEventListenerOptions = {}
  ) {
    if (this.type !== type) return;
    const proxy = new ListenerProxy(type, listener, options);
    proxy.call = proxy.call.bind(proxy);
    document.addEventListener(type, proxy.call, options);

    let aliveListeners = this.scopeToAliveListeners.get(scope);
    if (!aliveListeners) {
      aliveListeners = new Set();
      this.scopeToAliveListeners.set(scope, aliveListeners);
    }
    aliveListeners.add(proxy);
  }

  removeAliveEventListener(
    scope: string,
    type: string,
    listener: Listener,
    options: AddEventListenerOptions = {}
  ) {
    if (this.type !== type) return;
    const proxy = this.findAliveListener(scope, listener);
    if (proxy) {
      this.scopeToAliveListeners.get(scope)!.delete(proxy);
      document.removeEventListener(type, proxy.call, options);
    }
  }

  clear(scope: string) {
    const aliveListeners = this.scopeToAliveListeners.get(scope);
    if (!aliveListeners) return;
    for (const proxy of aliveListeners) {
      proxy.destroy();
      document.removeEventListener(proxy.type, proxy.call, proxy.options);
    }
    this.scopeToAliveListeners.delete(scope);
  }

  destroy() {
    for (const aliveListeners of this.scopeToAliveListeners.values()) {
      for (const proxy of aliveListeners) {
        proxy.destroy();
        document.removeEventListener(proxy.type, proxy.call, proxy.options);
      }
    }
    this.scopeToAliveListeners.clear();
    document.removeEventListener(this.type, this.suppress, {
      capture: true,
    });
  }
}

export type EventSuppressorEnvironmentConfig = {
  [event: string]: HowToSuppress;
};

// Not directly using 'EventSuppressorEnvironment.isTrustedEvent' is for testing purposes.
function isTrustedEvent(e: Event) {
  return EventSuppressorEnvironment.isTrustedEvent(e);
}

// It must be initiated as early as possible, before the application runs.
export class EventSuppressorEnvironment {
  static isTrustedEvent = (e: Event) => e.isTrusted;

  // Will not suppress events, if false.
  private enabled = false;

  private readonly typeToSpecificEventSuppressor = new Map<
    string,
    SpecificEventSuppressor
  >();

  constructor(configs: EventSuppressorEnvironmentConfig) {
    const types = Object.keys(configs);
    const isEnabled = () => this.enabled;
    for (const type of types) {
      const suppressor = new SpecificEventSuppressor(
        type,
        configs[type],
        isEnabled,
        isTrustedEvent
      );
      this.typeToSpecificEventSuppressor.set(type, suppressor);
    }
  }

  enable() {
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
  }

  getSpecificEventSuppressor(type: string) {
    return this.typeToSpecificEventSuppressor.get(type) || null;
  }

  getAllSpecificEventSuppressors() {
    return this.typeToSpecificEventSuppressor.values();
  }

  destroy() {
    const suppressors = this.getAllSpecificEventSuppressors();
    for (const suppressor of suppressors) {
      suppressor.destroy();
    }
  }
}

/**
 * Suppress events dispatched by the 'user action' in a document
 *
 * In theory, if an event is completely suppressed,
 * its default behavior will be canceled and all related listeners will not be called.
 *
 * But this is only a simulation, events cannot be suppressed successfully in certain cases,
 * such as: ctrl+t(create a new tab), ctrl+w(close the current the tab),
 * or add listeners before the instance starts work.
 */
export class EventSuppressor {
  private nativeListenerProxys = new Set<ListenerProxy>();

  constructor(
    private env: EventSuppressorEnvironment,
    private scope: string
  ) {}

  enable() {
    this.env.enable();
  }

  disable() {
    this.env.disable();
  }

  /** Adds an event listener that will not be supprressed. */
  addAliveEventListener(
    type: string,
    listener: Listener,
    options: AddEventListenerOptions = {}
  ) {
    const suppressor = this.env.getSpecificEventSuppressor(type);
    if (suppressor) {
      suppressor.addAliveEventListener(this.scope, type, listener, options);
    } else {
      this.addNativeEventListener(type, listener, options);
    }
  }

  /** Removes an event listener that added by `addAliveEventListener`.  */
  removeAliveEventListener(
    type: string,
    listener: Listener,
    options: AddEventListenerOptions = {}
  ) {
    const suppressor = this.env.getSpecificEventSuppressor(type);
    if (suppressor) {
      suppressor.removeAliveEventListener(this.scope, type, listener, options);
    } else {
      this.removeNativeEventListener(type, listener, options);
    }
  }

  private addNativeEventListener(
    type: string,
    listener: Listener,
    options: AddEventListenerOptions = {}
  ) {
    const proxy = new ListenerProxy(type, listener, options);
    proxy.call = proxy.call.bind(proxy);
    document.addEventListener(type, proxy.call, options);
    this.nativeListenerProxys.add(proxy);
  }

  private removeNativeEventListener(
    type: string,
    listener: Listener,
    options: AddEventListenerOptions = {}
  ) {
    const proxys = this.nativeListenerProxys.values();
    const proxy = findListenerProxy(proxys, listener);
    if (proxy) {
      document.removeEventListener(type, proxy.call, options);
      this.nativeListenerProxys.delete(proxy);
    }
  }

  destroy() {
    const suppressors = this.env.getAllSpecificEventSuppressors();
    for (const suppressor of suppressors) {
      suppressor.clear(this.scope);
    }

    const proxys = this.nativeListenerProxys.values();
    for (const proxy of proxys) {
      document.removeEventListener(proxy.type, proxy.call, proxy.options);
    }
    this.nativeListenerProxys.clear();
  }
}
