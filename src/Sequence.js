/**
 *  Copyright (c) 2014, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

/* Sequence has implicit lazy dependencies */
import "TrieUtils"
import "invariant"
import "Hash"
import "Iterator"
/* global is, Map, OrderedMap, Vector, Set,
          arrCopy, NOT_SET,
          invariant,
          hash, HASH_MAX_VAL,
          Iterator, iteratorValue, iteratorDone,
          isIterable, isIterator, getIterator,
          ITERATOR_SYMBOL, ITERATE_KEYS, ITERATE_VALUES, ITERATE_ENTRIES */
/* exported Sequence, IndexedSequence */

class Sequence {

  constructor(value) {
    return Sequence.from(
      arguments.length === 1 ? value : Array.prototype.slice.call(arguments)
    );
  }

  static from(value) {
    if (value instanceof Sequence) {
      return value;
    }
    if (!Array.isArray(value)) {
      if (isIterator(value)) {
        return new IteratorSequence(value);
      }
      if (isIterable(value)) {
        return new IterableSequence(value);
      }
      if (value && value.constructor === Object) {
        return new ObjectSequence(value);
      }
      value = [value];
    }
    return new ArraySequence(value);
  }

  toString() {
    return this.__toString('Seq {', '}');
  }

  __toString(head, tail) {
    if (this.length === 0) {
      return head + tail;
    }
    return head + ' ' + this.map(this.__toStringMapper).join(', ') + ' ' + tail;
  }

  __toStringMapper(v, k) {
    return k + ': ' + quoteString(v);
  }

  toJS() {
    return this.map(
      value => value instanceof Sequence ? value.toJS() : value
    ).__toJS();
  }

  toArray() {
    assertNotInfinite(this.length);
    var array = new Array(this.length || 0);
    this.valueSeq().__iterate((v, i) => { array[i] = v; });
    return array;
  }

  toObject() {
    assertNotInfinite(this.length);
    var object = {};
    this.__iterate((v, k) => { object[k] = v; });
    return object;
  }

  toVector() {
    // Use Late Binding here to solve the circular dependency.
    assertNotInfinite(this.length);
    return Vector.from(this);
  }

  toMap() {
    // Use Late Binding here to solve the circular dependency.
    assertNotInfinite(this.length);
    return Map.from(this);
  }

  toOrderedMap() {
    // Use Late Binding here to solve the circular dependency.
    assertNotInfinite(this.length);
    return OrderedMap.from(this);
  }

  toSet() {
    // Use Late Binding here to solve the circular dependency.
    assertNotInfinite(this.length);
    return Set.from(this);
  }

  toKeyedSeq() {
    return this;
  }

  hashCode() {
    return this.__hash || (this.__hash =
      this.length === Infinity ? 0 : this.reduce(
        (h, v, k) => (h + (hash(v) ^ (v === k ? 0 : hash(k)))) & HASH_MAX_VAL, 0
    ));
  }

  equals(other) {
    if (this === other) {
      return true;
    }
    if (!(other instanceof Sequence)) {
      return false;
    }
    if (this.length != null && other.length != null) {
      if (this.length !== other.length) {
        return false;
      }
      if (this.length === 0 && other.length === 0) {
        return true;
      }
    }
    if (this.__hash != null && other.__hash != null &&
        this.__hash !== other.__hash) {
      return false;
    }
    return this.__deepEquals(other);
  }

  __deepEquals(other) {
    var entries = this.entries();
    return other.every((v, k) => {
      var entry = entries.next().value;
      return entry && is(entry[0], k) && is(entry[1], v);
    }) && entries.next().done;
  }

  join(separator) {
    separator = separator !== undefined ? '' + separator : ',';
    var joined = '';
    var isFirst = true;
    this.__iterate(v => {
      isFirst ? (isFirst = false) : (joined += separator);
      joined += v != null ? v : '';
    });
    return joined;
  }

  count(predicate, context) {
    if (!predicate) {
      if (this.length == null) {
        this.length = this.__iterate(returnTrue);
      }
      return this.length;
    }
    return this.filter(predicate, context).count();
  }

