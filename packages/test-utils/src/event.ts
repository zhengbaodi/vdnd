import {
  defaultTouchEventOptions,
  defaultMouseEventOptions,
} from './constants';

export function triggerEvent(
  element: EventTarget,
  type: string,
  data: { [key: string]: any } = {}
) {
  const event = document.createEvent('Event');
  event.initEvent(type, true, true);

  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      Object.defineProperty(event, key, {
        value: data[key],
      });
    }
  }

  if (element instanceof Element) {
    element.dispatchEvent(event);
  }

  return event;
}

export function clickMouse(element: EventTarget, options = {}) {
  return triggerEvent(element, 'mousedown', {
    ...defaultMouseEventOptions,
    ...options,
  });
}

export function moveMouse(element: EventTarget, options = {}) {
  return triggerEvent(element, 'mousemove', {
    ...defaultMouseEventOptions,
    ...options,
  });
}

export function releaseMouse(element: EventTarget, options = {}) {
  return triggerEvent(element, 'mouseup', {
    ...defaultMouseEventOptions,
    ...options,
  });
}

const elementFromPoint = document.elementFromPoint;
function spyElementFromPoint(target: HTMLElement) {
  document.elementFromPoint = () => target;
}
function restoreElementFromPoint() {
  document.elementFromPoint = elementFromPoint;
}

export function touchStart(element: EventTarget, options = {}) {
  return triggerEvent(element, 'touchstart', {
    ...defaultTouchEventOptions,
    ...options,
  });
}

export function touchMove(element: EventTarget, options = {}) {
  spyElementFromPoint(element as any);
  const e = triggerEvent(element, 'touchmove', {
    ...defaultTouchEventOptions,
    ...options,
  });
  restoreElementFromPoint();
  return e;
}

export function touchRelease(element: EventTarget, options = {}) {
  spyElementFromPoint(element as any);
  const e = triggerEvent(element, 'touchend', {
    ...defaultTouchEventOptions,
    ...options,
  });
  restoreElementFromPoint();
  return e;
}
