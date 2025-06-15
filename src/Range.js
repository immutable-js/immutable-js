
import { Iterator, iteratorValue, iteratorDone } from './Iterator';
import { wrapIndex, wholeSlice, resolveBegin, resolveEnd } from './TrieUtils';


import { collectionIndexedSeqPropertiesCreate } from './collection/collectionIndexedSeq';

import { SHAPE_RANGE } from './const';
import { probeIsSameDeep } from './probe';

import transformToMethods from './transformToMethods';

import { utilInvariant } from './util';

const rangeOpToString = (cx) =>
  cx.size === 0
    ? 'Range []'
    : `Range [ ${cx._start}...${cx._end}${cx._step !== 1 ? ' by ' + cx._step : ''} ]`;

const rangeOpGet = (cx, index, notSetValue) => {
  return cx.has(index)
    ? cx._start + wrapIndex(cx, index) * cx._step
    : notSetValue;
};

const rangeOpIncludes = (cx, searchValue) => {
  const possibleIndex = (searchValue - cx._start) / cx._step;
  return (
    possibleIndex >= 0 &&
    possibleIndex < cx.size &&
    possibleIndex === Math.floor(possibleIndex)
  );
};

const rangeOpSlice = (cx, begin, end) => {
  if (wholeSlice(begin, end, cx.size)) {
    return cx;
  }
  begin = resolveBegin(begin, cx.size);
  end = resolveEnd(end, cx.size);
  if (end <= begin) {
    return Range(0, 0);
  }
  return Range(cx.get(begin, cx._end), cx.get(end, cx._end), cx._step);
};

const rangeOpIndexOf = (cx, searchValue) => {
  const offsetValue = searchValue - cx._start;
  if (offsetValue % cx._step === 0) {
    const index = offsetValue / cx._step;
    if (index >= 0 && index < cx.size) {
      return index;
    }
  }
  return -1;
};

const rangeOpIterate = (cx, fn, reverse) => {
  const size = cx.size;
  const step = cx._step;
  let value = reverse ? cx._start + (size - 1) * step : cx._start;
  let i = 0;
  while (i !== size) {
    if (fn(value, reverse ? size - ++i : i++, cx) === false) {
      break;
    }
    value += reverse ? -step : step;
  }
  return i;
};

const rangeOpIterator = (cx, type, reverse) => {
  const size = cx.size;
  const step = cx._step;
  let value = reverse ? cx._start + (size - 1) * step : cx._start;
  let i = 0;
  return new Iterator(() => {
    if (i === size) {
      return iteratorDone();
    }
    const v = value;
    value += reverse ? -step : step;
    return iteratorValue(type, reverse ? size - ++i : i++, v);
  });
};

const rangeOpEquals = (cx, other) => {
  return other && other.__shape === SHAPE_RANGE
    ? cx._start === other._start &&
        cx._end === other._end &&
        cx._step === other._step
    : probeIsSameDeep(cx, other);
};

const RangeCreate = ((cache) => (start, end, step, size) => {
  const range = Object.create(
    cache ||
      (cache = Object.assign(
        {},
        collectionIndexedSeqPropertiesCreate(),
        transformToMethods({
          toString: rangeOpToString,
          get: rangeOpGet,
          includes: rangeOpIncludes,
          slice: rangeOpSlice,
          indexOf: rangeOpIndexOf,
          lastIndexOf: (cx, searchValue) => cx.indexOf(searchValue),
          __iterate: rangeOpIterate,
          __iterator: rangeOpIterator,
          equals: rangeOpEquals,
        })
      ))
  );

  range._start = start;
  range._end = end;
  range._step = step;
  range.size = size;
  range.__shape = SHAPE_RANGE;

  return range;
})();

let EMPTY_RANGE;

/**
 * Returns a lazy seq of nums from start (inclusive) to end
 * (exclusive), by step, where start defaults to 0, step to 1, and end to
 * infinity. When start is equal to end, returns empty list.
 */
const Range = (start, end, step = 1) => {
  utilInvariant(step !== 0, 'Cannot step a Range by 0');
  utilInvariant(
    start !== undefined,
    'You must define a start value when using Range'
  );
  utilInvariant(
    end !== undefined,
    'You must define an end value when using Range'
  );

  step = Math.abs(step);
  if (end < start) {
    step = -step;
  }
  const size = Math.max(0, Math.ceil((end - start) / step - 1) + 1);
  if (size === 0) {
    if (!EMPTY_RANGE) {
      EMPTY_RANGE = RangeCreate(start, end, step, 0);
    }
    return EMPTY_RANGE;
  }
  return RangeCreate(start, end, step, size);
};

export { Range };
