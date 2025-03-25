export const ITERATE_KEYS = 0;
export const ITERATE_VALUES = 1;
export const ITERATE_ENTRIES = 2;

const REAL_ITERATOR_SYMBOL = typeof Symbol === 'function' && Symbol.iterator;
const FAUX_ITERATOR_SYMBOL = '@@iterator';

export const ITERATOR_SYMBOL = REAL_ITERATOR_SYMBOL || FAUX_ITERATOR_SYMBOL;

export class Iterator {
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

export function iteratorValue(type, k, v, iteratorResult) {
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

export function iteratorDone() {
  return { value: undefined, done: true };
}

export function hasIterator(maybeIterable) {
  if (Array.isArray(maybeIterable)) {
    // IE11 trick as it does not support `Symbol.iterator`
    return true;
  }

  return !!getIteratorFn(maybeIterable);
}

export function isIterator(maybeIterator) {
  return maybeIterator && typeof maybeIterator.next === 'function';
}

export function getIterator(iterable) {
  const iteratorFn = getIteratorFn(iterable);
  return iteratorFn && iteratorFn.call(iterable);
}

function getIteratorFn(iterable) {
  const iteratorFn =
    iterable &&
    ((REAL_ITERATOR_SYMBOL && iterable[REAL_ITERATOR_SYMBOL]) ||
      iterable[FAUX_ITERATOR_SYMBOL]);
  if (typeof iteratorFn === 'function') {
    return iteratorFn;
  }
}

export function isEntriesIterable(maybeIterable) {
  const iteratorFn = getIteratorFn(maybeIterable);
  return iteratorFn && iteratorFn === maybeIterable.entries;
}

export function isKeysIterable(maybeIterable) {
  const iteratorFn = getIteratorFn(maybeIterable);
  return iteratorFn && iteratorFn === maybeIterable.keys;
}
