import { getIn } from './getIn';
import { NOT_SET } from '../TrieUtils';

export function hasIn(collection, keyPath) {
  return getIn(collection, keyPath, NOT_SET) !== NOT_SET;
}
