import { KeyedCollection } from '../Collection';
import {
  Iterator,
  iteratorValue,
  iteratorDone,
  ITERATE_ENTRIES,
  ITERATE_VALUES,
} from '../Iterator';
import {
  SeqImpl,
  KeyedSeqImpl,
  IndexedSeqImpl,
  SetSeqImpl,
  keyedSeqFromValue,
  indexedSeqFromValue,
} from '../Seq';
import { ensureSize } from '../TrieUtils';
import { isCollection } from '../predicates/isCollection';
import { IS_INDEXED_SYMBOL, isIndexed } from '../predicates/isIndexed';
import { IS_KEYED_SYMBOL, isKeyed } from '../predicates/isKeyed';
import { IS_ORDERED_SYMBOL } from '../predicates/isOrdered';
import { mapFactory, reverseFactory } from './factories';
import { cacheResultThrough } from './helpers.js';

export class ToKeyedSequence extends KeyedSeqImpl {
  constructor(indexed, useKeys) {
    super();

    this._iter = indexed;
    this._useKeys = useKeys;
    this.size = indexed.size;
  }

  get(key, notSetValue) {
    return this._iter.get(key, notSetValue);
  }

  has(key) {
    return this._iter.has(key);
  }

  valueSeq() {
    return this._iter.valueSeq();
  }

  reverse() {
    const reversedSequence = reverseFactory(this, true);
    if (!this._useKeys) {
      reversedSequence.valueSeq = () => this._iter.toSeq().reverse();
    }
    return reversedSequence;
  }

  map(mapper, context) {
    const mappedSequence = mapFactory(this, mapper, context);
    if (!this._useKeys) {
      mappedSequence.valueSeq = () => this._iter.toSeq().map(mapper, context);
    }
    return mappedSequence;
  }

  __iterate(fn, reverse) {
    return this._iter.__iterate((v, k) => fn(v, k, this), reverse);
  }

  __iterator(type, reverse) {
    return this._iter.__iterator(type, reverse);
  }
}
ToKeyedSequence.prototype[IS_ORDERED_SYMBOL] = true;

export class ToIndexedSequence extends IndexedSeqImpl {
  constructor(iter) {
    super();

    this._iter = iter;
    this.size = iter.size;
  }

  includes(value) {
    return this._iter.includes(value);
  }

  __iterate(fn, reverse) {
    let i = 0;
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions -- TODO enable eslint here
    reverse && ensureSize(this);
    return this._iter.__iterate(
      (v) => fn(v, reverse ? this.size - ++i : i++, this),
      reverse
    );
  }

  __iterator(type, reverse) {
    const iterator = this._iter.__iterator(ITERATE_VALUES, reverse);
    let i = 0;
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions -- TODO enable eslint here
    reverse && ensureSize(this);
    return new Iterator(() => {
      const step = iterator.next();
      return step.done
        ? step
        : iteratorValue(
            type,
            reverse ? this.size - ++i : i++,
            step.value,
            step
          );
    });
  }
}

export class ToSetSequence extends SetSeqImpl {
  constructor(iter) {
    super();

    this._iter = iter;
    this.size = iter.size;
  }

  has(key) {
    return this._iter.includes(key);
  }

  __iterate(fn, reverse) {
    return this._iter.__iterate((v) => fn(v, v, this), reverse);
  }

  __iterator(type, reverse) {
    const iterator = this._iter.__iterator(ITERATE_VALUES, reverse);
    return new Iterator(() => {
      const step = iterator.next();
      return step.done
        ? step
        : iteratorValue(type, step.value, step.value, step);
    });
  }
}

export class FromEntriesSequence extends KeyedSeqImpl {
  constructor(entries) {
    super();

    this._iter = entries;
    this.size = entries.size;
  }

  entrySeq() {
    return this._iter.toSeq();
  }

  __iterate(fn, reverse) {
    return this._iter.__iterate((entry) => {
      // Check if entry exists first so array access doesn't throw for holes
      // in the parent iteration.
      if (entry) {
        validateEntry(entry);
        const indexedCollection = isCollection(entry);
        return fn(
          indexedCollection ? entry.get(1) : entry[1],
          indexedCollection ? entry.get(0) : entry[0],
          this
        );
      }
    }, reverse);
  }

