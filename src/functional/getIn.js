import coerceKeyPath from '../utils/coerceKeyPath';
import { NOT_SET } from '../TrieUtils';
import { get } from './get';

export function getIn(collection, searchKeyPath, notSetValue) {
  const keyPath = coerceKeyPath(searchKeyPath);
  let i = 0;
  while (i !== keyPath.length) {
    collection = get(collection, keyPath[i++], NOT_SET);
    if (collection === NOT_SET) {
      return notSetValue;
    }
  }
  return collection;
}
