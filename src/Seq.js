/**
 *  Copyright (c) 2014, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

import "mixin"
import "TrieUtils"
import "Iterable"
import "Iterator"
/* global mixin,
          assertNotInfinite, wrapIndex,
          isIterable, isKeyed, Iterable, KeyedIterable, SetIterable, IndexedIterable,
          Iterator, iteratorValue, iteratorDone, hasIterator, isIterator, getIterator */
/* exported isLazy,
            LazySequence, LazyKeyedSequence, LazySetSequence, LazyIndexedSequence,
            ArraySequence */


class LazySequence extends Iterable {
  constructor(value) {
    return arguments.length === 0 ? emptySequence() : (
      isIterable(value) ? value : seqFromValue(value, false)
    ).toSeq();
  }

  static of(/*...values*/) {
    return LazySequence(arguments);
  }

  toSeq() {
    return this;
  }

  toString() {
    return this.__toString('Seq {', '}');
  }

  cacheResult() {
    if (!this._cache && this.__iterateUncached) {
      assertNotInfinite(this.size);
      this._cache = this.entrySeq().toArray();
      if (this.size === undefined) {
        this.size = this._cache.length;
      }
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

class LazyKeyedSequence extends LazySequence {
  constructor(value) {
    if (arguments.length === 0) {
      return emptySequence().toKeyedSeq();
    }
    if (!isIterable(value)) {
      value = seqFromValue(value, false);
    }
    return isKeyed(value) ? value.toSeq() : value.fromEntrySeq();
  }

  static empty() {
    return LazyKeyedSequence();
  }

  static of(/*...values*/) {
    return LazyKeyedSequence(arguments);
  }

  toKeyedSeq() {
    return this;
  }

  toSeq() {
    return this;
  }
}
mixin(LazyKeyedSequence, KeyedIterable.prototype);

class LazySetSequence extends LazySequence {
  constructor(value) {
    return arguments.length === 0 ? emptySequence().toSetSeq() : (
      isIterable(value) ? value : seqFromValue(value, false)
    ).toSetSeq();
  }

  static empty() {
    return LazySetSequence();
  }

  static of(/*...values*/) {
    return LazySetSequence(arguments);
  }

  toSetSeq() {
    return this;
  }
}
mixin(LazySetSequence, SetIterable.prototype);

class LazyIndexedSequence extends LazySequence {
  constructor(value) {
    return arguments.length === 0 ? emptySequence() : (
      isIterable(value) ? value : seqFromValue(value, false)
    ).toIndexedSeq();
  }

  static empty() {
    return LazyIndexedSequence();
  }

  static of(/*...values*/) {
    return LazyIndexedSequence(arguments);
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
mixin(LazyIndexedSequence, IndexedIterable.prototype);


LazySequence.empty = emptySequence;
LazySequence.isLazy = isLazy;
LazySequence.Keyed = LazyKeyedSequence;
LazySequence.Set = LazySetSequence;
LazySequence.Indexed = LazyIndexedSequence;

var IS_LAZY_SENTINEL = '@@__IMMUTABLE_LAZY__@@';

LazySequence.prototype[IS_LAZY_SENTINEL] = true;



// #pragma Root Sequences

class ArraySequence extends LazyIndexedSequence {
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


class ObjectSequence extends LazyKeyedSequence {
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


class IterableSequence extends LazyIndexedSequence {
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


class IteratorSequence extends LazyIndexedSequence {
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

function isLazy(maybeLazy) {
  return !!(maybeLazy && maybeLazy[IS_LAZY_SENTINEL]);
}

var EMPTY_SEQ;

function emptySequence() {
  return EMPTY_SEQ || (EMPTY_SEQ = new ArraySequence([]));
}

function seqFromValue(value, maybeSingleton) {
  var seq =
    maybeSingleton && typeof value === 'string' ? new ArraySequence([value]) :
    isArrayLike(value) ? new ArraySequence(value) :
    isIterator(value) ? new IteratorSequence(value) :
    hasIterator(value) ? new IterableSequence(value) :
    (maybeSingleton ? isPlainObj(value) : typeof value === 'object') ? new ObjectSequence(value) :
    maybeSingleton ? new ArraySequence([value]) :
    undefined;
  if (!seq) {
    throw new TypeError('Expected iterable: ' + value);
  }
  return seq;
}

function isArrayLike(value) {
  return value && typeof value.length === 'number';
}

function isPlainObj(value) {
  return value && value.constructor === Object;
}

function seqIterate(sequence, fn, reverse, useKeys) {
  var cache = sequence._cache;
  if (cache) {
    var maxIndex = cache.length - 1;
    for (var ii = 0; ii <= maxIndex; ii++) {
      var entry = cache[reverse ? maxIndex - ii : ii];
      if (fn(entry[1], useKeys ? entry[0] : ii, sequence) === false) {
        return ii + 1;
      }
    }
    return ii;
  }
  return sequence.__iterateUncached(fn, reverse);
}

function seqIterator(sequence, type, reverse, useKeys) {
  var cache = sequence._cache;
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
  return sequence.__iteratorUncached(type, reverse);
}
