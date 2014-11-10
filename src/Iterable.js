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
/* global Map, OrderedMap, List, Set, OrderedSet, Stack,
          is,
          arrCopy, NOT_SET, assertNotInfinite, ensureSize, wrapIndex,
          returnTrue, wholeSlice, resolveBegin, resolveEnd,
          hash, HASH_MAX_VAL,
          Iterator,
          ITERATOR_SYMBOL, ITERATE_KEYS, ITERATE_VALUES, ITERATE_ENTRIES,
          isSeq,
          Seq, KeyedSeq, IndexedSeq, SetSeq,
          ArraySeq,
          reify, ToKeyedSequence, ToIndexedSequence, ToSetSequence,
          FromEntriesSequence, flipFactory, mapFactory, reverseFactory,
          filterFactory, countByFactory, groupByFactory, takeFactory,
          takeWhileFactory, skipFactory, skipWhileFactory, concatFactory,
          flattenFactory, flatMapFactory, interposeFactory, sortFactory,
          maxFactory */
/* exported Iterable,
            isIterable, isKeyed, isIndexed, isAssociative,
            Collection, KeyedCollection, IndexedCollection, SetCollection */


class Iterable {

  constructor(value) {
    return isIterable(value) ? value : Seq(value);
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

  toOrderedSet() {
    // Use Late Binding here to solve the circular dependency.
    assertNotInfinite(this.size);
    return OrderedSet(isKeyed(this) ? this.valueSeq() : this);
  }

  toSet() {
    // Use Late Binding here to solve the circular dependency.
    assertNotInfinite(this.size);
    return Set(isKeyed(this) ? this.valueSeq() : this);
  }

  toSetSeq() {
    return new ToSetSequence(this);
  }

  toSeq() {
    return isIndexed(this) ? this.toIndexedSeq() :
      isKeyed(this) ? this.toKeyedSeq() :
      this.toSetSeq();
  }

  toStack() {
    // Use Late Binding here to solve the circular dependency.
    assertNotInfinite(this.size);
    return Stack(isKeyed(this) ? this.valueSeq() : this);
  }

  toList() {
    // Use Late Binding here to solve the circular dependency.
    assertNotInfinite(this.size);
    return List(isKeyed(this) ? this.valueSeq() : this);
  }


  // ### Common JavaScript methods and properties

  toString() {
    return '[Iterable]';
  }

  __toString(head, tail) {
    if (this.size === 0) {
      return head + tail;
    }
    return head + ' ' + this.toSeq().map(this.__toStringMapper).join(', ') + ' ' + tail;
  }


  // ### ES6 Collection methods (ES6 Array and Map)

  concat(...values) {
    return reify(this, concatFactory(this, values));
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
    return reify(this, sortFactory(this, comparator));
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
    return countByFactory(this, grouper, context);
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
      return new ArraySeq(iterable._cache);
    }
    var entriesSequence = iterable.toSeq().map(entryMapper).toIndexedSeq();
    entriesSequence.fromEntrySeq = () => iterable.toSeq();
    return entriesSequence;
  }

  filterNot(predicate, context) {
    return this.filter(not(predicate), context);
  }

  findLast(predicate, context, notSetValue) {
    return this.toKeyedSeq().reverse().find(predicate, context, notSetValue);
  }

  first() {
    return this.find(returnTrue);
  }

  flatMap(mapper, context) {
    return reify(this, flatMapFactory(this, mapper, context));
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
    return groupByFactory(this, grouper, context);
  }

  has(searchKey) {
    return this.get(searchKey, NOT_SET) !== NOT_SET;
  }

  isSubset(iter) {
    iter = typeof iter.contains === 'function' ? iter : Iterable(iter);
    return this.every(value => iter.contains(value));
  }

  isSuperset(iter) {
    return iter.isSubset(this);
  }

  keySeq() {
    return this.toSeq().map(keyMapper).toIndexedSeq();
  }

  last() {
    return this.toSeq().reverse().first();
  }

  max(comparator) {
    return maxFactory(this, comparator);
  }

  maxBy(mapper, comparator) {
    return maxFactory(this, comparator, mapper);
  }

  min(comparator) {
    return maxFactory(this, comparator ? neg(comparator) : defaultNegComparator);
  }

  minBy(mapper, comparator) {
    return maxFactory(this, comparator ? neg(comparator) : defaultNegComparator, mapper);
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
    return reify(this, sortFactory(this, comparator, mapper));
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
        if (!Iterable.noLengthWarning) {
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
      }
    });
  } catch (e) {}
})();



class KeyedIterable extends Iterable {

  constructor(value) {
    return isKeyed(value) ? value : KeyedSeq(value);
  }


  // ### More sequential methods

  flip() {
    return reify(this, flipFactory(this));
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

  findLastKey(predicate, context) {
    return this.toSeq().reverse().findKey(predicate, context);
  }

  keyOf(searchValue) {
    return this.findKey(value => is(value, searchValue));
  }

  lastKeyOf(searchValue) {
    return this.toSeq().reverse().keyOf(searchValue);
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



class IndexedIterable extends Iterable {

  constructor(value) {
    return isIndexed(value) ? value : IndexedSeq(value);
  }


  // ### Conversion to other types

  toKeyedSeq() {
    return new ToKeyedSequence(this, false);
  }


  // ### ES6 Collection methods (ES6 Array and Map)

  filter(predicate, context) {
    return reify(this, filterFactory(this, predicate, context, false));
  }

  findIndex(predicate, context) {
    var key = this.toKeyedSeq().findKey(predicate, context);
    return key === undefined ? -1 : key;
  }

  indexOf(searchValue) {
    var key = this.toKeyedSeq().keyOf(searchValue);
    return key === undefined ? -1 : key;
  }

  lastIndexOf(searchValue) {
    var key = this.toKeyedSeq().lastKeyOf(searchValue);
    return key === undefined ? -1 : key;
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


  // ### More collection methods

  findLastIndex(predicate, context) {
    var key = this.toKeyedSeq().findLastKey(predicate, context);
    return key === undefined ? -1 : key;
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
    var iter = this;
    var skipSeq = skipFactory(iter, amount, false);
    if (isSeq(iter) && skipSeq !== iter) {
      skipSeq.get = function (index, notSetValue) {
        index = wrapIndex(this, index);
        return index >= 0 ? iter.get(index + amount, notSetValue) : notSetValue;
      }
    }
    return reify(this, skipSeq);
  }

  skipWhile(predicate, context) {
    return reify(this, skipWhileFactory(this, predicate, context, false));
  }

  take(amount) {
    var iter = this;
    var takeSeq = takeFactory(iter, amount);
    if (isSeq(iter) && takeSeq !== iter) {
      takeSeq.get = function (index, notSetValue) {
        index = wrapIndex(this, index);
        return index >= 0 && index < amount ? iter.get(index, notSetValue) : notSetValue;
      }
    }
    return reify(this, takeSeq);
  }
}

IndexedIterable.prototype[IS_INDEXED_SENTINEL] = true;



class SetIterable extends Iterable {

  constructor(value) {
    return isIterable(value) && !isAssociative(value) ? value : SetSeq(value);
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
Iterable.Indexed = IndexedIterable;
Iterable.Set = SetIterable;
Iterable.Iterator = Iterator;



// #pragma Helper functions

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

function neg(predicate) {
  return function() {
    return -predicate.apply(this, arguments);
  }
}

function quoteString(value) {
  return typeof value === 'string' ? JSON.stringify(value) : value;
}

function defaultNegComparator(a, b) {
  return a > b ? -1 : a < b ? 1 : 0;
}
