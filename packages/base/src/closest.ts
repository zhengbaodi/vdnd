type CallbackMatcher = (element: Element) => boolean;
type ParentMatcher = string | CallbackMatcher | NodeList | Node | Node[];

/**
 * Get the closest parent element of a given element that matches  the given matcher
 */
export default function closest(
  element: Element,
  matcher: ParentMatcher
): Element | null {
  if (matcher instanceof Node) {
    return closest(element, [matcher]);
  }

  if (matcher instanceof NodeList) {
    return closest(element, Array.from(matcher));
  }

  function isExpected(currentElement: Element) {
    if (isClassName(matcher)) {
      return currentElement.classList.contains(matcher);
    }

    if (isCallbackMatcher(matcher)) {
      return matcher(currentElement);
    }

    if (isNodes(matcher)) {
      return matcher.includes(currentElement);
    }
  }

  let current: Element | null = element;

  do {
    if (isExpected(current)) {
      return current;
    }
    current = current?.parentElement || null;
  } while (current != null && current !== document.body);

  return null;
}

function isClassName(matcher: ParentMatcher): matcher is string {
  return typeof matcher === 'string';
}

function isNodes(matcher: ParentMatcher): matcher is Array<Node> {
  return Array.isArray(matcher);
}

function isCallbackMatcher(matcher: ParentMatcher): matcher is CallbackMatcher {
  return typeof matcher === 'function';
}
