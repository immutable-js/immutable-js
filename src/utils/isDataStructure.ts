import type { Collection, Record } from '../../type-definitions/immutable';
import { probeIsImmutable } from '../probe';
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
    (probeIsImmutable(value) || Array.isArray(value) || isPlainObj(value))
  );
}
