import type {
  ArrayLikeKeyPath,
  KeyPath,
  OrderedCollection,
  RetrievePathOrUnknown,
  RetrievePathOrUnknownWithNotSetValue,
  TypedKeyPath,
} from '../../type-definitions/immutable';
import { NOT_SET } from '../TrieUtils';
import coerceKeyPath from '../utils/coerceKeyPath';
import { get } from './get';

type GetType = typeof get;
type GetTypeParameters = Parameters<GetType>;
type CollectionType = GetTypeParameters[0];
type Key = GetTypeParameters[1];

/**
 * Returns the value at the provided key path starting at the provided
 * collection, or notSetValue if the key path is not defined.
 *
 * A functional alternative to `collection.getIn(keypath)` which will also
 * work with plain Objects and Arrays.
 */
export function getIn<C, P extends ReadonlyArray<object | PropertyKey>>(
  object: C,
  keyPath: TypedKeyPath<C, P> | OrderedCollection<unknown>
): RetrievePathOrUnknown<C, P>;
export function getIn<C>(
  object: C,
  keyPath: ArrayLikeKeyPath | OrderedCollection<unknown>
): unknown;
export function getIn<C, P extends ReadonlyArray<object | PropertyKey>, NSV>(
  collection: C,
  keyPath: readonly [...P] | OrderedCollection<unknown>,
  notSetValue: NSV
): RetrievePathOrUnknownWithNotSetValue<C, P, NSV>;
export function getIn<C, NSV>(
  object: C,
  keyPath: ArrayLikeKeyPath | OrderedCollection<unknown>,
  notSetValue: NSV
): unknown;
export function getIn(
  collection: CollectionType,
  searchKeyPath: KeyPath<Key>,
  notSetValue?: GetTypeParameters[2]
): ReturnType<GetType> {
  const keyPath = coerceKeyPath(searchKeyPath);
  let i = 0;
  while (i !== keyPath.length) {
    // @ts-expect-error keyPath[i++] can not be undefined by design
    collection = get(collection, keyPath[i++], NOT_SET);
    if (collection === NOT_SET) {
      return notSetValue;
    }
  }
  return collection;
}
