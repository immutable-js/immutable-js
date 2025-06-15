import { Map } from './Map';
import { Seq } from './Seq';

import {
  probeHasIterator,
  probeIsArrayLike,
  probeIsPlainObject,
  probeIsKeyed,
  probeIsImmutable,
  probeIsIndexed,
} from './probe';

export function fromJS(value, converter) {
  return fromJSWith(
    [],
    converter || defaultConverter,
    value,
    '',
    converter && converter.length > 2 ? [] : undefined,
    { '': value }
  );
}

function fromJSWith(stack, converter, value, key, keyPath, parentValue) {
  if (
    typeof value !== 'string' &&
    !probeIsImmutable(value) &&
    (probeIsArrayLike(value) ||
      probeHasIterator(value) ||
      probeIsPlainObject(value))
  ) {
    if (~stack.indexOf(value)) {
      throw new TypeError('Cannot convert circular structure to Immutable');
    }
    stack.push(value);
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions -- TODO enable eslint here
    keyPath && key !== '' && keyPath.push(key);
    const converted = converter.call(
      parentValue,
      key,
      Seq(value).map((v, k) =>
        fromJSWith(stack, converter, v, k, keyPath, value)
      ),
      keyPath && keyPath.slice()
    );
    stack.pop();
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions -- TODO enable eslint here
    keyPath && keyPath.pop();
    return converted;
  }
  return value;
}

function defaultConverter(k, v) {
  // Effectively the opposite of "Collection.toSeq()"
  return probeIsIndexed(v)
    ? v.toList()
    : probeIsKeyed(v)
      ? v.toMap(Map)
      : v.toSet();
}
