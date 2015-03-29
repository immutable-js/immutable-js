/**
 *  Copyright (c) 2014-2015, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

import { Iterable, KeyedIterable, IndexedIterable, SetIterable,
         isIterable, isKeyed, isIndexed, isAssociative, isOrdered,
         IS_ITERABLE_SENTINEL, IS_KEYED_SENTINEL, IS_INDEXED_SENTINEL, IS_ORDERED_SENTINEL } from './Iterable'

import { is } from './is'
import { arrCopy, NOT_SET, ensureSize, wrapIndex,
         returnTrue, resolveBegin } from './TrieUtils'
import { hash } from './Hash'
import { imul, smi } from './Math'
import { Iterator,
         ITERATOR_SYMBOL, ITERATE_KEYS, ITERATE_VALUES, ITERATE_ENTRIES } from './Iterator'

import assertNotInfinite from './utils/assertNotInfinite'
import forceIterator from './utils/forceIterator'
import deepEqual from './utils/deepEqual'
import mixin from './utils/mixin'

import { Map } from './Map'
import { OrderedMap } from './OrderedMap'
import { List } from './List'
import { Set } from './Set'
import { OrderedSet } from './OrderedSet'
import { Stack } from './Stack'
import { KeyedSeq, IndexedSeq, SetSeq, ArraySeq } from './Seq'
import { KeyedCollection, IndexedCollection, SetCollection } from './Collection'
import { reify, ToKeyedSequence, ToIndexedSequence, ToSetSequence,
          FromEntriesSequence, flipFactory, mapFactory, reverseFactory,
          filterFactory, countByFactory, groupByFactory, sliceFactory,
          takeWhileFactory, skipWhileFactory, concatFactory,
          flattenFactory, flatMapFactory, interposeFactory, sortFactory,
          maxFactory, zipWithFactory } from './Operations'

export { Iterable, KeyedIterable, IndexedIterable, SetIterable,
         isIterable, isKeyed, isIndexed, isAssociative, isOrdered, IS_ORDERED_SENTINEL }


Iterable.Iterator = Iterator;

mixin(Iterable, {

  // ### Conversion to other types

  toArray() {
    assertNotInfinite(this.size);
    var array = new Array(this.size || 0);
    this.valueSeq().__iterate((v, i) => { array[i] = v; });
    return array;
  },

  toIndexedSeq() {
    return new ToIndexedSequence(this);
  },

  toJS() {
    return this.toSeq().map(
      value => value && typeof value.toJS === 'function' ? value.toJS() : value
    ).__toJS();
  },

  toJSON() {
    return this.toSeq().map(
      value => value && typeof value.toJSON === 'function' ? value.toJSON() : value
    ).__toJS();
  },

  toKeyedSeq() {
    return new ToKeyedSequence(this, true);
  },

  toMap() {
    // Use Late Binding here to solve the circular dependency.
    return Map(this.toKeyedSeq());
  },

  toObject() {
    assertNotInfinite(this.size);
    var object = {};
    this.__iterate((v, k) => { object[k] = v; });
    return object;
  },

  toOrderedMap() {
    // Use Late Binding here to solve the circular dependency.
    return OrderedMap(this.toKeyedSeq());
  },

  toOrderedSet() {
    // Use Late Binding here to solve the circular dependency.
    return OrderedSet(isKeyed(this) ? this.valueSeq() : this);
  },

  toSet() {
    // Use Late Binding here to solve the circular dependency.
    return Set(isKeyed(this) ? this.valueSeq() : this);
  },

  toSetSeq() {
    return new ToSetSequence(this);
  },

  toSeq() {
    return isIndexed(this) ? this.toIndexedSeq() :
      isKeyed(this) ? this.toKeyedSeq() :
      this.toSetSeq();
  },

  toStack() {
    // Use Late Binding here to solve the circular dependency.
    return Stack(isKeyed(this) ? this.valueSeq() : this);
  },

  toList() {
    // Use Late Binding here to solve the circular dependency.
    return List(isKeyed(this) ? this.valueSeq() : this);
  },


  // ### Common JavaScript methods and properties

  toString() {
    return '[Iterable]';
  },

  __toString(head, tail) {
    if (this.size === 0) {
      return head + tail;
    }
    return head + ' ' + this.toSeq().map(this.__toStringMapper).join(', ') + ' ' + tail;
  },


  // ### ES6 Collection methods (ES6 Array and Map)

  concat(...values) {
    return reify(this, concatFactory(this, values));
  },

  contains(searchValue) {
    return this.includes(searchValue);
  },

  includes(searchValue) {
    return this.some(value => is(value, searchValue));
  },

  entries() {
    return this.__iterator(ITERATE_ENTRIES);
  },

  every(predicate, context) {
    assertNotInfinite(this.size);
    var returnValue = true;
    this.__iterate((v, k, c) => {
      if (!predicate.call(context, v, k, c)) {
        returnValue = false;
        return false;
      }
    });
    return returnValue;
  },

  filter(predicate, context) {
    return reify(this, filterFactory(this, predicate, context, true));
  },

  find(predicate, context, notSetValue) {
    var entry = this.findEntry(predicate, context);
    return entry ? entry[1] : notSetValue;
  },

  findEntry(predicate, context) {
    var found;
    this.__iterate((v, k, c) => {
      if (predicate.call(context, v, k, c)) {
        found = [k, v];
        return false;
      }
    });
    return found;
  },

  findLastEntry(predicate, context) {
    return this.toSeq().reverse().findEntry(predicate, context);
  },

  forEach(sideEffect, context) {
    assertNotInfinite(this.size);
    return this.__iterate(context ? sideEffect.bind(context) : sideEffect);
  },

  join(separator) {
    assertNotInfinite(this.size);
    separator = separator !== undefined ? '' + separator : ',';
    var joined = '';
    var isFirst = true;
    this.__iterate(v => {
      isFirst ? (isFirst = false) : (joined += separator);
      joined += v !== null && v !== undefined ? v.toString() : '';
    });
    return joined;
  },

  keys() {
    return this.__iterator(ITERATE_KEYS);
  },

  map(mapper, context) {
    return reify(this, mapFactory(this, mapper, context));
  },

  reduce(reducer, initialReduction, context) {
    assertNotInfinite(this.size);
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
  },

  reduceRight(reducer, initialReduction, context) {
    var reversed = this.toKeyedSeq().reverse();
    return reversed.reduce.apply(reversed, arguments);
  },

  reverse() {
    return reify(this, reverseFactory(this, true));
  },

  slice(begin, end) {
    return reify(this, sliceFactory(this, begin, end, true));
  },

  some(predicate, context) {
    return !this.every(not(predicate), context);
  },

  sort(comparator) {
    return reify(this, sortFactory(this, comparator));
  },

  values() {
    return this.__iterator(ITERATE_VALUES);
  },


  // ### More sequential methods

  butLast() {
    return this.slice(0, -1);
  },

  isEmpty() {
    return this.size !== undefined ? this.size === 0 : !this.some(() => true);
  },

  count(predicate, context) {
    return ensureSize(
      predicate ? this.toSeq().filter(predicate, context) : this
    );
  },

  countBy(grouper, context) {
    return countByFactory(this, grouper, context);
  },

  equals(other) {
    return deepEqual(this, other);
  },

  entrySeq() {
    var iterable = this;
    if (iterable._cache) {
      // We cache as an entries array, so we can just return the cache!
      return new ArraySeq(iterable._cache);
    }
    var entriesSequence = iterable.toSeq().map(entryMapper).toIndexedSeq();
    entriesSequence.fromEntrySeq = () => iterable.toSeq();
    return entriesSequence;
  },

  filterNot(predicate, context) {
    return this.filter(not(predicate), context);
  },

  findLast(predicate, context, notSetValue) {
    return this.toKeyedSeq().reverse().find(predicate, context, notSetValue);
  },

  first() {
    return this.find(returnTrue);
  },

  flatMap(mapper, context) {
    return reify(this, flatMapFactory(this, mapper, context));
  },

  flatten(depth) {
    return reify(this, flattenFactory(this, depth, true));
  },

  fromEntrySeq() {
    return new FromEntriesSequence(this);
  },

  get(searchKey, notSetValue) {
    return this.find((_, key) => is(key, searchKey), undefined, notSetValue);
  },

  getIn(searchKeyPath, notSetValue) {
    var nested = this;
    // Note: in an ES6 environment, we would prefer:
    // for (var key of searchKeyPath) {
    var iter = forceIterator(searchKeyPath);
    var step;
    while (!(step = iter.next()).done) {
      var key = step.value;
      nested = nested && nested.get ? nested.get(key, NOT_SET) : NOT_SET;
      if (nested === NOT_SET) {
        return notSetValue;
      }
    }
    return nested;
  },

  groupBy(grouper, context) {
    return groupByFactory(this, grouper, context);
  },

  has(searchKey) {
    return this.get(searchKey, NOT_SET) !== NOT_SET;
  },

  hasIn(searchKeyPath) {
    return this.getIn(searchKeyPath, NOT_SET) !== NOT_SET;
  },

  isSubset(iter) {
    iter = typeof iter.includes === 'function' ? iter : Iterable(iter);
    return this.every(value => iter.includes(value));
  },

  isSuperset(iter) {
    return iter.isSubset(this);
  },

  keySeq() {
    return this.toSeq().map(keyMapper).toIndexedSeq();
  },

  last() {
    return this.toSeq().reverse().first();
  },

  max(comparator) {
    return maxFactory(this, comparator);
  },

  maxBy(mapper, comparator) {
    return maxFactory(this, comparator, mapper);
  },

  min(comparator) {
    return maxFactory(this, comparator ? neg(comparator) : defaultNegComparator);
  },

  minBy(mapper, comparator) {
    return maxFactory(this, comparator ? neg(comparator) : defaultNegComparator, mapper);
  },

  rest() {
    return this.slice(1);
  },

  skip(amount) {
    return this.slice(Math.max(0, amount));
  },

  skipLast(amount) {
    return reify(this, this.toSeq().reverse().skip(amount).reverse());
  },

  skipWhile(predicate, context) {
    return reify(this, skipWhileFactory(this, predicate, context, true));
  },

  skipUntil(predicate, context) {
    return this.skipWhile(not(predicate), context);
  },

  sortBy(mapper, comparator) {
    return reify(this, sortFactory(this, comparator, mapper));
  },

  take(amount) {
    return this.slice(0, Math.max(0, amount));
  },

  takeLast(amount) {
    return reify(this, this.toSeq().reverse().take(amount).reverse());
  },

  takeWhile(predicate, context) {
    return reify(this, takeWhileFactory(this, predicate, context));
  },

  takeUntil(predicate, context) {
    return this.takeWhile(not(predicate), context);
  },

  valueSeq() {
    return this.toIndexedSeq();
  },


  // ### Hashable Object

  hashCode() {
    return this.__hash || (this.__hash = hashIterable(this));
  },


  // ### Internal

  // abstract __iterate(fn, reverse)

  // abstract __iterator(type, reverse)
});

// var IS_ITERABLE_SENTINEL = '@@__IMMUTABLE_ITERABLE__@@';
// var IS_KEYED_SENTINEL = '@@__IMMUTABLE_KEYED__@@';
// var IS_INDEXED_SENTINEL = '@@__IMMUTABLE_INDEXED__@@';
// var IS_ORDERED_SENTINEL = '@@__IMMUTABLE_ORDERED__@@';

var IterablePrototype = Iterable.prototype;
IterablePrototype[IS_ITERABLE_SENTINEL] = true;
IterablePrototype[ITERATOR_SYMBOL] = IterablePrototype.values;
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



mixin(KeyedIterable, {

  // ### More sequential methods

  flip() {
    return reify(this, flipFactory(this));
  },

  findKey(predicate, context) {
    var entry = this.findEntry(predicate, context);
    return entry && entry[0];
  },

  findLastKey(predicate, context) {
    return this.toSeq().reverse().findKey(predicate, context);
  },

  keyOf(searchValue) {
    return this.findKey(value => is(value, searchValue));
  },

  lastKeyOf(searchValue) {
    return this.findLastKey(value => is(value, searchValue));
  },

  mapEntries(mapper, context) {
    var iterations = 0;
    return reify(this,
      this.toSeq().map(
        (v, k) => mapper.call(context, [k, v], iterations++, this)
      ).fromEntrySeq()
    );
  },

  mapKeys(mapper, context) {
    return reify(this,
      this.toSeq().flip().map(
        (k, v) => mapper.call(context, k, v, this)
      ).flip()
    );
  },

});

var KeyedIterablePrototype = KeyedIterable.prototype;
KeyedIterablePrototype[IS_KEYED_SENTINEL] = true;
KeyedIterablePrototype[ITERATOR_SYMBOL] = IterablePrototype.entries;
KeyedIterablePrototype.__toJS = IterablePrototype.toObject;
KeyedIterablePrototype.__toStringMapper = (v, k) => JSON.stringify(k) + ': ' + quoteString(v);



mixin(IndexedIterable, {

  // ### Conversion to other types

  toKeyedSeq() {
    return new ToKeyedSequence(this, false);
  },


  // ### ES6 Collection methods (ES6 Array and Map)

  filter(predicate, context) {
    return reify(this, filterFactory(this, predicate, context, false));
  },

  findIndex(predicate, context) {
    var entry = this.findEntry(predicate, context);
    return entry ? entry[0] : -1;
  },

  indexOf(searchValue) {
    var key = this.toKeyedSeq().keyOf(searchValue);
    return key === undefined ? -1 : key;
  },

  lastIndexOf(searchValue) {
    return this.toSeq().reverse().indexOf(searchValue);
  },

  reverse() {
    return reify(this, reverseFactory(this, false));
  },

  slice(begin, end) {
    return reify(this, sliceFactory(this, begin, end, false));
  },

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
  },


  // ### More collection methods

  findLastIndex(predicate, context) {
    var key = this.toKeyedSeq().findLastKey(predicate, context);
    return key === undefined ? -1 : key;
  },

  first() {
    return this.get(0);
  },

  flatten(depth) {
    return reify(this, flattenFactory(this, depth, false));
  },

  get(index, notSetValue) {
    index = wrapIndex(this, index);
    return (index < 0 || (this.size === Infinity ||
        (this.size !== undefined && index > this.size))) ?
      notSetValue :
      this.find((_, key) => key === index, undefined, notSetValue);
  },

  has(index) {
    index = wrapIndex(this, index);
    return index >= 0 && (this.size !== undefined ?
      this.size === Infinity || index < this.size :
      this.indexOf(index) !== -1
    );
  },

  interpose(separator) {
    return reify(this, interposeFactory(this, separator));
  },

  interleave(/*...iterables*/) {
    var iterables = [this].concat(arrCopy(arguments));
    var zipped = zipWithFactory(this.toSeq(), IndexedSeq.of, iterables);
    var interleaved = zipped.flatten(true);
    if (zipped.size) {
      interleaved.size = zipped.size * iterables.length;
    }
    return reify(this, interleaved);
  },

  last() {
    return this.get(-1);
  },

  skipWhile(predicate, context) {
    return reify(this, skipWhileFactory(this, predicate, context, false));
  },

  zip(/*, ...iterables */) {
    var iterables = [this].concat(arrCopy(arguments));
    return reify(this, zipWithFactory(this, defaultZipper, iterables));
  },

  zipWith(zipper/*, ...iterables */) {
    var iterables = arrCopy(arguments);
    iterables[0] = this;
    return reify(this, zipWithFactory(this, zipper, iterables));
  },

});

