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

function getFormatter(
  immutableFormaters: Array<DevToolsFormatter>,
  result: unknown
) {
  return immutableFormaters.find((formatter) => formatter.header(result));
}

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

    if (typeof result === 'string') {
      return result;
    }

    return JSON.stringify(result);
  }

  const header = formatter.header(result) ?? [];

  let body: JsonMLElementList | null = formatter.hasBody(result)
    ? formatter.body(result)
    : null;

  if (body) {
    body = body.map((item) => normalizeElement(immutableFormaters, item));
  }

  if (!body) {
    return ['span', header];
  }

  return ['span', header, body];
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
    normalizeResult(immutableFormaters, child)
  );

  if (attributes) {
    // @ts-expect-error type is not perfect here because of self-reference
    return [tagName, attributes, ...normalizedChildren];
  }

  return [tagName, ...normalizedChildren];
}
