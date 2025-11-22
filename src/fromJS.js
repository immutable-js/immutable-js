import { hasIterator } from './Iterator';
import { Map } from './Map';
import { Seq } from './Seq';
import { isImmutable } from './predicates/isImmutable';
import { isIndexed } from './predicates/isIndexed';
import { isKeyed } from './predicates/isKeyed';
import { isArrayLike, isPlainObj } from './utils';

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
    !isImmutable(value) &&
    (isArrayLike(value) || hasIterator(value) || isPlainObj(value))
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
  return isIndexed(v) ? v.toList() : isKeyed(v) ? v.toMap(Map) : v.toSet();
}