  countBy(grouper, context) {
    var groupMap = {};
    var groups = [];
    this.__iterate((v, k) => {
      var g = grouper.call(context, v, k, this);
      var h = hash(g);
      if (!groupMap.hasOwnProperty(h)) {
        groupMap[h] = groups.length;
        groups.push([g, 1]);
      } else {
        groups[groupMap[h]][1]++;
      }
    });
    return Sequence(groups).fromEntrySeq();
  }

  concat(...values) {
    return concatFactory(this, values, true);
  }

  flatten() {
    return flattenFactory(this, true);
  }

  flatMap(mapper, context) {
    return this.map(mapper, context).flatten();
  }

  reverse() {
    return reverseFactory(this);
  }

  keySeq() {
    return this.flip().valueSeq();
  }

  valueSeq() {
    return new ValuesSequence(this);
  }

  entrySeq() {
    var sequence = this;
    if (sequence._cache) {
      // We cache as an entries array, so we can just return the cache!
      return Sequence(sequence._cache);
    }
    var entriesSequence = sequence.toKeyedSeq().map(entryMapper).valueSeq();
    entriesSequence.fromEntries = () => sequence;
    return entriesSequence;
  }

  forEach(sideEffect, context) {
    return this.__iterate(context ? sideEffect.bind(context) : sideEffect);
  }

  reduce(reducer, initialReduction, context) {
    var reduction;
    var useFirst;
    if (arguments.length < 2) {
      useFirst = true;
    } else {
      reduction = initialReduction;
    }
    this.__iterate((v, k, c) => {
      if (useFirst) {
        useFirst = false;
        reduction = v;
      } else {
        reduction = reducer.call(context, reduction, v, k, c);
      }
    });
    return reduction;
  }

  reduceRight(reducer, initialReduction, context) {
    var reversed = this.toKeyedSeq().reverse();
    return reversed.reduce.apply(reversed, arguments);
  }

  every(predicate, context) {
    var returnValue = true;
    this.__iterate((v, k, c) => {
      if (!predicate.call(context, v, k, c)) {
        returnValue = false;
        return false;
      }
    });
    return returnValue;
  }

  some(predicate, context) {
    return !this.every(not(predicate), context);
  }

  first() {
    return this.find(returnTrue);
  }

  last() {
    return this.findLast(returnTrue);
  }

  rest() {
    return this.slice(1);
  }

  butLast() {
    return this.slice(0, -1);
  }

  has(searchKey) {
    return this.get(searchKey, NOT_SET) !== NOT_SET;
  }

  get(searchKey, notSetValue) {
    return this.find((_, key) => is(key, searchKey), null, notSetValue);
  }

  getIn(searchKeyPath, notSetValue) {
    var nested = this;
    if (searchKeyPath) {
      for (var ii = 0; ii < searchKeyPath.length; ii++) {
        nested = nested && nested.get ? nested.get(searchKeyPath[ii], NOT_SET) : NOT_SET;
        if (nested === NOT_SET) {
          return notSetValue;
        }
      }
    }
    return nested;
  }

  contains(searchValue) {
    return this.find(value => is(value, searchValue), null, NOT_SET) !== NOT_SET;
  }

  find(predicate, context, notSetValue) {
    var foundValue = notSetValue;
    this.__iterate((v, k, c) => {
      if (predicate.call(context, v, k, c)) {
        foundValue = v;
        return false;
      }
    });
    return foundValue;
  }

  findKey(predicate, context) {
    var foundKey;
    this.__iterate((v, k, c) => {
      if (predicate.call(context, v, k, c)) {
        foundKey = k;
        return false;
      }
    });
    return foundKey;
  }

  findLast(predicate, context, notSetValue) {
    return this.toKeyedSeq().reverse().find(predicate, context, notSetValue);
  }

  findLastKey(predicate, context) {
    return this.toKeyedSeq().reverse().findKey(predicate, context);
  }

  flip() {
    return flipFactory(this);
  }

  map(mapper, context) {
    return mapFactory(this, mapper, context);
  }

  mapKeys(mapper, context) {
    return this.flip().map(
      (k, v) => mapper.call(context, k, v, this)
    ).flip();
  }

  mapEntries(mapper, context) {
    return this.entrySeq().map(
      (entry, index) => mapper.call(context, entry, index, this)
    ).fromEntrySeq();
  }

