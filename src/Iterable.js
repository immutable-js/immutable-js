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
import "Hash"
import "Iterator"
/* global Map, OrderedMap, Vector, Set, Stack,
          is,
          arrCopy, NOT_SET, assertNotInfinite, ensureSize, wrapIndex,
          returnTrue, wholeSlice, resolveBegin, resolveEnd,
          hash, HASH_MAX_VAL,
          Iterator,
          ITERATOR_SYMBOL, ITERATE_KEYS, ITERATE_VALUES, ITERATE_ENTRIES,
          isLazy,
          LazySequence, LazyKeyedSequence, LazySetSequence, LazyIndexedSequence,
          ArraySequence,
          ToIndexedSequence, ToKeyedSequence, ToSetSequence,
          FromEntriesSequence, flipFactory, mapFactory, reverseFactory,
          filterFactory, groupByFactory, takeFactory, takeWhileFactory,
          skipFactory, skipWhileFactory, concatFactory, flattenFactory,
          interposeFactory */
/* exported Iterable,
            isIterable, isKeyed, isIndexed, isAssociative,
            Collection, KeyedCollection, SetCollection, IndexedCollection */


class Iterable {

  constructor(value) {
    return isIterable(value) ? value :
      LazySequence.apply(undefined, arguments);
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
    return Map(this.toKeyedSeq());
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
    return OrderedMap(this.toKeyedSeq());
  }

  toSet() {
    // Use Late Binding here to solve the circular dependency.
    assertNotInfinite(this.size);
    return Set(this);
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
    return Stack(this);
  }

  toVector() {
    // Use Late Binding here to solve the circular dependency.
    assertNotInfinite(this.size);
    return Vector(this);
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
    return reify(this, concatFactory(this, values, true));
  }

  contains(searchValue) {
    return this.some(value => is(value, searchValue));
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
      joined += v !== null && v !== undefined ? v : '';
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
      return this.toSeq().cacheResult().slice(begin, end);
    }
    var skipped = resolvedBegin === 0 ? this : this.skip(resolvedBegin);
    return reify(
      this,
      resolvedEnd === undefined || resolvedEnd === this.size ?
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
    return ensureSize(
      predicate ? this.toSeq().filter(predicate, context) : this
    );
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
    return new ArraySequence(groups).fromEntrySeq();
  }

  equals(other) {
    if (this === other) {
      return true;
    }
    if (!other || typeof other.equals !== 'function') {
      return false;
    }
    if (this.size !== undefined && other.size !== undefined) {
      if (this.size !== other.size) {
        return false;
      }
      if (this.size === 0 && other.size === 0) {
        return true;
      }
    }
    if (this.__hash !== undefined && other.__hash !== undefined &&
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
      return new ArraySequence(iterable._cache);
    }
    var entriesSequence = iterable.toSeq().map(entryMapper).toIndexedSeq();
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
    var coerce = iterableClass(this);
    return reify(this,
      this.toSeq().map(
        (v, k) => coerce(mapper.call(context, v, k, this))
      ).flatten(true)
    );
  }

  flatten(depth) {
    return reify(this, flattenFactory(this, depth, true));
  }

  fromEntrySeq() {
    return new FromEntriesSequence(this);
  }

  get(searchKey, notSetValue) {
    return this.find((_, key) => is(key, searchKey), undefined, notSetValue);
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
    return this.toSeq().map(keyMapper).toIndexedSeq();
  }

  last() {
    return this.toSeq().reverse().first();
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
    return reify(this, new ArraySequence(seq.entrySeq().entrySeq().toArray().sort(
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


  // ### Hashable Object

  hashCode() {
    return this.__hash || (this.__hash =
      this.size === Infinity ? 0 : this.reduce(
        (h, v, k) => (h + (hash(v) ^ (v === k ? 0 : hash(k)))) & HASH_MAX_VAL, 0
    ));
  }


  // ### Internal

  // abstract __iterate(fn, reverse)

  // abstract __iterator(type, reverse)
}

var IS_ITERABLE_SENTINEL = '@@__IMMUTABLE_ITERABLE__@@';
var IS_KEYED_SENTINEL = '@@__IMMUTABLE_KEYED__@@';
var IS_INDEXED_SENTINEL = '@@__IMMUTABLE_INDEXED__@@';

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

  constructor(value) {
    return isKeyed(value) ? value :
      LazyKeyedSequence.apply(undefined, arguments);
  }


  // ### More sequential methods

  flip() {
    return reify(this, flipFactory(this));
  }

  mapEntries(mapper, context) {
    var iterations = 0;
    return reify(this,
      this.toSeq().map(
        (v, k) => mapper.call(context, [k, v], iterations++, this)
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
}

var KeyedIterablePrototype = KeyedIterable.prototype;
KeyedIterablePrototype[IS_KEYED_SENTINEL] = true;
KeyedIterablePrototype[ITERATOR_SYMBOL] = IterablePrototype.entries;
KeyedIterablePrototype.__toJS = IterablePrototype.toObject;
KeyedIterablePrototype.__toStringMapper = (v, k) => k + ': ' + quoteString(v);



class SetIterable extends Iterable {

  constructor(value) {
    return isIterable(value) && !isAssociative(value) ? value :
      LazySetSequence.apply(undefined, arguments);
  }


  // ### ES6 Collection methods (ES6 Array and Map)

  get(value, notSetValue) {
    return this.has(value) ? value : notSetValue;
  }

  contains(value) {
    return this.has(value);
  }


  // ### More sequential methods

  keySeq() {
    return this.valueSeq();
  }
}

SetIterable.prototype.has = IterablePrototype.contains;



class IndexedIterable extends Iterable {

  constructor(value) {
    return isIndexed(value) ? value :
      LazyIndexedSequence.apply(undefined, arguments);
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
    return key === undefined ? -1 : key;
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

  get(index, notSetValue) {
    index = wrapIndex(this, index);
    return (index < 0 || (this.size === Infinity ||
        (this.size !== undefined && index > this.size))) ?
      notSetValue :
      this.find((_, key) => key === index, undefined, notSetValue);
  }

  groupBy(grouper, context) {
    return groupByFactory(this, grouper, context, false);
  }

  has(index) {
    index = wrapIndex(this, index);
    return index >= 0 && (this.size !== undefined ?
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
    return reify(this, new ArraySequence(this.entrySeq().toArray().sort(
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
}

IndexedIterable.prototype[IS_INDEXED_SENTINEL] = true;



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

Iterable.isIterable = isIterable;
Iterable.isKeyed = isKeyed;
Iterable.isIndexed = isIndexed;
Iterable.isAssociative = isAssociative;
Iterable.Keyed = KeyedIterable;
Iterable.Set = SetIterable;
Iterable.Indexed = IndexedIterable;
Iterable.Iterator = Iterator;



// #pragma Helper functions

function reify(kind, seq) {
  return isLazy(kind) ? seq : kind.constructor(seq);
}

function valueMapper(v) {
  return v;
}

function keyMapper(v, k) {
  return k;
}

function entryMapper(v, k) {
  return [k, v];
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

function iterableClass(iterable) {
  return isKeyed(iterable) ? KeyedIterable :
    isIndexed(iterable) ? IndexedIterable :
    SetIterable;
}
