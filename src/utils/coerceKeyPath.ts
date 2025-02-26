import type { OrderedCollection } from '../../type-definitions/immutable';
import { isOrdered } from '../predicates/isOrdered';
import isArrayLike from './isArrayLike';

export type KeyPath<K> = OrderedCollection<K> | ArrayLike<K>;

export default function coerceKeyPath<K>(keyPath: KeyPath<K>): ArrayLike<K> {
  if (isArrayLike(keyPath) && typeof keyPath !== 'string') {
    return keyPath;
  }
  if (isOrdered(keyPath)) {
    return keyPath.toArray();
  }
  throw new TypeError(
    'Invalid keyPath: expected Ordered Collection or Array: ' + keyPath
  );
}