  filter(predicate, context) {
    return filterFactory(this, predicate, context, true);
  }

  slice(begin, end) {
    if (wholeSlice(begin, end, this.length)) {
      return this;
    }
    var resolvedBegin = resolveBegin(begin, this.length);
    var resolvedEnd = resolveEnd(end, this.length);
    // begin or end will be NaN if they were provided as negative numbers and
    // this sequence's length is unknown. In that case, cache first so there is
    // a known length.
    if (resolvedBegin !== resolvedBegin || resolvedEnd !== resolvedEnd) {
      return this.cacheResult().slice(begin, end);
    }
    var skipped = resolvedBegin === 0 ? this : this.skip(resolvedBegin);
    return resolvedEnd == null || resolvedEnd === this.length ?
      skipped : skipped.take(resolvedEnd - resolvedBegin);
  }

  take(amount) {
    return takeFactory(this, amount);
  }

  takeLast(amount) {
    return this.reverse().take(amount).reverse();
  }

  takeWhile(predicate, context) {
    return takeWhileFactory(this, predicate, context);
  }

  takeUntil(predicate, context) {
    return this.takeWhile(not(predicate), context);
  }

  skip(amount) {
    return skipFactory(this, amount, true);
  }

  skipLast(amount) {
    return this.reverse().skip(amount).reverse();
  }

  skipWhile(predicate, context) {
    return skipWhileFactory(this, predicate, context, true);
  }

  skipUntil(predicate, context) {
    return this.skipWhile(not(predicate), context);
  }

  groupBy(grouper, context) {
    return groupByFactory(this, grouper, context, true);
  }

  sort(comparator) {
    return this.sortBy(valueMapper, comparator);
  }

  sortBy(mapper, comparator) {
    comparator = comparator || defaultComparator;
    var seq = this;
    return Sequence(this.entrySeq().entrySeq().toArray().sort(
      (a, b) => comparator(
        mapper(a[1][1], a[1][0], seq),
        mapper(b[1][1], b[1][0], seq)
      ) || a[0] - b[0]
    )).fromEntrySeq().valueSeq().fromEntrySeq();
  }

  cacheResult() {
    if (!this._cache && this.__iterateUncached) {
      assertNotInfinite(this.length);
      this._cache = this.entrySeq().toArray();
      if (this.length == null) {
        this.length = this._cache.length;
      }
    }
    return this;
  }

  keys() {
    return this.__iterator(ITERATE_KEYS);
  }

  values() {
    return this.__iterator(ITERATE_VALUES);
  }

  entries() {
    return this.__iterator(ITERATE_ENTRIES);
  }

  // abstract __iterateUncached(fn, reverse)

  __iterate(fn, reverse) {
    return iterate(this, fn, reverse, true);
  }

  // abstract __iteratorUncached(type, reverse)

  __iterator(type, reverse) {
    return iterator(this, type, reverse, true);
  }

  __makeSequence() {
    return Object.create(SequencePrototype);
  }
}

var SequencePrototype = Sequence.prototype
SequencePrototype[ITERATOR_SYMBOL] = SequencePrototype.entries;
SequencePrototype.toJSON = SequencePrototype.toJS;
SequencePrototype.__toJS = SequencePrototype.toObject;
SequencePrototype.inspect =
SequencePrototype.toSource = function() { return this.toString(); };
SequencePrototype.chain = SequencePrototype.flatMap;


class IndexedSequence extends Sequence {

  toString() {
    return this.__toString('Seq [', ']');
  }

  toKeyedSeq() {
    return new KeyedIndexedSequence(this);
  }

  valueSeq() {
    return this;
  }

  fromEntrySeq() {
    return new FromEntriesSequence(this);
  }

  concat(...values) {
    return concatFactory(this, values, false);
  }

  filter(predicate, context) {
    return filterFactory(this, predicate, context, false);
  }

  get(index, notSetValue) {
    index = wrapIndex(this, index);
    return (index < 0 || (this.length === Infinity ||
        (this.length != null && index > this.length))) ?
      notSetValue :
      this.find((_, key) => key === index, null, notSetValue);
  }

