import { isEntriesIterable, isKeysIterable } from './Iterator';

import {
  probeHasIterator,
  probeIsArrayLike,
  probeIsAssociative,
  probeIsImmutable,
  probeIsCollection,
  probeIsIndexed,
  probeIsRecord,
  probeIsKeyed,
  probeIsSeq,
} from './probe';

import { SeqArray, seqArrayCreateEmpty } from './SeqArray.js';

import { SeqObject } from './SeqObject.js';

import { collectionIndexedSeqFromCollectionCreate } from './collection/collectionIndexedSeqFromCollection';

const maybeIndexedSeqFromValue = (value) => {
  return probeIsArrayLike(value)
    ? SeqArray(value)
    : probeHasIterator(value)
      ? collectionIndexedSeqFromCollectionCreate(value)
      : undefined;
};

const SeqKeyedFromValue = (value) => {
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

const SeqIndexedFromValue = (value) => {
  const seq = maybeIndexedSeqFromValue(value);
  if (seq) {
    return seq;
  }
  throw new TypeError(
    'Expected Array or collection object of values: ' + value
  );
};

const SeqFromValue = (value) => {
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

const Seq = (value) => {
  return value === undefined || value === null
    ? seqArrayCreateEmpty()
    : probeIsImmutable(value)
      ? value.toSeq()
      : SeqFromValue(value);
};

const SeqKeyed = (value) =>
  value === undefined || value === null
    ? seqArrayCreateEmpty().toKeyedSeq()
    : probeIsCollection(value)
      ? probeIsKeyed(value)
        ? value.toSeq()
        : value.fromEntrySeq()
      : probeIsRecord(value)
        ? value.toSeq()
        : SeqKeyedFromValue(value);

const SeqIndexed = (value) =>
  value === undefined || value === null
    ? seqArrayCreateEmpty()
    : probeIsCollection(value)
      ? probeIsKeyed(value)
        ? value.entrySeq()
        : value.toIndexedSeq()
      : probeIsRecord(value)
        ? value.toSeq().entrySeq()
        : SeqIndexedFromValue(value);

// Was Collection/1
const SeqWhenNotCollection = (value) =>
  probeIsCollection(value) ? value : Seq(value);

// WAS KeyedCollection/1
const SeqKeyedWhenNotKeyed = (value) =>
  probeIsKeyed(value) ? value : SeqKeyed(value);

// WAS IndexedCollection/1
const SeqIndexedWhenNotIndexed = (value) =>
  probeIsIndexed(value) ? value : SeqIndexed(value);

const SeqSet = (value) => {
  return (
    probeIsCollection(value) && !probeIsAssociative(value)
      ? value
      : SeqIndexed(value)
  ).toSetSeq();
};

// WAS SetCollection/1
const SeqSetWhenNotAssociative = (value) =>
  probeIsCollection(value) && !probeIsAssociative(value)
    ? value
    : SeqIndexed(value).toSetSeq();

SeqIndexed.of = (...values) => SeqIndexed(values);
SeqSet.of = (...values) => SeqSet(...values);

Seq.isSeq = probeIsSeq;
Seq.Indexed = SeqIndexed;
Seq.Keyed = SeqKeyed;
Seq.Set = SeqSet;

export {
  Seq,
  SeqWhenNotCollection,
  SeqFromValue,
  SeqKeyed,
  SeqKeyedWhenNotKeyed,
  SeqKeyedFromValue,
  SeqIndexed,
  SeqIndexedWhenNotIndexed,
  SeqIndexedFromValue,
  SeqSet,
  SeqSetWhenNotAssociative,
};
