import { Iterator, iteratorValue, iteratorDone } from './Iterator';
import { wrapIndex } from './TrieUtils';
import { collectionIndexedSeqPropertiesCreate } from './collection/collectionIndexedSeq';
import { isImmutable } from './predicates/isImmutable';
import transformToMethods from './transformToMethods';

const indexedSeqArrayOpGet = (cx, index, notSetValue) => {
  return cx.has(index) ? cx._array[wrapIndex(cx, index)] : notSetValue;
};

const indexedSeqArrayOpIterate = (cx, fn, reverse) => {
  const array = cx._array;
  const size = array.length;

  let i = 0;
  while (i !== size) {
    const ii = reverse ? size - ++i : i++;
    if (fn(array[ii], ii, cx) === false) {
      break;
    }
  }
  return i;
};

const indexedSeqArrayOpIterator = (cx, type, reverse) => {
  const array = cx._array;
  const size = array.length;
  let i = 0;
  return new Iterator(() => {
    if (i === size) {
      return iteratorDone();
    }
    const ii = reverse ? size - ++i : i++;
    return iteratorValue(type, ii, array[ii]);
  });
};

const seqArrayPropertiesCreate = ((cache) => () => {
  return (
    cache ||
    (cache = Object.assign(
      {},
      collectionIndexedSeqPropertiesCreate(),
      transformToMethods({
        __iterate: indexedSeqArrayOpIterate,
        __iterator: indexedSeqArrayOpIterator,
        get: indexedSeqArrayOpGet,
        toIndexedSeq: (cx) => cx,
        toString: (cx) => cx.__toString('Seq [', ']'),
        _toString: (cx) => cx.__toString('Seq [', ']'),
      })
    ))
  );
})();

const seqArrayCreate = (array) => {
  const seqArray = Object.create(seqArrayPropertiesCreate());

  seqArray._shape = 'seqarray';
  seqArray._array = array;
  seqArray.size = array.length;

  return seqArray;
};

const seqArrayCreateEmpty = ((cache) => () => {
  return cache || (cache = seqArrayCreate([]));
})();

const SeqArray = (value) =>
  value === undefined || value === null
    ? seqArrayCreateEmpty([])
    : isImmutable(value)
      ? value.toSeq()
      : seqArrayCreate(value);

export {
  SeqArray as default,
  SeqArray,
  seqArrayPropertiesCreate,
  seqArrayCreate,
  seqArrayCreateEmpty,
};