  has(index) {
    index = wrapIndex(this, index);
    return index >= 0 && (this.length != null ?
      this.length === Infinity || index < this.length :
      this.indexOf(index) !== -1
    );
  }

  first() {
    return this.get(0);
  }

  last() {
    return this.get(this.length ? this.length - 1 : 0);
  }

  indexOf(searchValue) {
    return this.findIndex(value => is(value, searchValue));
  }

  lastIndexOf(searchValue) {
    return this.toKeyedSeq().reverse().indexOf(searchValue);
  }

  findIndex(predicate, context) {
    var key = this.findKey(predicate, context);
    return key == null ? -1 : key;
  }

  findLastIndex(predicate, context) {
    return this.toKeyedSeq().reverse().findIndex(predicate, context);
  }

  splice(index, removeNum /*, ...values*/) {
    var numArgs = arguments.length;
    removeNum = Math.max(removeNum | 0, 0);
    if (numArgs === 0 || (numArgs === 2 && !removeNum)) {
      return this;
    }
    index = resolveBegin(index, this.length);
    var spliced = this.slice(0, index);
    return numArgs === 1 ?
      spliced :
      spliced.concat(
        arrCopy(arguments, 2),
        this.slice(index + removeNum)
      );
  }

  flip() {
    return flipFactory(this.toKeyedSeq());
  }

  flatten() {
    return flattenFactory(this, false);
  }

  take(amount) {
    var takeSeq = takeFactory(this, amount);
    if (takeSeq !== this) {
      takeSeq.get = (index, notSetValue) =>
        index < amount ? this.get(index, notSetValue) : notSetValue;
    }
    return takeSeq;
  }

  skip(amount) {
    var skipSeq = skipFactory(this, amount, false);
    if (skipSeq !== this) {
      skipSeq.get = (index, notSetValue) => this.get(index - amount, notSetValue);
    }
    return skipSeq;
  }

  skipWhile(predicate, context) {
    return skipWhileFactory(this, predicate, context, false);
  }

  groupBy(grouper, context) {
    return groupByFactory(this, grouper, context, false);
  }

  sortBy(mapper, comparator) {
    comparator = comparator || defaultComparator;
    var seq = this;
    return Sequence(this.entrySeq().toArray().sort(
      (a, b) => comparator(
        mapper(a[1], a[0], seq),
        mapper(b[1], b[0], seq)
      ) || a[0] - b[0]
    )).fromEntrySeq().valueSeq();
  }

  __iterate(fn, reverse) {
    return iterate(this, fn, reverse, false);
  }

  __iterator(type, reverse) {
    return iterator(this, type, reverse, false);
  }

  __makeSequence() {
    return Object.create(IndexedSequencePrototype);
  }
}

var IndexedSequencePrototype = IndexedSequence.prototype;
IndexedSequencePrototype[ITERATOR_SYMBOL] = IndexedSequencePrototype.values;
IndexedSequencePrototype.__toJS = IndexedSequencePrototype.toArray;
IndexedSequencePrototype.__toStringMapper = quoteString;



// #pragma Root Sequences

class IteratorSequence extends IndexedSequence {
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


class IterableSequence extends IndexedSequence {
  constructor(iterable) {
    this._iterable = iterable;
    this.length = iterable.length || iterable.size;
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
      return new Iterator(() => iteratorDone());
    }
    var iterations = 0;
    return new Iterator(() => {
      var step = iterator.next();
      return step.done ? step : iteratorValue(type, iterations++, step.value);
    });
  }
}


class ObjectSequence extends Sequence {
  constructor(object) {
    var keys = Object.keys(object);
    this._object = object;
    this._keys = keys;
    this.length = keys.length;
  }

