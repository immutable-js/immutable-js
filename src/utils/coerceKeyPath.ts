import type { OrderedCollection } from '../../type-definitions/immutable';
import { isOrdered } from '../predicates/isOrdered';
import isArrayLike from './isArrayLike';

export default function coerceKeyPath<I>(
  keyPath: OrderedCollection<I> | ArrayLike<I>
): ArrayLike<I> {
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
