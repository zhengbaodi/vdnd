export interface SuppressedBehavior {
  preventDefault?: boolean;
  stopPropagation?: boolean;
  stopImmediatePropagation?: boolean;
}

export type Listener = (e: Event) => void;

interface ListenerWrapper {
  (e: Event): void;
  raw: Listener;
  options: EventListenerOptions | undefined;
}

/**
 * Suppress events dispatched by 'user action' in a document
 *
 * In theory, if an event is completely suppressed,
 * its default behavior will be canceled and all related listeners will not be called.
 *
 * But this is just a imitation, events cannot be suppressed successfully in certain cases,
 * such as: When the program started, we immediately added listeners to the document.
 */
export interface EventSuppressor {
  enable(): void;
  disable(): void;

  suppress(type: string, behavior: SuppressedBehavior): void;
  unsuppress(type: string): void;

  /**
   * Listens an event, even if it has been suppressed, the listener will still be called.
   */
  addEventListenerSafely(
    type: string,
    listener: Listener,
    options?: EventListenerOptions
  ): void;

  /**
   * Removes the listener added by `addEventListenerSafely`.
   */
  removeEventListener(
    type: string,
    listener: Listener,
    options?: EventListenerOptions
  ): void;

  destroy(): void;
}

type EventType = string;

export class DefaultEventSuppressor implements EventSuppressor {
  static isTrustedEvent = (e: Event) => e.isTrusted;

  private document: Document;

  /** Will not suppress events, if false. */
  private enabled = false;

  private permittedListenersMap = new Map<EventType, Set<Listener>>();
  private listenersToSuppress = new Map<EventType, Listener>();
  private wrappersMapOfPermittedListeners = new Map<
    EventType,
    Set<ListenerWrapper>
  >();

  constructor(doc: Document = document) {
    this.document = doc;
  }

  private isBeingSuppressed(type: string) {
    return this.enabled && this.listenersToSuppress.has(type);
  }

  enable() {
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
  }

  suppress(type: string, behavior: SuppressedBehavior) {
    this.unsuppress(type);
    const listener = (e: Event) => {
      if (!this.enabled || !DefaultEventSuppressor.isTrustedEvent(e)) return;

      if (behavior.preventDefault) {
        e.preventDefault();
      }
      if (behavior.stopPropagation) {
        e.stopPropagation();
      }
      if (behavior.stopImmediatePropagation) {
        e.stopImmediatePropagation();
      }

      const listeners = this.permittedListenersMap.get(type);
      if (listeners) {
        listeners.forEach((listener) => listener(e));
      }
    };

    this.listenersToSuppress.set(type, listener);
    this.document.addEventListener(type, listener, {
      capture: true,
    });
  }

  unsuppress(type: string) {
    const listener = this.listenersToSuppress.get(type);
    if (listener) {
      this.listenersToSuppress.delete(type);
      this.document.removeEventListener(type, listener, {
        capture: true,
      });
    }
  }

  /**
   * Listens an event, even if it has been suppressed, the listener will still be called.
   */
  addEventListenerSafely(
    type: string,
    listener: Listener,
    options?: EventListenerOptions
  ) {
    let listeners = this.permittedListenersMap.get(type);
    if (!listeners) {
      listeners = new Set();
      this.permittedListenersMap.set(type, listeners);
    }
    listeners.add(listener);

    let wrappers = this.wrappersMapOfPermittedListeners.get(type);
    if (!wrappers) {
      wrappers = new Set();
      this.wrappersMapOfPermittedListeners.set(type, wrappers);
    }
    const listenerWrapper = (e: Event) => {
      if (
        !DefaultEventSuppressor.isTrustedEvent(e) ||
        !this.isBeingSuppressed(type)
      ) {
        listener(e);
      }
    };
    listenerWrapper.raw = listener;
    listenerWrapper.options = options;
    wrappers.add(listenerWrapper);

    this.document.addEventListener(type, listenerWrapper, options);
  }