  toObject() {
    return this._object;
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


class ArraySequence extends IndexedSequence {
  constructor(array) {
    this._array = array;
    this.length = array.length;
  }

  toArray() {
    return this._array;
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



// #pragma Helper functions

function ensureLength(indexedSeq) {
  if (indexedSeq.length == null) {
    indexedSeq.cacheResult();
  }
  invariant(indexedSeq.length < Infinity, 'Cannot reverse infinite range.');
  return indexedSeq.length;
}

function wholeSlice(begin, end, length) {
  return (begin === 0 || (length != null && begin <= -length)) &&
    (end == null || (length != null && end >= length));
}

function resolveBegin(begin, length) {
  return resolveIndex(begin, length, 0);
}

function resolveEnd(end, length) {
  return resolveIndex(end, length, length);
}

function resolveIndex(index, length, defaultIndex) {
  return index == null ?
    defaultIndex :
    index < 0 ?
      Math.max(0, length + index) :
      length ?
        Math.min(length, index) :
        index;
}

function valueMapper(v) {
  return v;
}

function entryMapper(v, k) {
  return [k, v];
}

function returnTrue() {
  return true;
}

function not(predicate) {
  return function() {
    return !predicate.apply(this, arguments);
  }
}

function quoteString(value) {
  return typeof value === 'string' ? JSON.stringify(value) : value;
}

function defaultComparator(a, b) {
  return a > b ? 1 : a < b ? -1 : 0;
}

function wrapIndex(seq, index) {
  if (index < 0) {
    if (seq.length == null) {
      seq.cacheResult();
    }
    return seq.length + index;
  }
  return index;
}

function assertNotInfinite(length) {
  invariant(
    length !== Infinity,
    'Cannot perform this action with an infinite sequence.'
  );
}


// #pragma Iteration Base Implementations

function iterate(sequence, fn, reverse, useKeys) {
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

function iterator(sequence, type, reverse, useKeys) {
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



// #pragma Lazy Sequence Factories

class ValuesSequence extends IndexedSequence {
  constructor(seq) {
    this._seq = seq;
    this.length = seq.length;
  }

  get(key, notSetValue) {
    return this._seq.get(key, notSetValue);
  }

  has(key) {
    return this._seq.has(key);
  }

  cacheResult() {
    this._seq.cacheResult();
    this.length = this._seq.length;
    return this;
  }

  __iterate(fn, reverse) {
    var iterations = 0;
    return this._seq.__iterate(v => fn(v, iterations++, this), reverse);
  }

  __iterator(type, reverse) {
    var iterator = this._seq.__iterator(ITERATE_VALUES, reverse);
    var iterations = 0;
    return new Iterator(() => {
      var step = iterator.next();
      return step.done ? step :
        iteratorValue(type, iterations++, step.value, step)
    });
  }
}


class KeyedIndexedSequence extends Sequence {
  constructor(indexedSeq) {
    this._seq = indexedSeq;
    this.length = indexedSeq.length;
  }

  get(key, notSetValue) {
    return this._seq.get(key, notSetValue);
  }

  has(key) {
    return this._seq.has(key);
  }

  valueSeq() {
    return this._seq;
  }

  reverse() {
    var reversedSequence = reverseFactory(this);
    reversedSequence.valueSeq = () => this._seq.reverse();
    return reversedSequence;
  }

  map(mapper, context) {
    var mappedSequence = mapFactory(this, mapper, context);
    mappedSequence.valueSeq = () => this._seq.map(mapper, context);
    return mappedSequence;
  }

  cacheResult() {
    this._seq.cacheResult();
    this.length = this._seq.length;
    return this;
  }

  __iterate(fn, reverse) {
    var ii = reverse ? ensureLength(this) : 0;
    return this._seq.__iterate(
      v => fn(v, reverse ? --ii : ii++, this),
      reverse
    );
  }

  __iterator(type, reverse) {
    var iterator = this._seq.__iterator(ITERATE_VALUES, reverse);
    var ii = reverse ? ensureLength(this) : 0;
    return new Iterator(() => {
      var step = iterator.next();
      return step.done ? step :
        iteratorValue(type, reverse ? --ii : ii++, step.value, step)
    });
  }
}


class FromEntriesSequence extends Sequence {
  constructor(entriesSeq) {
    this._seq = entriesSeq;
    this.length = entriesSeq.length;
  }

  entrySeq() {
    return this._seq;
  }

  cacheResult() {
    this._seq.cacheResult();
    this.length = this._seq.length;
    return this;
  }

  __iterate(fn, reverse) {
    // Check if entry exists first so array access doesn't throw for holes
    // in the parent iteration.
    return this._seq.__iterate(
      entry => entry && fn(entry[1], entry[0], this),
      reverse
    );
  }

  __iterator(type, reverse) {
    var iterator = this._seq.__iterator(ITERATE_VALUES, reverse);
    return new Iterator(() => {
      while (true) {
        var step = iterator.next();
        if (step.done) {
          return step;
        }
        var entry = step.value;
        // Check if entry exists first so array access doesn't throw for holes
        // in the parent iteration.
        if (entry) {
          return type === ITERATE_ENTRIES ? step :
            iteratorValue(type, entry[0], entry[1], step);
        }
      }
    });
  }
}


function flipFactory(sequence) {
  var flipSequence = sequence.__makeSequence();
  flipSequence.length = sequence.length;
  flipSequence.flip = () => sequence;
  flipSequence.reverse = function () {
    var reversedSequence = sequence.reverse.apply(this); // super.reverse()
    reversedSequence.flip = () => sequence.reverse();
    return reversedSequence;
  };
  flipSequence.has = key => sequence.contains(key);
  flipSequence.contains = key => sequence.has(key);
  flipSequence.__iterateUncached = function (fn, reverse) {
    return sequence.__iterate((v, k) => fn(k, v, this) !== false, reverse);
  }
  flipSequence.__iteratorUncached = function(type, reverse) {
    if (type === ITERATE_ENTRIES) {
      var iterator = sequence.__iterator(type, reverse);
      return new Iterator(() => {
        var step = iterator.next();
        if (!step.done) {
          var k = step.value[0];
          step.value[0] = step.value[1];
          step.value[1] = k;
        }
        return step;
      });
    }
    return sequence.__iterator(
      type === ITERATE_VALUES ? ITERATE_KEYS : ITERATE_VALUES,
      reverse
    );
  }
  return flipSequence;
}

function mapFactory(sequence, mapper, context) {
  var mappedSequence = sequence.__makeSequence();
  mappedSequence.length = sequence.length;
  mappedSequence.has = key => sequence.has(key);
  mappedSequence.get = (key, notSetValue) => {
    var v = sequence.get(key, NOT_SET);
    return v === NOT_SET ?
      notSetValue :
      mapper.call(context, v, key, sequence);
  };
  mappedSequence.__iterateUncached = function (fn, reverse) {
    return sequence.__iterate(
      (v, k, c) => fn(mapper.call(context, v, k, c), k, this) !== false,
      reverse
    );
  }
  mappedSequence.__iteratorUncached = function (type, reverse) {
    var iterator = sequence.__iterator(ITERATE_ENTRIES, reverse);
    return new Iterator(() => {
      var step = iterator.next();
      if (step.done) {
        return step;
      }
      var entry = step.value;
      var key = entry[0];
      return iteratorValue(
        type,
        key,
        mapper.call(context, entry[1], key, sequence),
        step
      );
    });
  }
  return mappedSequence;
}

function reverseFactory(sequence) {
  var reversedSequence = sequence.__makeSequence();
  reversedSequence.length = sequence.length;
  reversedSequence.reverse = () => sequence;
  reversedSequence.flip = function () {
    var flipSequence = sequence.flip.apply(this); // super.flip()
    flipSequence.reverse = () => sequence.flip();
    return flipSequence;
  };
  reversedSequence.get = (key, notSetValue) => sequence.get(key, notSetValue);
  reversedSequence.has = key => sequence.has(key);
  reversedSequence.contains = value => sequence.contains(value);
  reversedSequence.cacheResult = function () {
    sequence.cacheResult();
    this.length = sequence.length;
    return this;
  };
  reversedSequence.__iterate = function (fn, reverse) {
    return sequence.__iterate((v, k) => fn(v, k, this), !reverse);
  };
  reversedSequence.__iterator =
    (type, reverse) => sequence.__iterator(type, !reverse);
  return reversedSequence;
}

function filterFactory(sequence, predicate, context, useKeys) {
  var filterSequence = sequence.__makeSequence();
  filterSequence.has = key => {
    var v = sequence.get(key, NOT_SET);
    return v !== NOT_SET && !!predicate.call(context, v, key, sequence);
  };
  filterSequence.get = (key, notSetValue) => {
    var v = sequence.get(key, NOT_SET);
    return v !== NOT_SET && predicate.call(context, v, key, sequence) ?
      v : notSetValue;
  };
  filterSequence.__iterateUncached = function (fn, reverse) {
    var iterations = 0;
    sequence.__iterate((v, k, c) => {
      if (predicate.call(context, v, k, c)) {
        iterations++;
        return fn(v, useKeys ? k : iterations - 1, this);
      }
    }, reverse);
    return iterations;
  };
  filterSequence.__iteratorUncached = function (type, reverse) {
    var iterator = sequence.__iterator(ITERATE_ENTRIES, reverse);
    var iterations = 0;
    return new Iterator(() => {
      while (true) {
        var step = iterator.next();
        if (step.done) {
          return step;
        }
        var entry = step.value;
        var key = entry[0];
        var value = entry[1];
        if (predicate.call(context, value, key, sequence)) {
          return iteratorValue(type, useKeys ? key : iterations++, value, step);
        }
      }
    });
  }
  return filterSequence;
}

function groupByFactory(seq, grouper, context, useKeys) {
  var groupMap = {};
  var groups = [];
  seq.__iterate((v, k) => {
    var g = grouper.call(context, v, k, seq);
    var h = hash(g);
    var e = useKeys ? [k, v] : v;
    if (!groupMap.hasOwnProperty(h)) {
      groupMap[h] = groups.length;
      groups.push([g, [e]]);
    } else {
      groups[groupMap[h]][1].push(e);
    }
  });
  return Sequence(groups).fromEntrySeq().map(useKeys ?
    group => Sequence(group).fromEntrySeq() :
    group => Sequence(group)
  );
}

function takeFactory(sequence, amount) {
  if (amount > sequence.length) {
    return sequence;
  }
  if (amount < 0) {
    amount = 0;
  }
  var takeSequence = sequence.__makeSequence();
  takeSequence.length = sequence.length && Math.min(sequence.length, amount);
  takeSequence.__iterateUncached = function(fn, reverse) {
    if (amount === 0) {
      return 0;
    }
    if (reverse) {
      return this.cacheResult().__iterate(fn, reverse);
    }
    var iterations = 0;
    sequence.__iterate((v, k) =>
      ++iterations && fn(v, k, this) !== false && iterations < amount
    );
    return iterations;
  };
  takeSequence.__iteratorUncached = function(type, reverse) {
    if (reverse) {
      return this.cacheResult().__iterator(type, reverse);
    }
    // Don't bother instantiating parent iterator if taking 0.
    var iterator = amount && sequence.__iterator(type, reverse);
    var iterations = 0;
    return new Iterator(() => {
      if (iterations++ > amount) {
        return iteratorDone();
      }
      return iterator.next();
    });
  };
  return takeSequence;
}

function takeWhileFactory(sequence, predicate, context) {
  var takeSequence = sequence.__makeSequence();
  takeSequence.__iterateUncached = function(fn, reverse) {
    if (reverse) {
      return this.cacheResult().__iterate(fn, reverse);
    }
    var iterations = 0;
    sequence.__iterate((v, k, c) =>
      predicate.call(context, v, k, c) && ++iterations && fn(v, k, this)
    );
    return iterations;
  };
  takeSequence.__iteratorUncached = function(type, reverse) {
    if (reverse) {
      return this.cacheResult().__iterator(type, reverse);
    }
    var iterator = sequence.__iterator(ITERATE_ENTRIES, reverse);
    var iterating = true;
    return new Iterator(() => {
      if (!iterating) {
        return iteratorDone();
      }
      var step = iterator.next();
      if (step.done) {
        return step;
      }
      var entry = step.value;
      var k = entry[0];
      var v = entry[1];
      if (!predicate.call(context, v, k, this)) {
        iterating = false;
        return iteratorDone();
      }
      return type === ITERATE_ENTRIES ? step :
        iteratorValue(type, k, v, step);
    });
  };
  return takeSequence;
}

function skipFactory(sequence, amount, useKeys) {
  if (amount <= 0) {
    return sequence;
  }
  var skipSequence = sequence.__makeSequence();
  skipSequence.length = sequence.length && Math.max(0, sequence.length - amount);
  skipSequence.__iterateUncached = function (fn, reverse) {
    if (reverse) {
      return this.cacheResult().__iterate(fn, reverse);
    }
    var skipped = 0;
    var isSkipping = true;
    var iterations = 0;
    sequence.__iterate((v, k) => {
      if (!(isSkipping && (isSkipping = skipped++ < amount))) {
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
    var iterator = amount && sequence.__iterator(type, reverse);
    var skipped = 0;
    var iterations = 0;
    return new Iterator(() => {
      while (skipped < amount) {
        skipped++;
        iterator.next();
      }
      var step = iterator.next();
      if (useKeys || type === ITERATE_VALUES) {
        return step;
      } else if (type === ITERATE_KEYS) {
        return iteratorValue(type, iterations++, null, step);
      } else {
        return iteratorValue(type, iterations++, step.value[1], step);
      }
    });
  };
  return skipSequence;
}

function skipWhileFactory(sequence, predicate, context, useKeys) {
  var skipSequence = sequence.__makeSequence();
  skipSequence.__iterateUncached = function (fn, reverse) {
    if (reverse) {
      return this.cacheResult().__iterate(fn, reverse);
    }
    var isSkipping = true;
    var iterations = 0;
    sequence.__iterate((v, k, c) => {
      if (!(isSkipping && (isSkipping = predicate.call(context, v, k, c)))) {
        iterations++;
        return fn(v, useKeys ? k : iterations - 1, this);
      }
    });
    return iterations;
  };
  skipSequence.__iteratorUncached = function(type, reverse) {
    if (reverse) {
      return this.cacheResult().__iterator(type, reverse);
    }
    var iterator = sequence.__iterator(ITERATE_ENTRIES, reverse);
    var skipping = true;
    var iterations = 0;
    return new Iterator(() => {
      var step, k, v;
      do {
        step = iterator.next();
        if (step.done) {
          if (useKeys || type === ITERATE_VALUES) {
            return step;
          } else if (type === ITERATE_KEYS) {
            return iteratorValue(type, iterations++, null, step);
          } else {
            return iteratorValue(type, iterations++, step.value[1], step);
          }
        }
        var entry = step.value;
        k = entry[0];
        v = entry[1];
        skipping && (skipping = predicate.call(context, v, k, this));
      } while (skipping);
      return type === ITERATE_ENTRIES ? step :
        iteratorValue(type, k, v, step);
    });
  };
  return skipSequence;
}

function concatFactory(sequence, values, useKeys) {
  var sequences = [sequence].concat(values);
  var concatSequence = Sequence(sequences);
  if (useKeys) {
    concatSequence = concatSequence.toKeyedSeq();
  }
  concatSequence = concatSequence.flatten();
  concatSequence.length = sequences.reduce(
    (sum, seq) => {
      if (sum !== undefined) {
        var len = Sequence(seq).length;
        if (len != null) {
          return sum + len;
        }
      }
    },
    0
  );
  return concatSequence;
}

function flattenFactory(sequence, useKeys) {
  var flatSequence = sequence.__makeSequence();
  flatSequence.__iterateUncached = function(fn, reverse) {
    var iterations = 0;
    sequence.__iterate(seq => {
      var stopped = false;
      Sequence(seq).__iterate((v, k) => {
        if (fn(v, useKeys ? k : iterations++, this) === false) {
          stopped = true;
          return false;
        }
      }, reverse);
      return !stopped;
    }, reverse);
    return iterations;
  }
  flatSequence.__iteratorUncached = function(type, reverse) {
    var sequenceIterator = sequence.__iterator(ITERATE_VALUES, reverse);
    var iterator;
    var iterations = 0;
    return new Iterator(() => {
      while (true) {
        if (iterator) {
          var step = iterator.next();
          if (!step.done) {
            if (useKeys || type === ITERATE_VALUES) {
              return step;
            } else if (type === ITERATE_KEYS) {
              return iteratorValue(type, iterations++, null, step);
            } else {
              return iteratorValue(type, iterations++, step.value[1], step);
            }
          }
        }
        var sequenceStep = sequenceIterator.next();
        if (sequenceStep.done) {
          return sequenceStep;
        }
        iterator = Sequence(sequenceStep.value).__iterator(type, reverse);
      }
    });
  }
  return flatSequence;
}
