import {
  Element,
  explodeElement,
  isElement,
  JsonMLElementList,
} from './jsonml-types';

export interface DevToolsFormatter {
  header: (obj: unknown) => JsonMLElementList | null;
  hasBody: (obj: unknown) => boolean;
  body: (obj: unknown) => JsonMLElementList | null;
}

function getFormatter(
  immutableFormaters: Array<DevToolsFormatter>,
  result: unknown
) {
  return immutableFormaters.find((formatter) => formatter.header(result));
}

// console.log(immutableFormaters)
export default function normalizeResult(
  immutableFormaters: Array<DevToolsFormatter>,
  result: unknown
): JsonMLElementList | Element {
  const formatter = getFormatter(immutableFormaters, result);

  if (!formatter) {
    if (Array.isArray(result) && result[0] === 'object' && result[1]?.object) {
      // handle special case for deep objects
      const objectFormatter = getFormatter(
        immutableFormaters,
        result[1].object
      );

      if (objectFormatter) {
        return normalizeResult(immutableFormaters, result[1].object);
      }
    }

    if (typeof result !== 'string' && isElement(result)) {
      return normalizeElement(immutableFormaters, result);
    }

    return result;
  }

  const header = formatter.header(result) ?? [];

  let body: JsonMLElementList | null = formatter.hasBody(result)
    ? formatter.body(result)
    : null;

  if (body) {
    body = body.map((item) => normalizeElement(immutableFormaters, item));
  }

  return ['span', header, body ?? []];
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
  // console.log(explodedItem);

  const normalizedChildren = children.map((child) =>
    normalizeResult(immutableFormaters, child)
  );

  if (attributes) {
    return [tagName, attributes, ...normalizedChildren];
  }

  return [tagName, ...normalizedChildren];
}
