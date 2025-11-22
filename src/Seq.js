import { hasIterator, isEntriesIterable, isKeysIterable } from './Iterator';
import { SeqArray, seqArrayCreateEmpty } from './SeqArray.js';
import { SeqObject } from './SeqObject.js';
import { collectionIndexedSeqFromCollectionCreate } from './collection/collectionIndexedSeqFromCollection';
import { isAssociative } from './predicates/isAssociative';
import { isCollection } from './predicates/isCollection';
import { isImmutable } from './predicates/isImmutable';
import { isIndexed } from './predicates/isIndexed';
import { isKeyed } from './predicates/isKeyed';
import { isRecord } from './predicates/isRecord';
import { isSeq } from './predicates/isSeq';
import { isArrayLike } from './utils';

const maybeIndexedSeqFromValue = (value) => {
  return isArrayLike(value)
    ? SeqArray(value)
    : hasIterator(value)
      ? collectionIndexedSeqFromCollectionCreate(value)
      : undefined;
};

export const KeyedSeqFromValue = (value) => {
  const seq = maybeIndexedSeqFromValue(value);

  if (seq) {
    return seq.fromEntrySeq();
  }
  if (typeof value === 'object') {
    return SeqObject(value);
  }
  throw new TypeError(
    'Expected Array or collection object of [k, v] entries, or keyed object: ' +
      value
  );
};

export const IndexedSeqFromValue = (value) => {
  const seq = maybeIndexedSeqFromValue(value);
  if (seq) {
    return seq;
  }
  throw new TypeError(
    'Expected Array or collection object of values: ' + value
  );
};

export const SeqFromValue = (value) => {
  const seq = maybeIndexedSeqFromValue(value);
  if (seq) {
    return isEntriesIterable(value)
      ? seq.fromEntrySeq()
      : isKeysIterable(value)
        ? seq.toSetSeq()
        : seq;
  }
  if (typeof value === 'object') {
    return SeqObject(value);
  }
  throw new TypeError(
    'Expected Array or collection object of values, or keyed object: ' + value
  );
};

export const Seq = (value) => {
  return value === undefined || value === null
    ? seqArrayCreateEmpty()
    : isImmutable(value)
      ? value.toSeq()
      : SeqFromValue(value);
};

export const KeyedSeq = (value) =>
  value === undefined || value === null
    ? seqArrayCreateEmpty().toKeyedSeq()
    : isCollection(value)
      ? isKeyed(value)
        ? value.toSeq()
        : value.fromEntrySeq()
      : isRecord(value)
        ? value.toSeq()
        : KeyedSeqFromValue(value);

export const IndexedSeq = (value) =>
  value === undefined || value === null
    ? seqArrayCreateEmpty()
    : isCollection(value)
      ? isKeyed(value)
        ? value.entrySeq()
        : value.toIndexedSeq()
      : isRecord(value)
        ? value.toSeq().entrySeq()
        : IndexedSeqFromValue(value);

// Was Collection/1
export const SeqWhenNotCollection = (value) =>
  isCollection(value) ? value : Seq(value);

// WAS KeyedCollection/1
export const KeyedSeqWhenNotKeyed = (value) =>
  isKeyed(value) ? value : KeyedSeq(value);

// WAS IndexedCollection/1
export const IndexedSeqWhenNotIndexed = (value) =>
  isIndexed(value) ? value : IndexedSeq(value);

export const SetSeq = (value) => {
  return (
    isCollection(value) && !isAssociative(value) ? value : IndexedSeq(value)
  ).toSetSeq();
};

// WAS SetCollection/1
export const SetSeqWhenNotAssociative = (value) =>
  isCollection(value) && !isAssociative(value)
    ? value
    : IndexedSeq(value).toSetSeq();

IndexedSeq.of = (...values) => IndexedSeq(values);
SetSeq.of = (...values) => SetSeq(...values);

Seq.isSeq = isSeq;
Seq.Indexed = IndexedSeq;
Seq.Keyed = KeyedSeq;
Seq.Set = SetSeq;
