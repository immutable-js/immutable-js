import type { Collection, Record } from '../../type-definitions/immutable';
import { isImmutable } from '../predicates/isImmutable';
import { has } from './has';

/**
 * Returns the value within the provided collection associated with the
 * provided key, or notSetValue if the key is not defined in the collection.
 *
 * A functional alternative to `collection.get(key)` which will also work on
 * plain Objects and Arrays as an alternative for `collection[key]`.
 *
 * <!-- runkit:activate -->
 * ```js
 * const { get } = require('immutable')
 * get([ 'dog', 'frog', 'cat' ], 1) // 'frog'
 * get({ x: 123, y: 456 }, 'x') // 123
 * get({ x: 123, y: 456 }, 'z', 'ifNotSet') // 'ifNotSet'
 * ```
 */
export function get<K, V>(collection: Collection<K, V>, key: K): V | undefined;
export function get<K, V, NSV>(
  collection: Collection<K, V>,
  key: K,
  notSetValue: NSV
): V | NSV;
export function get<TProps extends object, K extends keyof TProps>(
  record: Record<TProps>,
  key: K,
  notSetValue: unknown
): TProps[K];
export function get<V>(collection: Array<V>, key: number): V | undefined;
export function get<V, NSV>(
  collection: Array<V>,
  key: number,
  notSetValue: NSV
): V | NSV;
export function get<C extends object, K extends keyof C>(
  object: C,
  key: K,
  notSetValue: unknown
): C[K];
export function get<V>(
  collection: { [key: string]: V },
  key: string
): V | undefined;
export function get<V, NSV>(
  collection: { [key: string]: V },
  key: string,
  notSetValue: NSV
): V | NSV;
export function get<K extends PropertyKey, V, NSV>(
  collection: Collection<K, V> | Array<V> | { [key: string]: V },
  key: K,
  notSetValue?: NSV
): V | NSV {
  return isImmutable(collection)
    ? collection.get(key, notSetValue)
    : !has(collection, key)
      ? notSetValue
      : // @ts-expect-error weird "get" here,
        typeof collection.get === 'function'
        ? // @ts-expect-error weird "get" here,
          collection.get(key)
        : // @ts-expect-error key is unknown here,
          collection[key];
}
