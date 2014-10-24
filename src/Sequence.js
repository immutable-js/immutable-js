/**
 *  Copyright (c) 2014, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

/* Iterable has implicit lazy dependencies */
import "is"
import "TrieUtils"
import "invariant"
import "Hash"
import "Iterator"
/* global is, Map, OrderedMap, Vector, Set, Stack,
          arrCopy, NOT_SET,
          invariant,
          hash, HASH_MAX_VAL,
          Iterator, iteratorValue, iteratorDone,
          hasIterator, isIterator, getIterator,
          ITERATOR_SYMBOL, ITERATE_KEYS, ITERATE_VALUES, ITERATE_ENTRIES */
/* exported Iterable,
            isIterable, isLazy, isKeyed, isIndexed, isAssociative
            LazySequence, LazyKeyedSequence, LazySetSequence, LazyIndexedSequence,
            KeyedCollection, IndexedCollection, SetCollection */

class Iterable {

  constructor(value) {
    return isIterable(value) ? value : seqFromValue(value, true);
  }

  // ### Conversion to other types

  toArray() {
    assertNotInfinite(this.size);
    var array = new Array(this.size || 0);
    this.valueSeq().__iterate((v, i) => { array[i] = v; });
    return array;
  }

  toIndexedSeq() {
    return new ToIndexedSequence(this);
  }

  toJS() {
    return this.toSeq().map(
      value => value && typeof value.toJS === 'function' ? value.toJS() : value
    ).__toJS();
  }

  toKeyedSeq() {
    return new ToKeyedSequence(this, true);
  }

  toMap() {
    // Use Late Binding here to solve the circular dependency.
    assertNotInfinite(this.size);
    return Map.from(this.toKeyedSeq());
  }

  toObject() {
    assertNotInfinite(this.size);
    var object = {};
    this.__iterate((v, k) => { object[k] = v; });
    return object;
  }

  toOrderedMap() {
    // Use Late Binding here to solve the circular dependency.
    assertNotInfinite(this.size);
    return OrderedMap.from(this.toKeyedSeq());
  }

  toSet() {
    // Use Late Binding here to solve the circular dependency.
    assertNotInfinite(this.size);
    return Set.from(this);
  }

  toSetSeq() {
    return new ToSetSequence(this, true);
  }

  toSeq() {
    return isIndexed(this) ? this.toIndexedSeq() :
      isKeyed(this) ? this.toKeyedSeq() :
      this.toSetSeq();
  }

  toStack() {
    // Use Late Binding here to solve the circular dependency.
    assertNotInfinite(this.size);
    return Stack.from(this);
  }

  toVector() {
    // Use Late Binding here to solve the circular dependency.
    assertNotInfinite(this.size);
    return Vector.from(this);
  }


  // ### Common JavaScript methods and properties

  toString() {
    return this.__toString('Seq {', '}');
  }

  __toString(head, tail) {
    if (this.size === 0) {
      return head + tail;
    }
    return head + ' ' + this.toSeq().map(this.__toStringMapper).join(', ') + ' ' + tail;
  }


  // ### ES6 Collection methods (ES6 Array and Map)

  concat(...values) {
    return concatFactory(this, values, true);
  }

  contains(searchValue) {
    return this.find(value => is(value, searchValue), null, NOT_SET) !== NOT_SET;
  }

