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

// console.log(immutableFormaters)
export default function normalizeResult(
  immutableFormaters: Array<DevToolsFormatter>,
  result: unknown,
  fromObject: boolean = false
): JsonMLElementList | Element {
  const formatter = immutableFormaters.find((formatter) =>
    formatter.header(result)
  );

  if (!formatter) {
    if (Array.isArray(result) && result[0] === 'object' && result[1]?.object) {
      // handle special case for deep objects

      return normalizeResult(immutableFormaters, result[1].object, true);
    }

    if (typeof result !== 'string' && isElement(result)) {
      return normalizeElement(immutableFormaters, result);
    }

    if (!fromObject) {
      return result;
    }

    // nothing is found, let's return the same object that had been unpacked
    // let jsonml-html handle it
    return ['object', { object: result }];
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