  /**
   * Removes the listener added by `addEventListenerSafely`.
   */
  removeEventListener(
    type: string,
    listener: Listener,
    options?: EventListenerOptions
  ) {
    const listeners = this.permittedListenersMap.get(type);
    if (listeners) {
      listeners.delete(listener);
    }

    const wrappers = this.wrappersMapOfPermittedListeners.get(type);
    if (wrappers) {
      let target: ListenerWrapper | null = null;
      for (const wrapper of wrappers.values()) {
        if (wrapper.raw === listener) {
          target = wrapper;
          break;
        }
      }
      if (target) {
        wrappers.delete(target);
        this.document.removeEventListener(type, target as Listener, options);
      }
    }
  }

  destroy() {
    for (const [type, listener] of this.listenersToSuppress.entries()) {
      this.document.removeEventListener(type, listener, {
        capture: true,
      });
    }
    this.listenersToSuppress.clear();

    for (const [
      type,
      wrappers,
    ] of this.wrappersMapOfPermittedListeners.entries()) {
      wrappers.forEach((listener) => {
        this.document.removeEventListener(type, listener, listener.options);
      });
      wrappers.clear();
    }
    this.wrappersMapOfPermittedListeners.clear();

    for (const listeners of this.permittedListenersMap.values()) {
      listeners.clear();
    }
    this.permittedListenersMap.clear();
  }
}

export function initEventSuppressor<
  T extends EventSuppressor = EventSuppressor,
>(suppressor: T) {
  // The Declaration：
  // ActualUIEvent: the event was generated by the user agent
  // (https://developer.mozilla.org/en-US/docs/Web/API/Event/isTrusted)
  // SimulatedUIEvent: the event was generated by 'Event' and triggered by 'dispatchEvent'
  // (https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent)

  // Browser will suppress UI events while dragging,
  // after testing, it was found that browser only suppresses ActualUIEvent except 'focus', 'focusin', 'focusout', 'blur'

  // The known UI events: dblclick,mousedown,mouseenter,mouseout,mouseleave,mouseover,mousemove,mouseup,touchstart,touchmove,touchend,touchcancel,blur,focusout,focus,focusin,keypress,keydown,keyup,mousewheel,beforeinput,input,compositionstart,compositionupdate,compositionend
  // https://developer.mozilla.org/en-US/docs/Web/API/UIEvent

  // However, in actual scene,
  // the following UI events can only be triggered by 'dispatchEvent', cannot actually occur：
  // click,dblclick,mousedown,mouseup,touchstart,touchend,touchcancel,blur,focusout,focus,focusin,beforeinput,input,compositionstart,compositionupdate,compositionend
  // such as, we can't type the word while dragging, except release the mouse

  // So we just suppress the following events:

  // MouseEvent
  suppressor.suppress('mouseenter', {
    preventDefault: true,
    stopPropagation: true,
    stopImmediatePropagation: true,
  });
  suppressor.suppress('mouseout', {
    preventDefault: true,
    stopPropagation: true,
    stopImmediatePropagation: true,
  });
  suppressor.suppress('mouseleave', {
    preventDefault: true,
    stopPropagation: true,
    stopImmediatePropagation: true,
  });
  suppressor.suppress('mouseover', {
    preventDefault: true,
    stopPropagation: true,
    stopImmediatePropagation: true,
  });
  suppressor.suppress('mousemove', {
    // MouseSimulaor depends on default action of 'mousemove'
    preventDefault: false,
    stopPropagation: true,
    stopImmediatePropagation: true,
  });

  // TouchEvent
  // suppressor.suppress("touchmove", {
  //   // TouchSimulaor depends on default action of 'touchmove'
  //   preventDefault: false,
  //   stopPropagation: true,
  //   stopImmediatePropagation: true,
  // });

  // FocusEvent

  // KeyboardEvent
  suppressor.suppress('keypress', {
    preventDefault: true,
    stopPropagation: true,
    stopImmediatePropagation: true,
  });
  suppressor.suppress('keydown', {
    preventDefault: true,
    stopPropagation: true,
    stopImmediatePropagation: true,
  });
  suppressor.suppress('keyup', {
    preventDefault: true,
    stopPropagation: true,
    stopImmediatePropagation: true,
  });

  // WheelEvent
  suppressor.suppress('mousewheel', {
    preventDefault: true,
    stopPropagation: true,
    stopImmediatePropagation: true,
  });

  // InputEvent

  // CompositionEvent

  return suppressor;
}