IndexedIterable.prototype[IS_INDEXED_SENTINEL] = true;
IndexedIterable.prototype[IS_ORDERED_SENTINEL] = true;



mixin(SetIterable, {

  // ### ES6 Collection methods (ES6 Array and Map)

  get(value, notSetValue) {
    return this.has(value) ? value : notSetValue;
  },

  includes(value) {
    return this.has(value);
  },


  // ### More sequential methods

  keySeq() {
    return this.valueSeq();
  },

});

SetIterable.prototype.has = IterablePrototype.includes;


// Mixin subclasses

mixin(KeyedSeq, KeyedIterable.prototype);
mixin(IndexedSeq, IndexedIterable.prototype);
mixin(SetSeq, SetIterable.prototype);

mixin(KeyedCollection, KeyedIterable.prototype);
mixin(IndexedCollection, IndexedIterable.prototype);
mixin(SetCollection, SetIterable.prototype);


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

function defaultZipper() {
  return arrCopy(arguments);
}

function defaultNegComparator(a, b) {
  return a < b ? 1 : a > b ? -1 : 0;
}

function hashIterable(iterable) {
  if (iterable.size === Infinity) {
    return 0;
  }
  var ordered = isOrdered(iterable);
  var keyed = isKeyed(iterable);
  var h = ordered ? 1 : 0;
  var size = iterable.__iterate(
    keyed ?
      ordered ?
        (v, k) => { h = 31 * h + hashMerge(hash(v), hash(k)) | 0; } :
        (v, k) => { h = h + hashMerge(hash(v), hash(k)) | 0; } :
      ordered ?
        v => { h = 31 * h + hash(v) | 0; } :
        v => { h = h + hash(v) | 0; }
  );
  return murmurHashOfSize(size, h);
}

function murmurHashOfSize(size, h) {
  h = imul(h, 0xCC9E2D51);
  h = imul(h << 15 | h >>> -15, 0x1B873593);
  h = imul(h << 13 | h >>> -13, 5);
  h = (h + 0xE6546B64 | 0) ^ size;
  h = imul(h ^ h >>> 16, 0x85EBCA6B);
  h = imul(h ^ h >>> 13, 0xC2B2AE35);
  h = smi(h ^ h >>> 16);
  return h;
}

function hashMerge(a, b) {
  return a ^ b + 0x9E3779B9 + (a << 6) + (a >> 2) | 0; // int
}
