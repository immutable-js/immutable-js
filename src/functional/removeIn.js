import { updateIn } from './updateIn';
import { NOT_SET } from '../TrieUtils';

export function removeIn(collection, keyPath) {
  return updateIn(collection, keyPath, () => NOT_SET);
}
