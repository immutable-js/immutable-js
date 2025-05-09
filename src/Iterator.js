export const ITERATE_KEYS = 0;
export const ITERATE_VALUES = 1;
export const ITERATE_ENTRIES = 2;

import {
  ITERATOR_SYMBOL_REAL,
  ITERATOR_SYMBOL_FAUX,
  ITERATOR_SYMBOL,
} from './const';

class Iterator {
  constructor(next) {
    if (next) {
      // Map extends Iterator and has a `next` method, do not erase it in that case. We could have checked `if (next && !this.next)` too.
      this.next = next;
    }
  }

  toString() {
    return '[Iterator]';
  }
}

Iterator.KEYS = ITERATE_KEYS;
Iterator.VALUES = ITERATE_VALUES;
Iterator.ENTRIES = ITERATE_ENTRIES;

Iterator.prototype.inspect = Iterator.prototype.toSource = function () {
  return this.toString();
};
Iterator.prototype[ITERATOR_SYMBOL] = function () {
  return this;
};

function iteratorValue(type, k, v, iteratorResult) {
  const value =
    type === ITERATE_KEYS ? k : type === ITERATE_VALUES ? v : [k, v];
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions -- TODO enable eslint here
  iteratorResult
    ? (iteratorResult.value = value)
    : (iteratorResult = {
        value: value,
        done: false,
      });
  return iteratorResult;
}

function iteratorDone() {
  return { value: undefined, done: true };
}

function getIterator(iterable) {
  const iteratorFn = getIteratorFn(iterable);
  return iteratorFn && iteratorFn.call(iterable);
}

function getIteratorFn(iterable) {
  const iteratorFn =
    iterable &&
    ((ITERATOR_SYMBOL_REAL && iterable[ITERATOR_SYMBOL_REAL]) ||
      iterable[ITERATOR_SYMBOL_FAUX]);
  if (typeof iteratorFn === 'function') {
    return iteratorFn;
  }
}

function isEntriesIterable(maybeIterable) {
  const iteratorFn = getIteratorFn(maybeIterable);
  return iteratorFn && iteratorFn === maybeIterable.entries;
}

function isKeysIterable(maybeIterable) {
  const iteratorFn = getIteratorFn(maybeIterable);
  return iteratorFn && iteratorFn === maybeIterable.keys;
}

export {
  Iterator,
  iteratorValue,
  iteratorDone,
  getIterator,
  isEntriesIterable,
  isKeysIterable,
};
