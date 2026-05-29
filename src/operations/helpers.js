import {
  KeyedCollection,
  IndexedCollection,
  SetCollection,
} from '../Collection';
import { SeqImpl, KeyedSeqImpl, IndexedSeqImpl, SetSeqImpl } from '../Seq';
import { isIndexed } from '../predicates/isIndexed';
import { isKeyed } from '../predicates/isKeyed';
import { isSeq } from '../predicates/isSeq';

export function reify(iter, seq) {
  return iter === seq
    ? iter
    : isSeq(iter)
      ? seq
      : iter.create
        ? iter.create(seq)
        : iter.constructor(seq);
}

export function makeSequence(collection) {
  return Object.create(
    (isKeyed(collection)
      ? KeyedSeqImpl
      : isIndexed(collection)
        ? IndexedSeqImpl
        : SetSeqImpl
    ).prototype
  );
}

export function collectionClass(collection) {
  return isKeyed(collection)
    ? KeyedCollection
    : isIndexed(collection)
      ? IndexedCollection
      : SetCollection;
}

export function cacheResultThrough() {
  if (this._iter.cacheResult) {
    this._iter.cacheResult();
    this.size = this._iter.size;
    return this;
  }
  return SeqImpl.prototype.cacheResult.call(this);
}

export function defaultComparator(a, b) {
  if (a === undefined && b === undefined) {
    return 0;
  }

  if (a === undefined) {
    return 1;
  }

  if (b === undefined) {
    return -1;
  }

  return a > b ? 1 : a < b ? -1 : 0;
}
