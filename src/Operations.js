import {
  NOT_SET,
  ensureSize,
  wrapIndex,
  wholeSlice,
  resolveBegin,
  resolveEnd,
  returnTrue,
} from './TrieUtils';
import { Collection, KeyedCollection, collectionClass } from './Collection';
import { isCollection } from './predicates/isCollection';
import { IS_KEYED_SYMBOL, isKeyed } from './predicates/isKeyed';
import { IS_INDEXED_SYMBOL, isIndexed } from './predicates/isIndexed';
import { isOrdered, IS_ORDERED_SYMBOL } from './predicates/isOrdered';
import { isSeq } from './predicates/isSeq';
import {
  getIterator,
  Iterator,
  iteratorValue,
  iteratorDone,
  ITERATE_KEYS,
  ITERATE_VALUES,
  ITERATE_ENTRIES,
} from './Iterator';
import {
  SeqImpl,
  KeyedSeq,
  SetSeq,
  IndexedSeq,
  keyedSeqFromValue,
  indexedSeqFromValue,
  ArraySeq,
  KeyedSeqImpl,
  IndexedSeqImpl,
  SetSeqImpl,
} from './Seq';

import { Map } from './Map';
import { OrderedMap } from './OrderedMap';
import { imul, smi } from './Math';
import { is } from './is';
import { hash } from './Hash';
import arrCopy from './utils/arrCopy';
import deepEqual from './utils/deepEqual';
import assertNotInfinite from './utils/assertNotInfinite';
import { toJS } from './toJS';
import { OrderedSet } from './OrderedSet';
import { Set } from './Set';
import { List } from './List';
import { Stack } from './Stack';

export class ToKeyedSequence extends KeyedSeqImpl {
  // export class ToKeyedSequence extends SeqImpl {
  constructor(indexed, useKeys) {
    super();

    this._iter = indexed;
    this._useKeys = useKeys;
    this.size = indexed.size;
  }

