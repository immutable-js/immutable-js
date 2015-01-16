/**
 *  Copyright (c) 2014, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

import { wrapIndex } from './TrieUtils'
import { isIterable, isKeyed, Iterable, IS_ORDERED_SENTINEL } from './Iterable'
import { Iterator, iteratorValue, iteratorDone, hasIterator, isIterator, getIterator } from './Iterator'

import isArrayLike from './utils/isArrayLike'


export class Seq extends Iterable {
  constructor(value) {
    return value === null || value === undefined ? emptySequence() :
      isIterable(value) ? value.toSeq() : seqFromValue(value);
  }

  static of(/*...values*/) {
    return Seq(arguments);
  }

  toSeq() {
    return this;
  }

  toString() {
    return this.__toString('Seq {', '}');
  }

  cacheResult() {
    if (!this._cache && this.__iterateUncached) {
      this._cache = this.entrySeq().toArray();
      this.size = this._cache.length;
    }
    return this;
  }

  // abstract __iterateUncached(fn, reverse)

  __iterate(fn, reverse) {
    return seqIterate(this, fn, reverse, true);
  }

  // abstract __iteratorUncached(type, reverse)

  __iterator(type, reverse) {
    return seqIterator(this, type, reverse, true);
  }
}


export class KeyedSeq extends Seq {
  constructor(value) {
    return value === null || value === undefined ?
      emptySequence().toKeyedSeq() :
      isIterable(value) ?
        (isKeyed(value) ? value.toSeq() : value.fromEntrySeq()) :
        keyedSeqFromValue(value);
  }

  toKeyedSeq() {
    return this;
  }
}


export class IndexedSeq extends Seq {
  constructor(value) {
    return value === null || value === undefined ? emptySequence() :
      !isIterable(value) ? indexedSeqFromValue(value) :
      isKeyed(value) ? value.entrySeq() : value.toIndexedSeq();
  }

  static of(/*...values*/) {
    return IndexedSeq(arguments);
  }

  toIndexedSeq() {
    return this;
  }

  toString() {
    return this.__toString('Seq [', ']');
  }

  __iterate(fn, reverse) {
    return seqIterate(this, fn, reverse, false);
  }

  __iterator(type, reverse) {
    return seqIterator(this, type, reverse, false);
  }
}


export class SetSeq extends Seq {
  constructor(value) {
    return (
      value === null || value === undefined ? emptySequence() :
      !isIterable(value) ? indexedSeqFromValue(value) :
      isKeyed(value) ? value.entrySeq() : value
    ).toSetSeq();
  }

  static of(/*...values*/) {
    return SetSeq(arguments);
  }

  toSetSeq() {
    return this;
  }
}


Seq.isSeq = isSeq;
Seq.Keyed = KeyedSeq;
Seq.Set = SetSeq;
Seq.Indexed = IndexedSeq;

var IS_SEQ_SENTINEL = '@@__IMMUTABLE_SEQ__@@';

Seq.prototype[IS_SEQ_SENTINEL] = true;



// #pragma Root Sequences

export class ArraySeq extends IndexedSeq {
  constructor(array) {
    this._array = array;
    this.size = array.length;
  }

  get(index, notSetValue) {
    return this.has(index) ? this._array[wrapIndex(this, index)] : notSetValue;
  }

  __iterate(fn, reverse) {
    var array = this._array;
    var maxIndex = array.length - 1;
    for (var ii = 0; ii <= maxIndex; ii++) {
      if (fn(array[reverse ? maxIndex - ii : ii], ii, this) === false) {
        return ii + 1;
      }
    }
    return ii;
  }

  __iterator(type, reverse) {
    var array = this._array;
    var maxIndex = array.length - 1;
    var ii = 0;
    return new Iterator(() =>
      ii > maxIndex ?
        iteratorDone() :
        iteratorValue(type, ii, array[reverse ? maxIndex - ii++ : ii++])
    );
  }
}


class ObjectSeq extends KeyedSeq {
  constructor(object) {
    var keys = Object.keys(object);
    this._object = object;
    this._keys = keys;
    this.size = keys.length;
  }

  get(key, notSetValue) {
    if (notSetValue !== undefined && !this.has(key)) {
      return notSetValue;
    }
    return this._object[key];
  }

  has(key) {
    return this._object.hasOwnProperty(key);
  }

  __iterate(fn, reverse) {
    var object = this._object;
    var keys = this._keys;
    var maxIndex = keys.length - 1;
    for (var ii = 0; ii <= maxIndex; ii++) {
      var key = keys[reverse ? maxIndex - ii : ii];
      if (fn(object[key], key, this) === false) {
        return ii + 1;
      }
    }
    return ii;
  }

  __iterator(type, reverse) {
    var object = this._object;
    var keys = this._keys;
    var maxIndex = keys.length - 1;
    var ii = 0;
    return new Iterator(() => {
      var key = keys[reverse ? maxIndex - ii : ii];
      return ii++ > maxIndex ?
        iteratorDone() :
        iteratorValue(type, key, object[key]);
    });
  }
}
ObjectSeq.prototype[IS_ORDERED_SENTINEL] = true;


