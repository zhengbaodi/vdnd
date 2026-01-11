type ClassName = string;
type CallbackMatcher = (element: Element) => boolean;
type AncestorMatcher = ClassName | CallbackMatcher | NodeList | Node | Node[];

/**
 * Get the closest ancestor element or itself that matches the given matcher.
 */
export function closest(
  descendant: Element,
  matcher: AncestorMatcher
): Element | null {
  if (matcher instanceof Node) {
    return closest(descendant, [matcher]);
  }

  if (matcher instanceof NodeList) {
    return closest(descendant, Array.from(matcher));
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

  let current: Element | null = descendant;

  do {
    if (isExpected(current)) {
      return current;
    }
    current = current?.parentElement || null;
  } while (current != null && current !== document.body);

  return null;
}

function isClassName(matcher: AncestorMatcher): matcher is ClassName {
  return typeof matcher === 'string';
}

function isNodes(matcher: AncestorMatcher): matcher is Array<Node> {
  return Array.isArray(matcher);
}

function isCallbackMatcher(
  matcher: AncestorMatcher
): matcher is CallbackMatcher {
  return typeof matcher === 'function';
}
