import { getIn } from './getIn';
import { NOT_SET } from '../TrieUtils';

type GetInParameters = Parameters<typeof getIn>;

export function hasIn(
  collection: GetInParameters[0],
  keyPath: GetInParameters[1]
): boolean {
  return getIn(collection, keyPath, NOT_SET) !== NOT_SET;
}
