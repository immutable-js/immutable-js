import type { Collection, Record } from '../../type-definitions/immutable';
import { isImmutable } from '../predicates/isImmutable';
import isPlainObj from './isPlainObj';

/**
 * Returns true if the value is a potentially-persistent data structure, either
 * provided by Immutable.js or a plain Array or Object.
 */
export default function isDataStructure(
  value: unknown
): value is
  | Collection<unknown, unknown>
  | Record<object>
  | Array<unknown>
  | object {
  return (
    typeof value === 'object' &&
    (isImmutable(value) || Array.isArray(value) || isPlainObj(value))
  );
}