  toKeyedSeq() {
    return seqKeyedToKeyedSeq(this);
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

export function flipFactory(collection) {
  const flipSequence = makeSequence(collection);
  flipSequence._iter = collection;
  flipSequence.size = collection.size;
  flipSequence.flip = () => collection;
  flipSequence.reverse = function () {
    const reversedSequence = collection.reverse.apply(this); // super.reverse()
    reversedSequence.flip = () => collection.reverse();
    return reversedSequence;
  };
  flipSequence.has = (key) => collection.includes(key);
  flipSequence.includes = (key) => collection.has(key);
  flipSequence.cacheResult = cacheResultThrough;
  flipSequence.__iterateUncached = function (fn, reverse) {
    return collection.__iterate((v, k) => fn(k, v, this) !== false, reverse);
  };
  flipSequence.__iteratorUncached = function (type, reverse) {
    if (type === ITERATE_ENTRIES) {
      const iterator = collection.__iterator(type, reverse);
      return new Iterator(() => {
        const step = iterator.next();
        if (!step.done) {
          const k = step.value[0];
          step.value[0] = step.value[1];
          step.value[1] = k;
        }
        return step;
      });
    }
    return collection.__iterator(
      type === ITERATE_VALUES ? ITERATE_KEYS : ITERATE_VALUES,
      reverse
    );
  };
  return flipSequence;
}

export function mapFactory(collection, mapper, context) {
  const mappedSequence = makeSequence(collection);
  mappedSequence.size = collection.size;
  mappedSequence.has = (key) => collection.has(key);
  mappedSequence.get = (key, notSetValue) => {
    const v = collection.get(key, NOT_SET);
    return v === NOT_SET
      ? notSetValue
      : mapper.call(context, v, key, collection);
  };
  mappedSequence.__iterateUncached = function (fn, reverse) {
    return collection.__iterate(
      (v, k, c) => fn(mapper.call(context, v, k, c), k, this) !== false,
      reverse
    );
  };
  mappedSequence.__iteratorUncached = function (type, reverse) {
    const iterator = collection.__iterator(ITERATE_ENTRIES, reverse);
    return new Iterator(() => {
      const step = iterator.next();
      if (step.done) {
        return step;
      }
      const entry = step.value;
      const key = entry[0];
      return iteratorValue(
        type,
        key,
        mapper.call(context, entry[1], key, collection),
        step
      );
    });
  };
  return mappedSequence;
}

export function reverseFactory(collection, useKeys) {
  const reversedSequence = makeSequence(collection);
  reversedSequence._iter = collection;
  reversedSequence.size = collection.size;
  reversedSequence.reverse = () => collection;
  if (collection.flip) {
    reversedSequence.flip = function () {
      const flipSequence = flipFactory(collection);
      flipSequence.reverse = () => collection.flip();
      return flipSequence;
    };
  }
  reversedSequence.get = (key, notSetValue) =>
    collection.get(useKeys ? key : -1 - key, notSetValue);
  reversedSequence.has = (key) => collection.has(useKeys ? key : -1 - key);
  reversedSequence.includes = (value) => collection.includes(value);
  reversedSequence.cacheResult = cacheResultThrough;
  reversedSequence.__iterate = function (fn, reverse) {
    let i = 0;
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions -- TODO enable eslint here
    reverse && ensureSize(collection);
    return collection.__iterate(
      (v, k) => fn(v, useKeys ? k : reverse ? this.size - ++i : i++, this),
      !reverse
    );
  };
  reversedSequence.__iterator = (type, reverse) => {
    let i = 0;
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions -- TODO enable eslint here
    reverse && ensureSize(collection);
    const iterator = collection.__iterator(ITERATE_ENTRIES, !reverse);
    return new Iterator(() => {
      const step = iterator.next();
      if (step.done) {
        return step;
      }
      const entry = step.value;
      return iteratorValue(
        type,
        useKeys ? entry[0] : reverse ? this.size - ++i : i++,
        entry[1],
        step
      );
    });
  };
  return reversedSequence;
}

export function filterFactory(collection, predicate, context, useKeys) {
  const filterSequence = makeSequence(collection);
  if (useKeys) {
    filterSequence.has = (key) => {
      const v = collection.get(key, NOT_SET);
      return v !== NOT_SET && !!predicate.call(context, v, key, collection);
    };
    filterSequence.get = (key, notSetValue) => {
      const v = collection.get(key, NOT_SET);
      return v !== NOT_SET && predicate.call(context, v, key, collection)
        ? v
        : notSetValue;
    };
  }
  filterSequence.__iterateUncached = function (fn, reverse) {
    let iterations = 0;
    collection.__iterate((v, k, c) => {
      if (predicate.call(context, v, k, c)) {
        iterations++;
        return fn(v, useKeys ? k : iterations - 1, this);
      }
    }, reverse);
    return iterations;
  };
  filterSequence.__iteratorUncached = function (type, reverse) {
    const iterator = collection.__iterator(ITERATE_ENTRIES, reverse);
    let iterations = 0;
    return new Iterator(() => {
      while (true) {
        const step = iterator.next();
        if (step.done) {
          return step;
        }
        const entry = step.value;
        const key = entry[0];
        const value = entry[1];
        if (predicate.call(context, value, key, collection)) {
          return iteratorValue(type, useKeys ? key : iterations++, value, step);
        }
      }
    });
  };
  return filterSequence;
}

export function countByFactory(collection, grouper, context) {
  const groups = Map().asMutable();
  collection.__iterate((v, k) => {
    groups.update(grouper.call(context, v, k, collection), 0, (a) => a + 1);
  });
  return groups.asImmutable();
}

export function groupByFactory(collection, grouper, context) {
  const isKeyedIter = isKeyed(collection);
  const groups = (isOrdered(collection) ? OrderedMap() : Map()).asMutable();
  collection.__iterate((v, k) => {
    groups.update(
      grouper.call(context, v, k, collection),
      (a) => ((a = a || []), a.push(isKeyedIter ? [k, v] : v), a)
    );
  });
  const coerce = collectionClass(collection);
  return groups.map((arr) => reify(collection, coerce(arr))).asImmutable();
}

export function partitionFactory(collection, predicate, context) {
  const isKeyedIter = isKeyed(collection);
  const groups = [[], []];
  collection.__iterate((v, k) => {
    groups[predicate.call(context, v, k, collection) ? 1 : 0].push(
      isKeyedIter ? [k, v] : v
    );
  });
  const coerce = collectionClass(collection);
  return groups.map((arr) => reify(collection, coerce(arr)));
}

export function sliceFactory(collection, begin, end, useKeys) {
  const originalSize = collection.size;

  if (wholeSlice(begin, end, originalSize)) {
    return collection;
  }

  // begin or end can not be resolved if they were provided as negative numbers and
  // this collection's size is unknown. In that case, cache first so there is
  // a known size and these do not resolve to NaN.
  if (typeof originalSize === 'undefined' && (begin < 0 || end < 0)) {
    return sliceFactory(collection.toSeq().cacheResult(), begin, end, useKeys);
  }

  const resolvedBegin = resolveBegin(begin, originalSize);
  const resolvedEnd = resolveEnd(end, originalSize);

  // Note: resolvedEnd is undefined when the original sequence's length is
  // unknown and this slice did not supply an end and should contain all
  // elements after resolvedBegin.
  // In that case, resolvedSize will be NaN and sliceSize will remain undefined.
  const resolvedSize = resolvedEnd - resolvedBegin;
  let sliceSize;
  if (resolvedSize === resolvedSize) {
    sliceSize = resolvedSize < 0 ? 0 : resolvedSize;
  }

  const sliceSeq = makeSequence(collection);

  // If collection.size is undefined, the size of the realized sliceSeq is
  // unknown at this point unless the number of items to slice is 0
  sliceSeq.size =
    sliceSize === 0 ? sliceSize : (collection.size && sliceSize) || undefined;

  if (!useKeys && isSeq(collection) && sliceSize >= 0) {
    sliceSeq.get = function (index, notSetValue) {
      index = wrapIndex(this, index);
      return index >= 0 && index < sliceSize
        ? collection.get(index + resolvedBegin, notSetValue)
        : notSetValue;
    };
  }

  sliceSeq.__iterateUncached = function (fn, reverse) {
    if (sliceSize === 0) {
      return 0;
    }
    if (reverse) {
      return this.cacheResult().__iterate(fn, reverse);
    }
    let skipped = 0;
    let isSkipping = true;
    let iterations = 0;
    collection.__iterate((v, k) => {
      if (!(isSkipping && (isSkipping = skipped++ < resolvedBegin))) {
        iterations++;
        return (
          fn(v, useKeys ? k : iterations - 1, this) !== false &&
          iterations !== sliceSize
        );
      }
    });
    return iterations;
  };

  sliceSeq.__iteratorUncached = function (type, reverse) {
    if (sliceSize !== 0 && reverse) {
      return this.cacheResult().__iterator(type, reverse);
    }
    // Don't bother instantiating parent iterator if taking 0.
    if (sliceSize === 0) {
      return new Iterator(iteratorDone);
    }
    const iterator = collection.__iterator(type, reverse);
    let skipped = 0;
    let iterations = 0;
    return new Iterator(() => {
      while (skipped++ < resolvedBegin) {
        iterator.next();
      }
      if (++iterations > sliceSize) {
        return iteratorDone();
      }
      const step = iterator.next();
      if (useKeys || type === ITERATE_VALUES || step.done) {
        return step;
      }
      if (type === ITERATE_KEYS) {
        return iteratorValue(type, iterations - 1, undefined, step);
      }
      return iteratorValue(type, iterations - 1, step.value[1], step);
    });
  };

  return sliceSeq;
}

export function takeWhileFactory(collection, predicate, context) {
  const takeSequence = makeSequence(collection);
  takeSequence.__iterateUncached = function (fn, reverse) {
    if (reverse) {
      return this.cacheResult().__iterate(fn, reverse);
    }
    let iterations = 0;
    collection.__iterate(
      (v, k, c) =>
        predicate.call(context, v, k, c) && ++iterations && fn(v, k, this)
    );
    return iterations;
  };
  takeSequence.__iteratorUncached = function (type, reverse) {
    if (reverse) {
      return this.cacheResult().__iterator(type, reverse);
    }
    const iterator = collection.__iterator(ITERATE_ENTRIES, reverse);
    let iterating = true;
    return new Iterator(() => {
      if (!iterating) {
        return iteratorDone();
      }
      const step = iterator.next();
      if (step.done) {
        return step;
      }
      const entry = step.value;
      const k = entry[0];
      const v = entry[1];
      if (!predicate.call(context, v, k, this)) {
        iterating = false;
        return iteratorDone();
      }
      return type === ITERATE_ENTRIES ? step : iteratorValue(type, k, v, step);
    });
  };
  return takeSequence;
}

export function skipWhileFactory(collection, predicate, context, useKeys) {
  const skipSequence = makeSequence(collection);
  skipSequence.__iterateUncached = function (fn, reverse) {
    if (reverse) {
      return this.cacheResult().__iterate(fn, reverse);
    }
    let isSkipping = true;
    let iterations = 0;
    collection.__iterate((v, k, c) => {
      if (!(isSkipping && (isSkipping = predicate.call(context, v, k, c)))) {
        iterations++;
        return fn(v, useKeys ? k : iterations - 1, this);
      }
    });
    return iterations;
  };
  skipSequence.__iteratorUncached = function (type, reverse) {
    if (reverse) {
      return this.cacheResult().__iterator(type, reverse);
    }
    const iterator = collection.__iterator(ITERATE_ENTRIES, reverse);
    let skipping = true;
    let iterations = 0;
    return new Iterator(() => {
      let step;
      let k;
      let v;
      do {
        step = iterator.next();
        if (step.done) {
          if (useKeys || type === ITERATE_VALUES) {
            return step;
          }
          if (type === ITERATE_KEYS) {
            return iteratorValue(type, iterations++, undefined, step);
          }
          return iteratorValue(type, iterations++, step.value[1], step);
        }
        const entry = step.value;
        k = entry[0];
        v = entry[1];
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions -- TODO enable eslint here
        skipping && (skipping = predicate.call(context, v, k, this));
      } while (skipping);
      return type === ITERATE_ENTRIES ? step : iteratorValue(type, k, v, step);
    });
  };
  return skipSequence;
}

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

export function flattenFactory(collection, depth, useKeys) {
  const flatSequence = makeSequence(collection);
  flatSequence.__iterateUncached = function (fn, reverse) {
    if (reverse) {
      return this.cacheResult().__iterate(fn, reverse);
    }
    let iterations = 0;
    let stopped = false;
    function flatDeep(iter, currentDepth) {
      iter.__iterate((v, k) => {
        if ((!depth || currentDepth < depth) && isCollection(v)) {
          flatDeep(v, currentDepth + 1);
        } else {
          iterations++;
          if (fn(v, useKeys ? k : iterations - 1, flatSequence) === false) {
            stopped = true;
          }
        }
        return !stopped;
      }, reverse);
    }
    flatDeep(collection, 0);
    return iterations;
  };
  flatSequence.__iteratorUncached = function (type, reverse) {
    if (reverse) {
      return this.cacheResult().__iterator(type, reverse);
    }
    let iterator = collection.__iterator(type, reverse);
    const stack = [];
    let iterations = 0;
    return new Iterator(() => {
      while (iterator) {
        const step = iterator.next();
        if (step.done !== false) {
          iterator = stack.pop();
          continue;
        }
        let v = step.value;
        if (type === ITERATE_ENTRIES) {
          v = v[1];
        }
        if ((!depth || stack.length < depth) && isCollection(v)) {
          stack.push(iterator);
          iterator = v.__iterator(type, reverse);
        } else {
          return useKeys ? step : iteratorValue(type, iterations++, v, step);
        }
      }
      return iteratorDone();
    });
  };
  return flatSequence;
}

export function flatMapFactory(collection, mapper, context) {
  const coerce = collectionClass(collection);
  return collection
    .toSeq()
    .map((v, k) => coerce(mapper.call(context, v, k, collection)))
    .flatten(true);
}

export function interposeFactory(collection, separator) {
  const interposedSequence = makeSequence(collection);
  interposedSequence.size = collection.size && collection.size * 2 - 1;
  interposedSequence.__iterateUncached = function (fn, reverse) {
    let iterations = 0;
    collection.__iterate(
      (v) =>
        (!iterations || fn(separator, iterations++, this) !== false) &&
        fn(v, iterations++, this) !== false,
      reverse
    );
    return iterations;
  };
  interposedSequence.__iteratorUncached = function (type, reverse) {
    const iterator = collection.__iterator(ITERATE_VALUES, reverse);
    let iterations = 0;
    let step;
    return new Iterator(() => {
      if (!step || iterations % 2) {
        step = iterator.next();
        if (step.done) {
          return step;
        }
      }
      return iterations % 2
        ? iteratorValue(type, iterations++, separator)
        : iteratorValue(type, iterations++, step.value, step);
    });
  };
  return interposedSequence;
}

export function sortFactory(collection, comparator, mapper) {
  if (!comparator) {
    comparator = defaultComparator;
  }
  const isKeyedCollection = isKeyed(collection);
  let index = 0;
  const entries = collection
    .toSeq()
    .map((v, k) => [k, v, index++, mapper ? mapper(v, k, collection) : v])
    .valueSeq()
    .toArray();
  entries
    .sort((a, b) => comparator(a[3], b[3]) || a[2] - b[2])
    .forEach(
      isKeyedCollection
        ? (v, i) => {
            entries[i].length = 2;
          }
        : (v, i) => {
            entries[i] = v[1];
          }
    );
  return isKeyedCollection
    ? KeyedSeq(entries)
    : isIndexed(collection)
      ? IndexedSeq(entries)
      : SetSeq(entries);
}

export function maxFactory(collection, comparator, mapper) {
  if (!comparator) {
    comparator = defaultComparator;
  }
  if (mapper) {
    const entry = collection
      .toSeq()
      .map((v, k) => [v, mapper(v, k, collection)])
      .reduce((a, b) => (maxCompare(comparator, a[1], b[1]) ? b : a));
    return entry && entry[0];
  }
  return collection.reduce((a, b) => (maxCompare(comparator, a, b) ? b : a));
}

function maxCompare(comparator, a, b) {
  const comp = comparator(b, a);
  // b is considered the new max if the comparator declares them equal, but
  // they are not equal and b is in fact a nullish value.
  return (
    (comp === 0 && b !== a && (b === undefined || b === null || b !== b)) ||
    comp > 0
  );
}

export function zipWithFactory(keyIter, zipper, iters, zipAll) {
  const zipSequence = makeSequence(keyIter);
  const sizes = new ArraySeq(iters).map((i) => i.size);
  zipSequence.size = zipAll ? sizes.max() : sizes.min();
  // Note: this a generic base implementation of __iterate in terms of
  // __iterator which may be more generically useful in the future.
  zipSequence.__iterate = function (fn, reverse) {
    /* generic:
    var iterator = this.__iterator(ITERATE_ENTRIES, reverse);
    var step;
    var iterations = 0;
    while (!(step = iterator.next()).done) {
      iterations++;
      if (fn(step.value[1], step.value[0], this) === false) {
        break;
      }
    }
    return iterations;
    */
    // indexed:
    const iterator = this.__iterator(ITERATE_VALUES, reverse);
    let step;
    let iterations = 0;
    while (!(step = iterator.next()).done) {
      if (fn(step.value, iterations++, this) === false) {
        break;
      }
    }
    return iterations;
  };
  zipSequence.__iteratorUncached = function (type, reverse) {
    const iterators = iters.map(
      (i) => ((i = Collection(i)), getIterator(reverse ? i.reverse() : i))
    );
    let iterations = 0;
    let isDone = false;
    return new Iterator(() => {
      let steps;
      if (!isDone) {
        steps = iterators.map((i) => i.next());
        isDone = zipAll
          ? steps.every((s) => s.done)
          : steps.some((s) => s.done);
      }
      if (isDone) {
        return iteratorDone();
      }
      return iteratorValue(
        type,
        iterations++,
        zipper.apply(
          null,
          steps.map((s) => s.value)
        )
      );
    });
  };
  return zipSequence;
}

// #pragma Helper Functions

export function reify(iter, seq) {
  return iter === seq
    ? iter
    : isSeq(iter)
      ? seq
      : iter.create
        ? iter.create(seq)
        : iter.constructor(seq);
}

function validateEntry(entry) {
  if (entry !== Object(entry)) {
    throw new TypeError('Expected [K, V] tuple: ' + entry);
  }
}

function makeSequence(collection) {
  return Object.create(
    (isKeyed(collection)
      ? KeyedSeqImpl
      : isIndexed(collection)
        ? IndexedSeqImpl
        : SetSeqImpl
    ).prototype
  );
}

function cacheResultThrough() {
  if (this._iter.cacheResult) {
    this._iter.cacheResult();
    this.size = this._iter.size;
    return this;
  }
  return SeqImpl.prototype.cacheResult.call(this);
}

function defaultComparator(a, b) {
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

function hashMerge(a, b) {
  return (a ^ (b + 0x9e3779b9 + (a << 6) + (a >> 2))) | 0; // int
}

function murmurHashOfSize(size, h) {
  h = imul(h, 0xcc9e2d51);
  h = imul((h << 15) | (h >>> -15), 0x1b873593);
  h = imul((h << 13) | (h >>> -13), 5);
  h = ((h + 0xe6546b64) | 0) ^ size;
  h = imul(h ^ (h >>> 16), 0x85ebca6b);
  h = imul(h ^ (h >>> 13), 0xc2b2ae35);
  h = smi(h ^ (h >>> 16));
  return h;
}

function hashCollection(collection) {
  if (collection.size === Infinity) {
    return 0;
  }
  const ordered = isOrdered(collection);
  const keyed = isKeyed(collection);
  let h = ordered ? 1 : 0;

  collection.__iterate(
    keyed
      ? ordered
        ? (v, k) => {
            h = (31 * h + hashMerge(hash(v), hash(k))) | 0;
          }
        : (v, k) => {
            h = (h + hashMerge(hash(v), hash(k))) | 0;
          }
      : ordered
        ? (v) => {
            h = (31 * h + hash(v)) | 0;
          }
        : (v) => {
            h = (h + hash(v)) | 0;
          }
  );

  return murmurHashOfSize(collection.size, h);
}

function reduce(collection, reducer, reduction, context, useFirst, reverse) {
  assertNotInfinite(collection.size);
  collection.__iterate((v, k, c) => {
    if (useFirst) {
      useFirst = false;
      reduction = v;
    } else {
      reduction = reducer.call(context, reduction, v, k, c);
    }
  }, reverse);
  return reduction;
}

function not(predicate) {
  return function () {
    return !predicate.apply(this, arguments);
  };
}

function neg(predicate) {
  return function () {
    return -predicate.apply(this, arguments);
  };
}

function defaultNegComparator(a, b) {
  return a < b ? 1 : a > b ? -1 : 0;
}

// #pragma Helper functions

function keyMapper(v, k) {
  return k;
}

function entryMapper(v, k) {
  return [k, v];
}

const collectionToArray = (collection) => {
  assertNotInfinite(collection.size);
  const array = new Array(collection.size || 0);
  const useTuples = isKeyed(collection);
  let i = 0;
  collection.__iterate((v, k) => {
    // Keyed collections produce an array of tuples.
    array[i++] = useTuples ? [k, v] : v;
  });
  return array;
};

const collectionSplice = (collection, index, removeNum, args) => {
  const numArgs =
    typeof index === 'undefined'
      ? 0
      : args.length
        ? 3
        : typeof removeNum === 'undefined'
          ? 1
          : 2;
  removeNum = Math.max(removeNum || 0, 0);
  if (numArgs === 0 || (numArgs === 2 && !removeNum)) {
    return collection;
  }
  // If index is negative, it should resolve relative to the size of the
  // collection. However size may be expensive to compute if not cached, so
  // only call count() if the number is in fact negative.
  index = resolveBegin(index, index < 0 ? collection.count() : collection.size);
  const spliced = collection.slice(0, index);
  return reify(
    collection,
    numArgs === 1
      ? spliced
      : spliced.concat(args, collection.slice(index + removeNum))
  );
};

const collectionInterleave = (collection, collections, zipper) => {
  const collectionsJoined = [collection].concat(arrCopy(collections));
  const zipped = zipWithFactory(collection.toSeq(), zipper, collectionsJoined);
  const interleaved = zipped.flatten(true);
  if (zipped.size) {
    interleaved.size = zipped.size * collectionsJoined.length;
  }
  return reify(collection, interleaved);
};

const collectionReduce = (collection, reducer, initialReduction, context) => {
  return reduce(
    collection,
    reducer,
    initialReduction,
    context,
    typeof initialReduction === 'undefined' && typeof context === 'undefined',
    false
  );
};

const collectionReduceRight = (
  collection,
  reducer,
  initialReduction,
  context
) => {
  return reduce(
    collection,
    reducer,
    initialReduction,
    context,
    typeof initialReduction === 'undefined' && typeof context === 'undefined',
    true
  );
};

const collectionFilter = (collection, predicate, context) => {
  return reify(collection, filterFactory(collection, predicate, context, true));
};

const collectionFindEntry = (collection, predicate, context, notSetValue) => {
  let found = notSetValue;
  collection.__iterate((v, k, c) => {
    if (predicate.call(context, v, k, c)) {
      found = [k, v];
      return false;
    }
  });
  return found;
};

const collectionTake = (collection, amount) => {
  return collection.slice(0, Math.max(0, amount));
};

const collectionTakeLast = (collection, amount) => {
  return collection.slice(-Math.max(0, amount));
};

const collectionTakeWhile = (collection, predicate, context) => {
  return reify(collection, takeWhileFactory(collection, predicate, context));
};

const collectionToIndexedSeq = (collection) => {
  return new ToIndexedSequence(collection);
};

const collectionToJS = toJS;

const collectionToKeyedSequence = (collection) => {
  return new ToKeyedSequence(collection, true);
};

const collectionToMap = (collection) => {
  // Use Late Binding here to solve the circular dependency.
  return Map(collectionToKeyedSequence(collection));
};

const collectionToOrderedMap = (collection) => {
  // Use Late Binding here to solve the circular dependency.
  return OrderedMap(collectionToKeyedSequence(collection));
};

const collectionValueSeq = (collection) => {
  return collection.toIndexedSeq();
};

const collectionToOrderedSet = (collection) => {
  // Use Late Binding here to solve the circular dependency.
  return OrderedSet(isKeyed(collection) ? collection.valueSeq() : collection);
};

const collectionToSet = (collection) => {
  // Use Late Binding here to solve the circular dependency.
  return Set(isKeyed(collection) ? collection.valueSeq() : collection);
};

const collectionToSetSeq = (collection) => {
  return new ToSetSequence(collection);
};

const collectionToSeq = (collection) => {
  return isIndexed(collection)
    ? collection.toIndexedSeq()
    : isKeyed(collection)
      ? collection.toKeyedSeq()
      : collection.toSetSeq();
};

const collectionToStack = (collection) => {
  // Use Late Binding here to solve the circular dependency.
  return Stack(isKeyed(collection) ? collection.valueSeq() : collection);
};

const collectionToList = (collection) => {
  // Use Late Binding here to solve the circular dependency.
  return List(isKeyed(collection) ? collection.valueSeq() : collection);
};

const collectionToStringDetails = (collection, head, tail) => {
  if (collection.size === 0) {
    return head + tail;
  }
  return (
    head +
    ' ' +
    collection.toSeq().map(collection.__toStringMapper).join(', ') +
    ' ' +
    tail
  );
};

const collectionConcat = (collection, values) => {
  return reify(collection, concatFactory(collection, values));
};

const collectionIncludes = (collection, searchValue) => {
  return collection.some((value) => is(value, searchValue));
};

const collectionEntries = (collection) => {
  return collection.__iterator(ITERATE_ENTRIES);
};

const collectionEvery = (collection, predicate, context) => {
  assertNotInfinite(collection.size);
  let returnValue = true;
  collection.__iterate((v, k, c) => {
    if (!predicate.call(context, v, k, c)) {
      returnValue = false;
      return false;
    }
  });
  return returnValue;
};

const collectionPartition = (collection, predicate, context) => {
  return partitionFactory(collection, predicate, context);
};

const collectionFind = (collection, predicate, context, notSetValue) => {
  const entry = collection.findEntry(predicate, context);
  return entry ? entry[1] : notSetValue;
};

const collectionForEach = (collection, sideEffect, context) => {
  assertNotInfinite(collection.size);
  return collection.__iterate(context ? sideEffect.bind(context) : sideEffect);
};

const collectionJoin = (collection, separator) => {
  assertNotInfinite(collection.size);
  separator = separator !== undefined ? '' + separator : ',';
  let joined = '';
  let isFirst = true;
  collection.__iterate((v) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions -- TODO enable eslint here
    isFirst ? (isFirst = false) : (joined += separator);
    joined += v !== null && v !== undefined ? v.toString() : '';
  });
  return joined;
};

const collectionKeys = (collection) => {
  return collection.__iterator(ITERATE_KEYS);
};

const collectionMap = (collection, mapper, context) => {
  return reify(collection, mapFactory(collection, mapper, context));
};

const collectionReverse = (collection) => {
  return reify(collection, reverseFactory(collection, true));
};

const collectionSlice = (collection, begin, end) => {
  return reify(collection, sliceFactory(collection, begin, end, true));
};

const collectionSome = (collection, predicate, context) => {
  assertNotInfinite(collection.size);
  let returnValue = false;
  collection.__iterate((v, k, c) => {
    if (predicate.call(context, v, k, c)) {
      returnValue = true;
      return false;
    }
  });
  return returnValue;
};

const collectionSort = (collection, comparator) => {
  return reify(collection, sortFactory(collection, comparator));
};

const collectionValues = (collection) => {
  return collection.__iterator(ITERATE_VALUES);
};

const collectionButLast = (collection) => {
  return collection.slice(0, -1);
};

const collectionIsEmpty = (collection) => {
  return collection.size !== undefined
    ? collection.size === 0
    : !collection.some(() => true);
};

const collectionCount = (collection, predicate, context) => {
  return ensureSize(
    predicate ? collection.toSeq().filter(predicate, context) : collection
  );
};

const collectionCountBy = (collection, grouper, context) => {
  return countByFactory(collection, grouper, context);
};

const collectionEquals = (collection, other) => {
  return deepEqual(collection, other);
};

const collectionEntrySeq = (collection, ArraySeqConstructor) => {
  if (collection._cache) {
    // We cache as an entries array, so we can just return the cache!
    return new ArraySeqConstructor(collection._cache);
  }
  const entriesSequence = collection.toSeq().map(entryMapper).toIndexedSeq();
  entriesSequence.fromEntrySeq = () => collection.toSeq();
  return entriesSequence;
};

const collectionFilterNot = (collection, predicate, context) => {
  return collection.filter(not(predicate), context);
};

const collectionFindKey = (collection, predicate, context) => {
  const entry = collectionFindEntry(collection, predicate, context);

  return entry && entry[0];
};

const collectionFindLast = (collection, predicate, context, notSetValue) => {
  return collection
    .toKeyedSeq()
    .reverse()
    .find(predicate, context, notSetValue);
};

const collectionFindLastEntry = (
  collection,
  predicate,
  context,
  notSetValue
) => {
  return collection
    .toKeyedSeq()
    .reverse()
    .findEntry(predicate, context, notSetValue);
};

const collectionFindLastKey = (collection, predicate, context) => {
  return collection.toKeyedSeq().reverse().findKey(predicate, context);
};

const collectionFirst = (collection, notSetValue) => {
  return collection.find(returnTrue, null, notSetValue);
};

const collectionFlatMap = (collection, mapper, context) => {
  return reify(collection, flatMapFactory(collection, mapper, context));
};

const collectionFlatten = (collection, depth) => {
  return reify(collection, flattenFactory(collection, depth, true));
};

const collectionFromEntrySeq = (collection) => {
  return new FromEntriesSequence(collection);
};

const collectionGet = (collection, searchKey, notSetValue) => {
  return collection.find(
    (_, key) => is(key, searchKey),
    undefined,
    notSetValue
  );
};

const collectionGroupBy = (collection, grouper, context) => {
  return groupByFactory(collection, grouper, context);
};

const collectionHas = (collection, searchKey) => {
  return collection.get(searchKey, NOT_SET) !== NOT_SET;
};

const collectionIsSubset = (collection, iter, Collection) => {
  iter = typeof iter.includes === 'function' ? iter : Collection(iter);
  return collection.every((value) => iter.includes(value));
};

const collectionIsSuperset = (collection, iter, Collection) => {
  iter = typeof iter.isSubset === 'function' ? iter : Collection(iter);
  return iter.isSubset(collection);
};

const collectionKeyOf = (collection, searchValue) => {
  return collection.findKey((value) => is(value, searchValue));
};

const collectionKeySeq = (collection) => {
  return collection.toSeq().map(keyMapper).toIndexedSeq();
};

const collectionLast = (collection, notSetValue) => {
  return collection.toSeq().reverse().first(notSetValue);
};

const collectionLastKeyOf = (collection, searchValue) => {
  return collection.toKeyedSeq().reverse().keyOf(searchValue);
};

const collectionMax = (collection, comparator) => {
  return maxFactory(collection, comparator);
};

const collectionMaxBy = (collection, mapper, comparator) => {
  return maxFactory(collection, comparator, mapper);
};

const collectionMin = (collection, comparator) => {
  return maxFactory(
    collection,
    comparator ? neg(comparator) : defaultNegComparator
  );
};

const collectionMinBy = (collection, mapper, comparator) => {
  return maxFactory(
    collection,
    comparator ? neg(comparator) : defaultNegComparator,
    mapper
  );
};

const collectionRest = (collection) => {
  return collection.slice(1);
};

const collectionSkip = (collection, amount) => {
  return amount === 0 ? collection : collection.slice(Math.max(0, amount));
};

const collectionSkipLast = (collection, amount) => {
  return amount === 0 ? collection : collection.slice(0, -Math.max(0, amount));
};

const collectionSkipWhile = (collection, predicate, context) => {
  return reify(
    collection,
    skipWhileFactory(collection, predicate, context, true)
  );
};

const collectionSkipUntil = (collection, predicate, context) => {
  return collection.skipWhile(not(predicate), context);
};

const collectionSortBy = (collection, mapper, comparator) => {
  return reify(collection, sortFactory(collection, comparator, mapper));
};

const collectionTakeUntil = (collection, predicate, context) => {
  return collection.takeWhile(not(predicate), context);
};

const collectionHashCode = (collection) => {
  return collection.__hash || (collection.__hash = hashCollection(collection));
};

const seqArrayGet = (seq, index, notSetValue) => {
  return seq.has(index) ? seq._array[wrapIndex(seq, index)] : notSetValue;
};

const seqKeyedToKeyedSeq = (seqkeyed) => {
  return seqkeyed;
};

const collectionKeyedFlip = (collection) => {
  return reify(collection, flipFactory(collection));  
}

const collectionKeyedMapEntries = (collection, mapper, context) => {
  let iterations = 0;
  return reify(
    collection,
    collection.toSeq()
      .map((v, k) => mapper.call(context, [k, v], iterations++, collection))
      .fromEntrySeq()
  );
}

const collectionKeyedMapKeys = (collection, mapper, context) => {
  return reify(
    collection,
    collection.toSeq()
      .flip()
      .map((k, v) => mapper.call(context, k, v, collection))
      .flip()
  );
};

export {
  seqArrayGet,

  collectionKeyedFlip,
  collectionKeyedMapEntries,
  collectionKeyedMapKeys,

  collectionToArray,
  collectionToIndexedSeq,
  collectionToJS,
  collectionToKeyedSequence,
  collectionToMap,
  collectionToOrderedMap,
  collectionValueSeq,
  collectionToOrderedSet,
  collectionToSet,
  collectionToSetSeq,
  collectionToSeq,
  collectionToStack,
  collectionToList,
  collectionToStringDetails,
  collectionConcat,
  collectionIncludes,
  collectionEntries,
  collectionEvery,
  collectionPartition,
  collectionFind,
  collectionForEach,
  collectionSplice,
  collectionInterleave,
  collectionReduce,
  collectionReduceRight,
  collectionFilter,
  collectionFindEntry,
  collectionTake,
  collectionTakeLast,
  collectionTakeWhile,
  collectionJoin,
  collectionKeys,
  collectionMap,
  collectionReverse,
  collectionSlice,
  collectionSort,
  collectionSome,
  collectionValues,
  collectionButLast,
  collectionIsEmpty,
  collectionCount,
  collectionCountBy,
  collectionEquals,
  collectionEntrySeq,
  collectionFilterNot,
  collectionFindKey,
  collectionFindLast,
  collectionFindLastEntry,
  collectionFindLastKey,
  collectionFirst,
  collectionFlatMap,
  collectionFlatten,
  collectionFromEntrySeq,
  collectionGet,
  collectionGroupBy,
  collectionHas,
  collectionIsSubset,
  collectionIsSuperset,
  collectionKeyOf,
  collectionKeySeq,
  collectionLast,
  collectionLastKeyOf,
  collectionMax,
  collectionMaxBy,
  collectionMin,
  collectionMinBy,
  collectionRest,
  collectionSkip,
  collectionSkipLast,
  collectionSkipWhile,
  collectionSkipUntil,
  collectionSortBy,
  collectionTakeUntil,
  collectionHashCode,
};
