import {
  Element,
  JsonMLElementList,
  explodeElement,
  isElement,
} from './jsonml-types';

export interface DevToolsFormatter {
  header: (obj: unknown) => JsonMLElementList | null;
  hasBody: (obj: unknown) => boolean;
  body: (obj: unknown) => JsonMLElementList | null;
}

type Output = JsonMLElementList | Element;

// same styles as @immutable/devtools, so that plain JS values look like the Immutable ones
const keyStyle = { style: 'color: light-dark( #881391, #D48CE6)' };
const nullStyle = {
  style: 'color: light-dark(rgb(119,119,119), rgb(201, 201, 201))',
};
const numberBooleanStyle = {
  style: 'color: light-dark(rgb(28, 128, 28), rgb(50, 200, 50))',
};
const listStyle = {
  style:
    'list-style-type: none; padding: 0; margin: 0 0 0 12px; font-style: normal; position: relative',
};

function getFormatter(
  immutableFormaters: Array<DevToolsFormatter>,
  value: unknown
) {
  // devtools formatters are only called with objects by the browsers, and some of them throw on `undefined` or `null`
  if (typeof value !== 'object' || value === null) {
    return undefined;
  }

  return immutableFormaters.find((formatter) => formatter.header(value));
}

function isPrimitive(value: unknown): boolean {
  return value === null || typeof value !== 'object';
}

function isPlainObject(value: object): boolean {
  const proto = Object.getPrototypeOf(value);

  return proto === Object.prototype || proto === null;
}

function isObjectReference(
  element: unknown
): element is ['object', { object: unknown }] {
  return (
    Array.isArray(element) &&
    element[0] === 'object' &&
    typeof element[1] === 'object' &&
    element[1] !== null &&
    'object' in element[1]
  );
}

/**
 * Convert any value returned (or logged) by the user code to JsonML.
 * Immutable collections are rendered by the @immutable/devtools formatters, plain objects and arrays are rendered with the same look.
 */
export default function normalizeResult(
  immutableFormaters: Array<DevToolsFormatter>,
  value: unknown
): Output {
  const formatter = getFormatter(immutableFormaters, value);

  if (formatter) {
    return normalizeImmutable(immutableFormaters, formatter, value);
  }

  if (value === undefined || value === null) {
    return ['span', nullStyle, String(value)];
  }

  if (typeof value === 'boolean' || typeof value === 'number') {
    return ['span', numberBooleanStyle, String(value)];
  }

  if (typeof value === 'bigint') {
    return ['span', numberBooleanStyle, `${value}n`];
  }

  if (Array.isArray(value)) {
    return normalizeEntries(
      immutableFormaters,
      '[',
      ']',
      Object.entries(value),
      false
    );
  }

  if (typeof value === 'object' && isPlainObject(value)) {
    return normalizeEntries(
      immutableFormaters,
      '{',
      '}',
      Object.entries(value),
      true
    );
  }

  // strings, dates, functions… are rendered by jsonml-html
  return ['object', { object: value }];
}

function normalizeImmutable(
  immutableFormaters: Array<DevToolsFormatter>,
  formatter: DevToolsFormatter,
  value: unknown
): Output {
  const header = formatter.header(value) ?? [];

  let body: JsonMLElementList | null = formatter.hasBody(value)
    ? formatter.body(value)
    : null;

  if (body) {
    body = body.map((item) => normalizeElement(immutableFormaters, item));
  }

  if (!body) {
    return ['span', header];
  }

  return ['span', header, body];
}

/**
 * Render a plain object or an array:
 * inline (`{ a: 1, b: true }`) if it only contains primitives, as a list like the Immutable collections otherwise.
 */
function normalizeEntries(
  immutableFormaters: Array<DevToolsFormatter>,
  open: string,
  close: string,
  entries: Array<[string, unknown]>,
  inlineKeys: boolean
): Output {
  if (entries.length === 0) {
    return ['span', open + close];
  }

  if (entries.every(([, value]) => isPrimitive(value))) {
    const children: Array<Output> = [];

    entries.forEach(([key, value], index) => {
      if (index > 0) {
        children.push(', ');
      }

      if (inlineKeys) {
        children.push(['span', keyStyle, `${key}: `]);
      }

      children.push(normalizeResult(immutableFormaters, value));
    });

    return ['span', `${open} `, ...children, ` ${close}`];
  }

  const items: Array<Output> = entries.map(([key, value]) => [
    'li',
    ['span', keyStyle, `${key}: `],
    normalizeResult(immutableFormaters, value),
  ]);

  // @ts-expect-error type is not perfect here because of self-reference
  return ['span', open, ['ol', listStyle, ...items], close];
}

function normalizeElement(
  immutableFormaters: Array<DevToolsFormatter>,
  item: Element | JsonMLElementList
): Element | JsonMLElementList {
  if (!Array.isArray(item)) {
    return item;
  }

  if (!isElement(item)) {
    return item;
  }

  const explodedItem = explodeElement(item);

  const { tagName, attributes, children } = explodedItem;

  const normalizedChildren = children.map((child) =>
    normalizeChild(immutableFormaters, child)
  );

  if (attributes) {
    // @ts-expect-error type is not perfect here because of self-reference
    return [tagName, attributes, ...normalizedChildren];
  }

  return [tagName, ...normalizedChildren];
}

function normalizeChild(
  immutableFormaters: Array<DevToolsFormatter>,
  child: unknown
): Output {
  // `['object', { object }]` is a reference to a nested value
  if (isObjectReference(child)) {
    return normalizeResult(immutableFormaters, child[1].object);
  }

  if (Array.isArray(child)) {
    return normalizeElement(immutableFormaters, child);
  }

  // jsonml-html only renders strings, but devtools formatters can output numbers
  return String(child);
}
