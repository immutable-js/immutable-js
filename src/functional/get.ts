import type { Record } from '../../type-definitions/immutable';
import type { CollectionImpl } from '../Collection';
import { isImmutable } from '../predicates/isImmutable';
import { has } from './has';

/**
 * Returns the value within the provided collection associated with the
 * provided key, or notSetValue if the key is not defined in the collection.
 *
 * A functional alternative to `collection.get(key)` which will also work on
 * plain Objects and Arrays as an alternative for `collection[key]`.
 */
export function get<K, V>(
  collection: CollectionImpl<K, V>,
  key: K
): V | undefined;
export function get<K, V, NSV>(
  collection: CollectionImpl<K, V>,
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
export function get<K, V, NSV>(
  collection: CollectionImpl<K, V> | Array<V> | { [key: string]: V },
  key: K,
  notSetValue?: NSV
): V | NSV;
export function get<K, V, NSV>(
  collection: CollectionImpl<K, V> | Array<V> | { [key: string]: V },
  key: K,
  notSetValue?: NSV
): V | NSV | undefined {
  return isImmutable(collection)
    ? // @ts-expect-error "get" is still in the mixin for now
      collection.get(key, notSetValue)
    : !has(collection, key)
      ? notSetValue
      : // @ts-expect-error weird "get" here,
        typeof collection.get === 'function'
        ? // @ts-expect-error weird "get" here,
          collection.get(key)
        : // @ts-expect-error key is unknown here,
          collection[key];
}