  __iterator(type, reverse) {
    const iterator = this._iter.__iterator(ITERATE_VALUES, reverse);
    return new Iterator(() => {
      while (true) {
        const step = iterator.next();
        if (step.done) {
          return step;
        }
        const entry = step.value;
        // Check if entry exists first so array access doesn't throw for holes
        // in the parent iteration.
        if (entry) {
          validateEntry(entry);
          const indexedCollection = isCollection(entry);
          return iteratorValue(
            type,
            indexedCollection ? entry.get(0) : entry[0],
            indexedCollection ? entry.get(1) : entry[1],
            step
          );
        }
      }
    });
  }
}

ToIndexedSequence.prototype.cacheResult =
  ToKeyedSequence.prototype.cacheResult =
  ToSetSequence.prototype.cacheResult =
  FromEntriesSequence.prototype.cacheResult =
    cacheResultThrough;

class ConcatSeq extends SeqImpl {
  constructor(iterables) {
    super();

    this._wrappedIterables = iterables.flatMap((iterable) => {
      if (iterable._wrappedIterables) {
        return iterable._wrappedIterables;
      }
      return [iterable];
    });
    this.size = this._wrappedIterables.reduce((sum, iterable) => {
      if (sum !== undefined) {
        const size = iterable.size;
        if (size !== undefined) {
          return sum + size;
        }
      }
    }, 0);
    this[IS_KEYED_SYMBOL] = this._wrappedIterables[0][IS_KEYED_SYMBOL];
    this[IS_INDEXED_SYMBOL] = this._wrappedIterables[0][IS_INDEXED_SYMBOL];
    this[IS_ORDERED_SYMBOL] = this._wrappedIterables[0][IS_ORDERED_SYMBOL];
  }

  __iterateUncached(fn, reverse) {
    if (this._wrappedIterables.length === 0) {
      return;
    }

    if (reverse) {
      return this.cacheResult().__iterate(fn, reverse);
    }

    let iterableIndex = 0;
    const useKeys = isKeyed(this);
    const iteratorType = useKeys ? ITERATE_ENTRIES : ITERATE_VALUES;
    let currentIterator = this._wrappedIterables[iterableIndex].__iterator(
      iteratorType,
      reverse
    );

    let keepGoing = true;
    let index = 0;
    while (keepGoing) {
      let next = currentIterator.next();
      while (next.done) {
        iterableIndex++;
        if (iterableIndex === this._wrappedIterables.length) {
          return index;
        }
        currentIterator = this._wrappedIterables[iterableIndex].__iterator(
          iteratorType,
          reverse
        );
        next = currentIterator.next();
      }
      const fnResult = useKeys
        ? fn(next.value[1], next.value[0], this)
        : fn(next.value, index, this);
      keepGoing = fnResult !== false;
      index++;
    }
    return index;
  }

  __iteratorUncached(type, reverse) {
    if (this._wrappedIterables.length === 0) {
      return new Iterator(iteratorDone);
    }

    if (reverse) {
      return this.cacheResult().__iterator(type, reverse);
    }

    let iterableIndex = 0;
    let currentIterator = this._wrappedIterables[iterableIndex].__iterator(
      type,
      reverse
    );
    return new Iterator(() => {
      let next = currentIterator.next();
      while (next.done) {
        iterableIndex++;
        if (iterableIndex === this._wrappedIterables.length) {
          return next;
        }
        currentIterator = this._wrappedIterables[iterableIndex].__iterator(
          type,
          reverse
        );
        next = currentIterator.next();
      }
      return next;
    });
  }
}

export function concatFactory(collection, values) {
  const isKeyedCollection = isKeyed(collection);
  const iters = [collection]
    .concat(values)
    .map((v) => {
      if (!isCollection(v)) {
        v = isKeyedCollection
          ? keyedSeqFromValue(v)
          : indexedSeqFromValue(Array.isArray(v) ? v : [v]);
      } else if (isKeyedCollection) {
        v = KeyedCollection(v);
      }
      return v;
    })
    .filter((v) => v.size !== 0);

  if (iters.length === 0) {
    return collection;
  }

  if (iters.length === 1) {
    const singleton = iters[0];
    if (
      singleton === collection ||
      (isKeyedCollection && isKeyed(singleton)) ||
      (isIndexed(collection) && isIndexed(singleton))
    ) {
      return singleton;
    }
  }

  return new ConcatSeq(iters);
}

function validateEntry(entry) {
  if (entry !== Object(entry)) {
    throw new TypeError('Expected [K, V] tuple: ' + entry);
  }
}
