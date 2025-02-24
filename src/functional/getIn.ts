import coerceKeyPath from '../utils/coerceKeyPath';
import { NOT_SET } from '../TrieUtils';
import { get } from './get';
import type { OrderedCollection } from '../../type-definitions/immutable';

type GetType = typeof get;
type GetTypeParameters = Parameters<GetType>;
type CollectionType = GetTypeParameters[0];
type Key = GetTypeParameters[1];

export function getIn(
  collection: CollectionType,
  searchKeyPath: OrderedCollection<Key> | ArrayLike<Key>,
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