  entries() {
    return this.__iterator(ITERATE_ENTRIES);
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

  filter(predicate, context) {
    return reify(this, filterFactory(this, predicate, context, true));
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

  forEach(sideEffect, context) {
    return this.__iterate(context ? sideEffect.bind(context) : sideEffect);
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

  keys() {
    return this.__iterator(ITERATE_KEYS);
  }

  map(mapper, context) {
    return reify(this, mapFactory(this, mapper, context));
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

  reverse() {
    return reify(this, reverseFactory(this, true));
  }

  slice(begin, end) {
    if (wholeSlice(begin, end, this.size)) {
      return this;
    }
    var resolvedBegin = resolveBegin(begin, this.size);
    var resolvedEnd = resolveEnd(end, this.size);
    // begin or end will be NaN if they were provided as negative numbers and
    // this iterable's size is unknown. In that case, cache first so there is
    // a known size.
    if (resolvedBegin !== resolvedBegin || resolvedEnd !== resolvedEnd) {
      return this.cacheResult().slice(begin, end);
    }
    var skipped = resolvedBegin === 0 ? this : this.skip(resolvedBegin);
    return reify(
      this,
      resolvedEnd == null || resolvedEnd === this.size ?
        skipped :
        skipped.take(resolvedEnd - resolvedBegin)
    );
  }

  some(predicate, context) {
    return !this.every(not(predicate), context);
  }

  sort(comparator) {
    return this.sortBy(valueMapper, comparator);
  }

  values() {
    return this.__iterator(ITERATE_VALUES);
  }


  // ### More sequential methods

  butLast() {
    return this.slice(0, -1);
  }

  count(predicate, context) {
    if (predicate) {
      return this.toSeq().filter(predicate, context).count();
    }
    if (this.size == null) {
      this.size = this.__iterate(returnTrue);
    }
    return this.size;
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
    return IndexedIterable(groups).fromEntrySeq();
  }

  equals(other) {
    if (this === other) {
      return true;
    }
    if (!other || typeof other.equals !== 'function') {
      return false;
    }
    if (this.size != null && other.size != null) {
      if (this.size !== other.size) {
        return false;
      }
      if (this.size === 0 && other.size === 0) {
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
    return typeof other.every === 'function' && other.every((v, k) => {
      var entry = entries.next().value;
      return entry && is(entry[0], k) && is(entry[1], v);
    }) && entries.next().done;
  }

  entrySeq() {
    var iterable = this;
    if (iterable._cache) {
      // We cache as an entries array, so we can just return the cache!
      return IndexedIterable(iterable._cache);
    }
    var entriesSequence = iterable.toKeyedSeq().map(entryMapper).toIndexedSeq();
    entriesSequence.fromEntrySeq = () => iterable.toSeq();
    return entriesSequence;
  }

  filterNot(predicate, context) {
    return this.filter(not(predicate), context);
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

  first() {
    return this.find(returnTrue);
  }

  flatMap(mapper, context) {
    return reify(this,
      this.toSeq().map(
        (v, k, c) => Iterable(mapper.call(context, v, k, c))
      ).flatten(true)
    );
  }

  flatten(depth) {
    return reify(this, flattenFactory(this, depth, true));
  }

  flip() {
    return reify(this, flipFactory(this));
  }

  fromEntrySeq() {
    return new FromEntriesSequence(this);
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

  groupBy(grouper, context) {
    return groupByFactory(this, grouper, context, true);
  }

  has(searchKey) {
    return this.get(searchKey, NOT_SET) !== NOT_SET;
  }

  isSubset(seq) {
    seq = typeof seq.contains === 'function' ? seq : Iterable(seq);
    return this.every(value => seq.contains(value));
  }

  isSuperset(seq) {
    return seq.isSubset(this);
  }

  keySeq() {
    return this.toSeq().flip().toIndexedSeq();
  }

  last() {
    return this.toSeq().reverse().first();
  }

  mapEntries(mapper, context) {
    return reify(this,
      this.entrySeq().map(
        (entry, index) => mapper.call(context, entry, index, this)
      ).fromEntrySeq()
    );
  }

  mapKeys(mapper, context) {
    return reify(this,
      this.toSeq().flip().map(
        (k, v) => mapper.call(context, k, v, this)
      ).flip()
    );
  }

  max(comparator) {
    return this.maxBy(valueMapper, comparator);
  }

  maxBy(mapper, comparator) {
    comparator = comparator || defaultComparator;
    var seq = this;
    var maxEntry = seq.entrySeq().reduce((max, next) => {
      return comparator(
        mapper(next[1], next[0], seq),
        mapper(max[1], max[0], seq)
      ) > 0 ? next : max
    });
    return maxEntry && maxEntry[1];
  }

  min(comparator) {
    return this.minBy(valueMapper, comparator);
  }

  minBy(mapper, comparator) {
    comparator = comparator || defaultComparator;
    var seq = this;
    var minEntry = seq.entrySeq().reduce((min, next) => {
      return comparator(
        mapper(next[1], next[0], seq),
        mapper(min[1], min[0], seq)
      ) < 0 ? next : min
    });
    return minEntry && minEntry[1];
  }

  rest() {
    return this.slice(1);
  }

  skip(amount) {
    return reify(this, skipFactory(this, amount, true));
  }

  skipLast(amount) {
    return reify(this, this.toSeq().reverse().skip(amount).reverse());
  }

  skipWhile(predicate, context) {
    return reify(this, skipWhileFactory(this, predicate, context, true));
  }

  skipUntil(predicate, context) {
    return this.skipWhile(not(predicate), context);
  }

  sortBy(mapper, comparator) {
    comparator = comparator || defaultComparator;
    var seq = this;
    return reify(this, Iterable(seq.entrySeq().entrySeq().toArray().sort(
      (a, b) => comparator(
        mapper(a[1][1], a[1][0], seq),
        mapper(b[1][1], b[1][0], seq)
      ) || a[0] - b[0]
    )).fromEntrySeq().valueSeq().fromEntrySeq());
  }

  take(amount) {
    return reify(this, takeFactory(this, amount));
  }

  takeLast(amount) {
    return reify(this, this.toSeq().reverse().take(amount).reverse());
  }

  takeWhile(predicate, context) {
    return reify(this, takeWhileFactory(this, predicate, context));
  }

  takeUntil(predicate, context) {
    return this.takeWhile(not(predicate), context);
  }

  valueSeq() {
    return this.toIndexedSeq();
  }


  // ### LazySequence methods

  cacheResult() {
    if (!this._cache && this.__iterateUncached) {
      assertNotInfinite(this.size);
      this._cache = this.entrySeq().toArray();
      if (this.size == null) {
        this.size = this._cache.length;
      }
    }
    return this;
  }


  // ### Hashable Object

  hashCode() {
    return this.__hash || (this.__hash =
      this.size === Infinity ? 0 : this.reduce(
        (h, v, k) => (h + (hash(v) ^ (v === k ? 0 : hash(k)))) & HASH_MAX_VAL, 0
    ));
  }


  // ### Internal

  // abstract __makeSequence

  // abstract __iterateUncached(fn, reverse)

  __iterate(fn, reverse) {
    return iterate(this, fn, reverse, true);
  }

  // abstract __iteratorUncached(type, reverse)

  __iterator(type, reverse) {
    return iterator(this, type, reverse, true);
  }
}

var IS_ITERABLE_SENTINEL = '@@__IMMUTABLE_ITERABLE__@@';
var IS_KEYED_SENTINEL = '@@__IMMUTABLE_KEYED__@@';
var IS_INDEXED_SENTINEL = '@@__IMMUTABLE_INDEXED__@@';

Iterable.from = iteratorFrom;

var IterablePrototype = Iterable.prototype;
IterablePrototype[IS_ITERABLE_SENTINEL] = true;
IterablePrototype[ITERATOR_SYMBOL] = IterablePrototype.values;
IterablePrototype.toJSON = IterablePrototype.toJS;
IterablePrototype.__toJS = IterablePrototype.toArray;
IterablePrototype.__toStringMapper = quoteString;
IterablePrototype.inspect =
IterablePrototype.toSource = function() { return this.toString(); };
IterablePrototype.chain = IterablePrototype.flatMap;

// Temporary warning about using length
(function () {
  try {
    Object.defineProperty(IterablePrototype, 'length', {
      get: function () {
        var stack;
        try {
          throw new Error();
        } catch (error) {
          stack = error.stack;
        }
        if (stack.indexOf('_wrapObject') === -1) {
          console && console.warn && console.warn(
            'iterable.length has been deprecated, '+
            'use iterable.size or iterable.count(). '+
            'This warning will become a silent error in a future version. ' +
            stack
          );
          return this.size;
        }
      }
    });
  } catch (e) {}
})();



class KeyedIterable extends Iterable {

  constructor(seqable) {
    if (!isIterable(seqable)) {
      seqable = seqFromValue(seqable, false);
    }
    return isKeyed(seqable) ? seqable : seqable.fromEntrySeq();
  }

  static from(seqable/*[, mapFn[, context]]*/) {
    return KeyedIterable(iteratorFrom.apply(this, arguments));
  }


  // ### Internal

  __makeSequence() {
    return Object.create(LazyKeyedSequence.prototype);
  }
}

var KeyedIterablePrototype = KeyedIterable.prototype;
KeyedIterablePrototype[IS_KEYED_SENTINEL] = true;
KeyedIterablePrototype[ITERATOR_SYMBOL] = IterablePrototype.entries;
KeyedIterablePrototype.__toJS = IterablePrototype.toObject;
KeyedIterablePrototype.__toStringMapper = (v, k) => k + ': ' + quoteString(v);



class SetIterable extends Iterable {

  constructor(seqable) {
    var isIter = isIterable(seqable);
    return isIter && !isAssociative(seqable) ? seqable : (
      isIter ? seqable : seqFromValue(seqable, false)
    ).toSetSeq();
  }

  static from(seqable/*[, mapFn[, context]]*/) {
    return SetIterable(iteratorFrom.apply(this, arguments));
  }


  // ### ES6 Collection methods (ES6 Array and Map)

  get(value, notSetValue) {
    return this.has(value) ? value : notSetValue;
  }

  contains(value) {
    return this.has(value);
  }


  // ### More sequential methods

  flip() {
    return this;
  }


  // ### Internal

  __makeSequence() {
    return Object.create(LazySetSequence.prototype);
  }
}

var SetIterablePrototype = SetIterable.prototype;
SetIterablePrototype.has = IterablePrototype.contains;



class IndexedIterable extends Iterable {

  constructor(seqable) {
    return isIndexed(seqable) ? seqable : (
      isIterable(seqable) ? seqable : seqFromValue(seqable, false)
    ).toIndexedSeq();
  }

  static from(seqable/*[, mapFn[, context]]*/) {
    return IndexedIterable(iteratorFrom.apply(this, arguments));
  }


  // ### Conversion to other types

  toKeyedSeq() {
    return new ToKeyedSequence(this, false);
  }


  // ### Common JavaScript methods and properties

  toString() {
    return this.__toString('Seq [', ']');
  }


  // ### ES6 Collection methods (ES6 Array and Map)

  concat(...values) {
    return reify(this, concatFactory(this, values, false));
  }

  filter(predicate, context) {
    return reify(this, filterFactory(this, predicate, context, false));
  }

  findIndex(predicate, context) {
    var key = this.findKey(predicate, context);
    return key == null ? -1 : key;
  }

  indexOf(searchValue) {
    return this.findIndex(value => is(value, searchValue));
  }

  lastIndexOf(searchValue) {
    return this.toKeyedSeq().reverse().indexOf(searchValue);
  }

  reverse() {
    return reify(this, reverseFactory(this, false));
  }

  splice(index, removeNum /*, ...values*/) {
    var numArgs = arguments.length;
    removeNum = Math.max(removeNum | 0, 0);
    if (numArgs === 0 || (numArgs === 2 && !removeNum)) {
      return this;
    }
    index = resolveBegin(index, this.size);
    var spliced = this.slice(0, index);
    return reify(
      this,
      numArgs === 1 ?
        spliced :
        spliced.concat(arrCopy(arguments, 2), this.slice(index + removeNum))
    );
  }


  // ### More sequential methods

  findLastIndex(predicate, context) {
    return this.toKeyedSeq().reverse().findIndex(predicate, context);
  }

  first() {
    return this.get(0);
  }

  flatten(depth) {
    return reify(this, flattenFactory(this, depth, false));
  }

  flip() {
    return reify(this, flipFactory(this.toKeyedSeq()));
  }

  get(index, notSetValue) {
    index = wrapIndex(this, index);
    return (index < 0 || (this.size === Infinity ||
        (this.size != null && index > this.size))) ?
      notSetValue :
      this.find((_, key) => key === index, null, notSetValue);
  }

  groupBy(grouper, context) {
    return groupByFactory(this, grouper, context, false);
  }

  has(index) {
    index = wrapIndex(this, index);
    return index >= 0 && (this.size != null ?
      this.size === Infinity || index < this.size :
      this.indexOf(index) !== -1
    );
  }

  interpose(separator) {
    return reify(this, interposeFactory(this, separator));
  }

  last() {
    return this.get(-1);
  }

  skip(amount) {
    var seq = this;
    var skipSeq = skipFactory(seq, amount, false);
    if (skipSeq !== seq) {
      skipSeq.get = function (index, notSetValue) {
        index = wrapIndex(this, index);
        return index >= 0 ? seq.get(index + amount, notSetValue) : notSetValue;
      }
    }
    return reify(this, skipSeq);
  }

  skipWhile(predicate, context) {
    return reify(this, skipWhileFactory(this, predicate, context, false));
  }

  sortBy(mapper, comparator) {
    comparator = comparator || defaultComparator;
    var seq = this;
    return reify(this, Iterable(this.entrySeq().toArray().sort(
      (a, b) => comparator(
        mapper(a[1], a[0], seq),
        mapper(b[1], b[0], seq)
      ) || a[0] - b[0]
    )).fromEntrySeq().valueSeq());
  }

  take(amount) {
    var seq = this;
    var takeSeq = takeFactory(seq, amount);
    if (takeSeq !== seq) {
      takeSeq.get = function (index, notSetValue) {
        index = wrapIndex(this, index);
        return index >= 0 && index < amount ? seq.get(index, notSetValue) : notSetValue;
      }
    }
    return reify(this, takeSeq);
  }


  // ### Internal

  __makeSequence() {
    return Object.create(LazyIndexedSequence.prototype);
  }

  __iterate(fn, reverse) {
    return iterate(this, fn, reverse, false);
  }

  __iterator(type, reverse) {
    return iterator(this, type, reverse, false);
  }
}

var IndexedIterablePrototype = IndexedIterable.prototype;
IndexedIterablePrototype[IS_INDEXED_SENTINEL] = true;



// #pragma Iterable static methods

function isIterable(maybeIterable) {
  return !!(maybeIterable && maybeIterable[IS_ITERABLE_SENTINEL]);
}

function isKeyed(maybeKeyed) {
  return !!(maybeKeyed && maybeKeyed[IS_KEYED_SENTINEL]);
}

function isIndexed(maybeIndexed) {
  return !!(maybeIndexed && maybeIndexed[IS_INDEXED_SENTINEL]);
}

function isAssociative(maybeAssociative) {
  return isKeyed(maybeAssociative) || isIndexed(maybeAssociative);
}

var EMPTY_SEQ;

function emptySequence() {
  return EMPTY_SEQ || (EMPTY_SEQ = new ArraySequence([]));
}

function iteratorFrom(iterLike/*[, mapFn[, context]]*/) {
  var iter = isIterable(iterLike) ? iterLike : seqFromValue(iterLike, false);
  if (arguments.length > 1) {
    iter = iter.map(
      arguments[1],
      arguments.length > 2 ? arguments[2] : undefined
    );
  }
  return iter;
}

Iterable.isIterable = isIterable;
Iterable.isKeyed = isKeyed;
Iterable.isIndexed = isIndexed;
Iterable.isAssociative = isAssociative;
Iterable.Keyed = KeyedIterable;
Iterable.Set = SetIterable;
Iterable.Indexed = IndexedIterable;



// #pragma LazySequence

function LazySequence(value) {
  return arguments.length === 0 ?
    emptySequence() :
    Iterable(value).toSeq();
}

class LazyKeyedSequence extends KeyedIterable {
  constructor(value) {
    return arguments.length === 0 ?
      emptySequence().toKeyedSeq() :
      KeyedIterable(value).toSeq();
  }

  static empty() {
    return LazyKeyedSequence();
  }

  static from(seqable/*[, mapFn[, context]]*/) {
    return LazyKeyedSequence(iteratorFrom.apply(this, arguments));
  }

  toKeyedSeq() {
    return this;
  }

  toSeq() {
    return this;
  }
}

class LazySetSequence extends SetIterable {
  constructor(value) {
    return arguments.length === 0 ?
      emptySequence().toSetSeq() :
      SetIterable(value).toSeq();
  }

  static empty() {
    return LazySetSequence();
  }

  static from(seqable/*[, mapFn[, context]]*/) {
    return LazySetSequence(iteratorFrom.apply(this, arguments));
  }

  toSetSeq() {
    return this;
  }

  toSeq() {
    return this;
  }
}

class LazyIndexedSequence extends IndexedIterable {
  constructor(value) {
    return arguments.length === 0 ?
      emptySequence() :
      IndexedIterable(value).toSeq();
  }

  static empty() {
    return LazyIndexedSequence();
  }

  static from(seqable/*[, mapFn[, context]]*/) {
    return LazyIndexedSequence(iteratorFrom.apply(this, arguments));
  }

  toIndexedSeq() {
    return this;
  }

  toSeq() {
    return this;
  }
}

LazySequence.from = function (value) {
  return iteratorFrom.apply(this, arguments).toSeq();
}

LazySequence.of =
LazyKeyedSequence.of =
LazySetSequence.of =
LazyIndexedSequence.of = function(/*...values*/) {
  return this.from(arguments);
};

LazySequence.empty = emptySequence;
LazySequence.isLazy = isLazy;
LazySequence.Keyed = LazyKeyedSequence;
LazySequence.Set = LazySetSequence;
LazySequence.Indexed = LazyIndexedSequence;

var IS_LAZY_SENTINEL = '@@__IMMUTABLE_LAZY__@@';

LazyKeyedSequence.prototype[IS_LAZY_SENTINEL] =
  LazySetSequence.prototype[IS_LAZY_SENTINEL] =
  LazyIndexedSequence.prototype[IS_LAZY_SENTINEL] = true;

function isLazy(maybeLazy) {
  return !!(maybeLazy && maybeLazy[IS_LAZY_SENTINEL]);
}



// #pragma Collections

class KeyedCollection extends KeyedIterable {
  constructor() {
    throw TypeError('Abstract');
  }

  static empty() {
    return this(emptySequence());
  }

  static from(seqable/*[, mapFn[, context]]*/) {
    return this(LazyKeyedSequence.from.apply(this, arguments));
  }
}

class SetCollection extends SetIterable {
  constructor() {
    throw TypeError('Abstract');
  }

  static empty() {
    return this(emptySequence());
  }

  static from(seqable/*[, mapFn[, context]]*/) {
    return this(LazySetSequence.from.apply(this, arguments));
  }
}

class IndexedCollection extends IndexedIterable {
  constructor() {
    throw TypeError('Abstract');
  }

  static empty() {
    return this(emptySequence());
  }

  static from(seqable/*[, mapFn[, context]]*/) {
    return this(LazyIndexedSequence.from.apply(this, arguments));
  }
}

KeyedCollection.of =
SetCollection.of =
IndexedCollection.of = LazySequence.of;



// #pragma Root Sequences

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



// #pragma Helper functions

function reify(kind, seq) {
  return isLazy(kind) ? seq : kind.constructor.from(seq);
}

function seqFromValue(value, maybeSingleton) {
  var seq =
    maybeSingleton && typeof value === 'string' ? new ArraySequence([value]) :
    isArrayLike(value) ? new ArraySequence(value) :
    isIterator(value) ? new IteratorSequence(value) :
    hasIterator(value) ? new IterableSequence(value) :
    (maybeSingleton ? isPlainObj(value) : typeof value === 'object') ? new ObjectSequence(value) :
    maybeSingleton ? new ArraySequence([value]) :
    null;
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

function wholeSlice(begin, end, size) {
  return (begin === 0 || (size != null && begin <= -size)) &&
    (end == null || (size != null && end >= size));
}

function resolveBegin(begin, size) {
  return resolveIndex(begin, size, 0);
}

function resolveEnd(end, size) {
  return resolveIndex(end, size, size);
}

function resolveIndex(index, size, defaultIndex) {
  return index == null ?
    defaultIndex :
    index < 0 ?
      Math.max(0, size + index) :
      size == null ?
        index :
        Math.min(size, index);
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
    if (seq.size == null) {
      seq.cacheResult();
    }
    return seq.size + index;
  }
  return index;
}

function resolveSize(indexedSeq) {
  if (indexedSeq.size == null) {
    indexedSeq.cacheResult();
  }
  assertNotInfinite(indexedSeq.size);
  return indexedSeq.size;
}

function assertNotInfinite(size) {
  invariant(
    size !== Infinity,
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



// #pragma LazySequence Factories

class ToIndexedSequence extends LazyIndexedSequence {
  constructor(seq) {
    this._seq = seq;
    this.size = seq.size;
  }

  contains(value) {
    return this._seq.contains(value);
  }

  cacheResult() {
    this._seq.cacheResult();
    this.size = this._seq.size;
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


class ToKeyedSequence extends LazyKeyedSequence {
  constructor(indexedSeq, useKeys) {
    this._seq = indexedSeq;
    this._useKeys = useKeys;
    this.size = indexedSeq.size;
  }

  get(key, notSetValue) {
    return this._seq.get(key, notSetValue);
  }

  has(key) {
    return this._seq.has(key);
  }

  valueSeq() {
    return this._seq.valueSeq();
  }

  reverse() {
    var reversedSequence = reverseFactory(this, true);
    if (!this._useKeys) {
      reversedSequence.valueSeq = () => this._seq.toSeq().reverse();
    }
    return reversedSequence;
  }

  map(mapper, context) {
    var mappedSequence = mapFactory(this, mapper, context);
    if (!this._useKeys) {
      mappedSequence.valueSeq = () => this._seq.toSeq().map(mapper, context);
    }
    return mappedSequence;
  }

  cacheResult() {
    this._seq.cacheResult();
    this.size = this._seq.size;
    return this;
  }

  __iterate(fn, reverse) {
    var ii;
    return this._seq.__iterate(
      this._useKeys ?
        (v, k) => fn(v, k, this) :
        ((ii = reverse ? resolveSize(this) : 0),
          v => fn(v, reverse ? --ii : ii++, this)),
      reverse
    );
  }

  __iterator(type, reverse) {
    if (this._useKeys) {
      return this._seq.__iterator(type, reverse);
    }
    var iterator = this._seq.__iterator(ITERATE_VALUES, reverse);
    var ii = reverse ? resolveSize(this) : 0;
    return new Iterator(() => {
      var step = iterator.next();
      return step.done ? step :
        iteratorValue(type, reverse ? --ii : ii++, step.value, step);
    });
  }
}


class ToSetSequence extends LazySetSequence {
  constructor(seq) {
    this._seq = seq;
    this.size = seq.size;
  }

  has(key) {
    return this._seq.contains(key);
  }

  cacheResult() {
    this._seq.cacheResult();
    this.size = this._seq.size;
    return this;
  }

  __iterate(fn, reverse) {
    return this._seq.__iterate(v => fn(v, v, this), reverse);
  }

  __iterator(type, reverse) {
    var iterator = this._seq.__iterator(ITERATE_VALUES, reverse);
    return new Iterator(() => {
      var step = iterator.next();
      return step.done ? step :
        iteratorValue(type, step.value, step.value, step);
    });
  }
}


class FromEntriesSequence extends LazyKeyedSequence {
  constructor(entriesSeq) {
    this._seq = entriesSeq;
    this.size = entriesSeq.size;
  }

  entrySeq() {
    return this._seq.toSeq();
  }

  cacheResult() {
    this._seq.cacheResult();
    this.size = this._seq.size;
    return this;
  }

  __iterate(fn, reverse) {
    return this._seq.__iterate(entry => {
      // Check if entry exists first so array access doesn't throw for holes
      // in the parent iteration.
      if (entry) {
        validateEntry(entry);
        return fn(entry[1], entry[0], this);
      }
    }, reverse);
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
          validateEntry(entry);
          return type === ITERATE_ENTRIES ? step :
            iteratorValue(type, entry[0], entry[1], step);
        }
      }
    });
  }
}

function validateEntry(entry) {
  if (entry !== Object(entry)) {
    throw new TypeError('Expected [K, V] tuple: ' + entry);
  }
}


function flipFactory(iterable) {
  var flipSequence = iterable.__makeSequence();
  flipSequence.size = iterable.size;
  flipSequence.flip = () => iterable.toSeq();
  flipSequence.reverse = function () {
    var seq = iterable.toSeq();
    var reversedSequence = seq.reverse.apply(this); // super.reverse()
    reversedSequence.flip = () => seq.reverse();
    return reversedSequence;
  };
  flipSequence.has = key => iterable.contains(key);
  flipSequence.contains = key => iterable.has(key);
  flipSequence.__iterateUncached = function (fn, reverse) {
    return iterable.__iterate((v, k) => fn(k, v, this) !== false, reverse);
  }
  flipSequence.__iteratorUncached = function(type, reverse) {
    if (type === ITERATE_ENTRIES) {
      var iterator = iterable.__iterator(type, reverse);
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
    return iterable.__iterator(
      type === ITERATE_VALUES ? ITERATE_KEYS : ITERATE_VALUES,
      reverse
    );
  }
  return flipSequence;
}

function mapFactory(iterable, mapper, context) {
  var mappedSequence = iterable.__makeSequence();
  mappedSequence.size = iterable.size;
  mappedSequence.has = key => iterable.has(key);
  mappedSequence.get = (key, notSetValue) => {
    var v = iterable.get(key, NOT_SET);
    return v === NOT_SET ?
      notSetValue :
      mapper.call(context, v, key, iterable);
  };
  mappedSequence.__iterateUncached = function (fn, reverse) {
    return iterable.__iterate(
      (v, k, c) => fn(mapper.call(context, v, k, c), k, this) !== false,
      reverse
    );
  }
  mappedSequence.__iteratorUncached = function (type, reverse) {
    var iterator = iterable.__iterator(ITERATE_ENTRIES, reverse);
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
        mapper.call(context, entry[1], key, iterable),
        step
      );
    });
  }
  return mappedSequence;
}

function reverseFactory(iterable, useKeys) {
  var reversedSequence = iterable.__makeSequence();
  reversedSequence.size = iterable.size;
  reversedSequence.reverse = () => iterable.toSeq();
  reversedSequence.flip = function () {
    var seq = iterable.toSeq();
    var flipSequence = seq.flip.apply(this); // super.flip()
    flipSequence.reverse = () => seq.flip();
    return flipSequence;
  };
  reversedSequence.get = (key, notSetValue) =>
    iterable.get(useKeys ? key : -1 - key, notSetValue);
  reversedSequence.has = key =>
    iterable.has(useKeys ? key : -1 - key);
  reversedSequence.contains = value => iterable.contains(value);
  reversedSequence.cacheResult = function () {
    iterable.cacheResult(); // iterable is a Seq
    this.size = iterable.size;
    return this;
  };
  reversedSequence.__iterate = function (fn, reverse) {
    return iterable.__iterate((v, k) => fn(v, k, this), !reverse);
  };
  reversedSequence.__iterator =
    (type, reverse) => iterable.__iterator(type, !reverse);
  return reversedSequence;
}

function filterFactory(iterable, predicate, context, useKeys) {
  var filterSequence = iterable.__makeSequence();
  if (useKeys) {
    filterSequence.has = key => {
      var v = iterable.get(key, NOT_SET);
      return v !== NOT_SET && !!predicate.call(context, v, key, iterable);
    };
    filterSequence.get = (key, notSetValue) => {
      var v = iterable.get(key, NOT_SET);
      return v !== NOT_SET && predicate.call(context, v, key, iterable) ?
        v : notSetValue;
    };
  }
  filterSequence.__iterateUncached = function (fn, reverse) {
    var iterations = 0;
    iterable.__iterate((v, k, c) => {
      if (predicate.call(context, v, k, c)) {
        iterations++;
        return fn(v, useKeys ? k : iterations - 1, this);
      }
    }, reverse);
    return iterations;
  };
  filterSequence.__iteratorUncached = function (type, reverse) {
    var iterator = iterable.__iterator(ITERATE_ENTRIES, reverse);
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
        if (predicate.call(context, value, key, iterable)) {
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
  return IndexedIterable(groups).fromEntrySeq().map(useKeys ?
    group => IndexedIterable(group).fromEntrySeq() :
    group => IndexedIterable(group)
  );
}

function takeFactory(iterable, amount) {
  if (amount > iterable.size) {
    return iterable;
  }
  if (amount < 0) {
    amount = 0;
  }
  var takeSequence = iterable.__makeSequence();
  takeSequence.size = iterable.size && Math.min(iterable.size, amount);
  takeSequence.__iterateUncached = function(fn, reverse) {
    if (amount === 0) {
      return 0;
    }
    if (reverse) {
      return this.cacheResult().__iterate(fn, reverse);
    }
    var iterations = 0;
    iterable.__iterate((v, k) =>
      ++iterations && fn(v, k, this) !== false && iterations < amount
    );
    return iterations;
  };
  takeSequence.__iteratorUncached = function(type, reverse) {
    if (reverse) {
      return this.cacheResult().__iterator(type, reverse);
    }
    // Don't bother instantiating parent iterator if taking 0.
    var iterator = amount && iterable.__iterator(type, reverse);
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

function takeWhileFactory(iterable, predicate, context) {
  var takeSequence = iterable.__makeSequence();
  takeSequence.__iterateUncached = function(fn, reverse) {
    if (reverse) {
      return this.cacheResult().__iterate(fn, reverse);
    }
    var iterations = 0;
    iterable.__iterate((v, k, c) =>
      predicate.call(context, v, k, c) && ++iterations && fn(v, k, this)
    );
    return iterations;
  };
  takeSequence.__iteratorUncached = function(type, reverse) {
    if (reverse) {
      return this.cacheResult().__iterator(type, reverse);
    }
    var iterator = iterable.__iterator(ITERATE_ENTRIES, reverse);
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

function skipFactory(iterable, amount, useKeys) {
  if (amount <= 0) {
    return iterable;
  }
  var skipSequence = iterable.__makeSequence();
  skipSequence.size = iterable.size && Math.max(0, iterable.size - amount);
  skipSequence.__iterateUncached = function (fn, reverse) {
    if (reverse) {
      return this.cacheResult().__iterate(fn, reverse);
    }
    var skipped = 0;
    var isSkipping = true;
    var iterations = 0;
    iterable.__iterate((v, k) => {
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
    var iterator = amount && iterable.__iterator(type, reverse);
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

function skipWhileFactory(iterable, predicate, context, useKeys) {
  var skipSequence = iterable.__makeSequence();
  skipSequence.__iterateUncached = function (fn, reverse) {
    if (reverse) {
      return this.cacheResult().__iterate(fn, reverse);
    }
    var isSkipping = true;
    var iterations = 0;
    iterable.__iterate((v, k, c) => {
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
    var iterator = iterable.__iterator(ITERATE_ENTRIES, reverse);
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

function concatFactory(iterable, values, useKeys) {
  var iterables = [iterable].concat(values);
  var concatSequence = LazyIndexedSequence(iterables);
  if (useKeys) {
    concatSequence = concatSequence.toKeyedSeq();
  }
  concatSequence = concatSequence.flatMap(valueMapper);
  concatSequence.size = iterables.reduce(
    (sum, seq) => {
      if (sum !== undefined) {
        var size = Iterable(seq).size;
        if (size != null) {
          return sum + size;
        }
      }
    },
    0
  );
  return concatSequence;
}

function flattenFactory(iterable, depth, useKeys) {
  var flatSequence = iterable.__makeSequence();
  flatSequence.__iterateUncached = function(fn, reverse) {
    var iterations = 0;
    var stopped = false;
    function flatDeep(seq, currentDepth) {
      seq.__iterate((v, k) => {
        if ((!depth || currentDepth < depth) && isIterable(v)) {
          flatDeep(v, currentDepth + 1);
        } else if (fn(v, useKeys ? k : iterations++, this) === false) {
          stopped = true;
        }
        return !stopped;
      }, reverse);
    }
    flatDeep(iterable, 0);
    return iterations;
  }
  flatSequence.__iteratorUncached = function(type, reverse) {
    var iterator = iterable.__iterator(type, reverse);
    var stack = [];
    var iterations = 0;
    return new Iterator(() => {
      while (iterator) {
        var step = iterator.next();
        if (step.done !== false) {
          iterator = stack.pop();
          continue;
        }
        var v = step.value;
        if (type === ITERATE_ENTRIES) {
          v = v[1];
        }
        if ((!depth || stack.length < depth) && isIterable(v)) {
          stack.push(iterator);
          iterator = v.__iterator(type, reverse);
        } else {
          return useKeys ? step : iteratorValue(type, iterations++, v, step);
        }
      }
      return iteratorDone();
    });
  }
  return flatSequence;
}

function interposeFactory(iterable, separator) {
  var interposedSequence = iterable.__makeSequence();
  interposedSequence.size = iterable.size && iterable.size * 2 -1;
  interposedSequence.__iterateUncached = function(fn, reverse) {
    var iterations = 0;
    iterable.__iterate((v, k) =>
      (!iterations || fn(separator, iterations++, this) !== false) &&
      fn(v, iterations++, this) !== false,
      reverse
    );
    return iterations;
  };
  interposedSequence.__iteratorUncached = function(type, reverse) {
    var iterator = iterable.__iterator(ITERATE_VALUES, reverse);
    var iterations = 0;
    var step;
    return new Iterator(() => {
      if (!step || iterations % 2) {
        step = iterator.next();
        if (step.done) {
          return step;
        }
      }
      return iterations % 2 ?
        iteratorValue(type, iterations++, separator) :
        iteratorValue(type, iterations++, step.value, step);
    });
  };
  return interposedSequence;
}
