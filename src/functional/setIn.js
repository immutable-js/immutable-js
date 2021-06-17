import { updateIn } from './updateIn';
import { NOT_SET } from '../TrieUtils';

export function setIn(collection, keyPath, value) {
  return updateIn(collection, keyPath, NOT_SET, () => value);
}
