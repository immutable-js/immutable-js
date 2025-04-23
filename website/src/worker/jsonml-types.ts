/**
 * TypeScript types representing a JsonML grammar
 *
 * This represents a JSON-based markup language where elements are represented as arrays:
 * - First element is the tag name
 * - Second element (optional) is an attributes object
 * - Remaining elements are children
 */

// Basic types
type TagName = string;
type AttributeName = string;
type AttributeValue = string | number | boolean | null | object;

// Attributes
// type Attribute = [AttributeName, AttributeValue];
// type AttributeList = Attribute[];
export type Attributes = Record<AttributeName, AttributeValue>;

type ElementWithAttributes =
  | [TagName, Attributes, ...Element[]] // [tag-name, attributes, element-list]
  | [TagName, Attributes]; // [tag-name, attributes]

// Elements
export type Element =
  | ElementWithAttributes
  | [TagName, ...Element[]] // [tag-name, element-list]
  | [TagName] // [tag-name]
  | string; // string

// Element list is just a list of elements
export type JsonMLElementList = Array<Element | JsonMLElementList>;

export function isElement(maybeElement: unknown): maybeElement is Element {
  return (
    typeof maybeElement === 'string' ||
    (Array.isArray(maybeElement) &&
      maybeElement.length >= 1 &&
      typeof maybeElement[0] === 'string')
  );
}

function hasAttributes(
  maybeElementWithAttributes: Element
): maybeElementWithAttributes is ElementWithAttributes {
  return (
    Array.isArray(maybeElementWithAttributes) &&
    typeof maybeElementWithAttributes[1] === 'object' &&
    !Array.isArray(maybeElementWithAttributes[1])
  );
}

type ExplodedElement = {
  tagName: TagName;
  attributes?: Attributes;
  children: Element[];
};

export function explodeElement(element: Element): ExplodedElement {
  if (typeof element === 'string') {
    return { tagName: element, children: [] };
  }

  if (hasAttributes(element)) {
    const [tagName, attributes, ...children] = element;

    return { tagName, attributes, children };
  }

  const [tagName, attributes, ...children] = element;

  return {
    tagName,
    children: [attributes, ...children].filter(isElement),
  };
}
