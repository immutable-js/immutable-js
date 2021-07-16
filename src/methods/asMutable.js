import { OwnerID } from '../TrieUtils';

export function asMutable() {
  return this.__ownerID ? this : this.__ensureOwner(new OwnerID());
}
