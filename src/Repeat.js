import transformToMethods from './transformToMethods';

import { wholeSlice, resolveBegin, resolveEnd } from './TrieUtils';
import { probeIsSameDeep, probeIsSame, probeIsRepeat } from './probe';
import { Iterator, iteratorValue, iteratorDone } from './Iterator';

import { collectionIndexedSeqPropertiesCreate } from './collection/collectionIndexedSeq';

/**
 * Returns a lazy Seq of `value` repeated `times` times. When `times` is
 * undefined, returns an infinite sequence of `value`.
 */
const repeatOpToString = (cx) => {
  if (cx.size === 0) {
    return 'Repeat []';
  }
  return 'Repeat [ ' + cx._value + ' ' + cx.size + ' times ]';
};

const repeatOpGet = (cx, index, notSetValue) => {
  return cx.has(index) ? cx._value : notSetValue;
};

const repeatOpIncludes = (cx, searchValue) => {
  return probeIsSame(cx._value, searchValue);
};

const repeatOpSlice = (cx, begin, end) => {
  const size = cx.size;
  return wholeSlice(begin, end, size)
    ? cx
    : repeatCreate(
        cx._value,
        resolveEnd(end, size) - resolveBegin(begin, size)
      );
};

const repeatOpReverse = (cx) => {
  return cx;
};

const repeatOpIndexOf = (cx, searchValue) => {
  if (probeIsSame(cx._value, searchValue)) {
    return 0;
  }
  return -1;
};

const repeatOpLastIndexOf = (cx, searchValue) => {
  if (probeIsSame(cx._value, searchValue)) {
    return cx.size;
  }
  return -1;
};

const repeatOpIterate = (cx, fn, reverse) => {
  const size = cx.size;
  let i = 0;
  while (i !== size) {
    if (fn(cx._value, reverse ? size - ++i : i++, cx) === false) {
      break;
    }
  }
  return i;
};

const repeatOpIterator = (cx, type, reverse) => {
  const size = cx.size;
  let i = 0;
  return new Iterator(() =>
    i === size
      ? iteratorDone()
      : iteratorValue(type, reverse ? size - ++i : i++, cx._value)
  );
};

const repeatOpEquals = (cx, other) => {
  return probeIsRepeat(other)
    ? probeIsSame(cx._value, other._value)
    : probeIsSameDeep(cx, other);
};

const repeatPropertiesCreate = ((cache) => () => {
  return (
    cache ||
    (cache = Object.assign(
      {},
      collectionIndexedSeqPropertiesCreate(),
      transformToMethods({
        toString: repeatOpToString,
        get: repeatOpGet,
        includes: repeatOpIncludes,
        slice: repeatOpSlice,
        reverse: repeatOpReverse,
        indexOf: repeatOpIndexOf,
        lastIndexOf: repeatOpLastIndexOf,
        equals: repeatOpEquals,
        __iterate: repeatOpIterate,
        __iterator: repeatOpIterator,
      })
    ))
  );
})();

const repeatCreate = (value, size) => {
  const repeat = Object.create(repeatPropertiesCreate());
  repeat._value = value;
  repeat.size = size;

  return repeat;
};

const repeatCreateEmpty = ((cache) => () => {
  return cache || (cache = repeatCreate(undefined, 0));
})();

/**
 * Returns a lazy Seq of `value` repeated `times` times. When `times` is
 * undefined, returns an infinite sequence of `value`.
 */
const Repeat = (value, times) => {
  const size = times === undefined ? Infinity : Math.max(0, times);

  return size === 0 ? repeatCreateEmpty() : repeatCreate(value, size);
};

export { Repeat, repeatCreate };