class IterableSeq extends IndexedSeq {
  constructor(iterable) {
    this._iterable = iterable;
    this.size = iterable.length || iterable.size;
  }

  __iterateUncached(fn, reverse) {
    if (reverse) {
      return this.cacheResult().__iterate(fn, reverse);
    }
    var iterable = this._iterable;
    var iterator = getIterator(iterable);
    var iterations = 0;
    if (isIterator(iterator)) {
      var step;
      while (!(step = iterator.next()).done) {
        if (fn(step.value, iterations++, this) === false) {
          break;
        }
      }
    }
    return iterations;
  }

  __iteratorUncached(type, reverse) {
    if (reverse) {
      return this.cacheResult().__iterator(type, reverse);
    }
    var iterable = this._iterable;
    var iterator = getIterator(iterable);
    if (!isIterator(iterator)) {
      return new Iterator(iteratorDone);
    }
    var iterations = 0;
    return new Iterator(() => {
      var step = iterator.next();
      return step.done ? step : iteratorValue(type, iterations++, step.value);
    });
  }
}


class IteratorSeq extends IndexedSeq {
  constructor(iterator) {
    this._iterator = iterator;
    this._iteratorCache = [];
  }

  __iterateUncached(fn, reverse) {
    if (reverse) {
      return this.cacheResult().__iterate(fn, reverse);
    }
    var iterator = this._iterator;
    var cache = this._iteratorCache;
    var iterations = 0;
    while (iterations < cache.length) {
      if (fn(cache[iterations], iterations++, this) === false) {
        return iterations;
      }
    }
    var step;
    while (!(step = iterator.next()).done) {
      var val = step.value;
      cache[iterations] = val;
      if (fn(val, iterations++, this) === false) {
        break;
      }
    }
    return iterations;
  }

  __iteratorUncached(type, reverse) {
    if (reverse) {
      return this.cacheResult().__iterator(type, reverse);
    }
    var iterator = this._iterator;
    var cache = this._iteratorCache;
    var iterations = 0;
    return new Iterator(() => {
      if (iterations >= cache.length) {
        var step = iterator.next();
        if (step.done) {
          return step;
        }
        cache[iterations] = step.value;
      }
      return iteratorValue(type, iterations, cache[iterations++]);
    });
  }
}



// # pragma Helper functions

export function isSeq(maybeSeq) {
  return !!(maybeSeq && maybeSeq[IS_SEQ_SENTINEL]);
}

var EMPTY_SEQ;

function emptySequence() {
  return EMPTY_SEQ || (EMPTY_SEQ = new ArraySeq([]));
}

export function keyedSeqFromValue(value) {
  var seq =
    Array.isArray(value) ? new ArraySeq(value).fromEntrySeq() :
    isIterator(value) ? new IteratorSeq(value).fromEntrySeq() :
    hasIterator(value) ? new IterableSeq(value).fromEntrySeq() :
    typeof value === 'object' ? new ObjectSeq(value) :
    undefined;
  if (!seq) {
    throw new TypeError(
      'Expected Array or iterable object of [k, v] entries, '+
      'or keyed object: ' + value
    );
  }
  return seq;
}

export function indexedSeqFromValue(value) {
  var seq = maybeIndexedSeqFromValue(value);
  if (!seq) {
    throw new TypeError(
      'Expected Array or iterable object of values: ' + value
    );
  }
  return seq;
}

function seqFromValue(value) {
  var seq = maybeIndexedSeqFromValue(value) ||
    (typeof value === 'object' && new ObjectSeq(value));
  if (!seq) {
    throw new TypeError(
      'Expected Array or iterable object of values, or keyed object: ' + value
    );
  }
  return seq;
}

function maybeIndexedSeqFromValue(value) {
  return (
    isArrayLike(value) ? new ArraySeq(value) :
    isIterator(value) ? new IteratorSeq(value) :
    hasIterator(value) ? new IterableSeq(value) :
    undefined
  );
}

function seqIterate(seq, fn, reverse, useKeys) {
  var cache = seq._cache;
  if (cache) {
    var maxIndex = cache.length - 1;
    for (var ii = 0; ii <= maxIndex; ii++) {
      var entry = cache[reverse ? maxIndex - ii : ii];
      if (fn(entry[1], useKeys ? entry[0] : ii, seq) === false) {
        return ii + 1;
      }
    }
    return ii;
  }
  return seq.__iterateUncached(fn, reverse);
}

function seqIterator(seq, type, reverse, useKeys) {
  var cache = seq._cache;
  if (cache) {
    var maxIndex = cache.length - 1;
    var ii = 0;
    return new Iterator(() => {
      var entry = cache[reverse ? maxIndex - ii : ii];
      return ii++ > maxIndex ?
        iteratorDone() :
        iteratorValue(type, useKeys ? entry[0] : ii - 1, entry[1]);
    });
  }
  return seq.__iteratorUncached(type, reverse);
}
