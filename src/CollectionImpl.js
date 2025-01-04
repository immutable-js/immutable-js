import {
  Collection,
  CollectionImpl,
  IndexedCollectionImpl,
  KeyedCollectionImpl,
  SetCollectionImpl,
} from './Collection';
import { hash } from './Hash';
import { is } from './is';
import {
  ITERATE_ENTRIES,
  ITERATE_KEYS,
  ITERATE_VALUES,
  Iterator,
  ITERATOR_SYMBOL,
} from './Iterator';
import { imul, smi } from './Math';
import { IS_COLLECTION_SYMBOL } from './predicates/isCollection';
import { IS_INDEXED_SYMBOL, isIndexed } from './predicates/isIndexed';
import { IS_KEYED_SYMBOL, isKeyed } from './predicates/isKeyed';
import { IS_ORDERED_SYMBOL, isOrdered } from './predicates/isOrdered';
import {
  ensureSize,
  NOT_SET,
  resolveBegin,
  returnTrue,
  wrapIndex,
} from './TrieUtils';

import arrCopy from './utils/arrCopy';
import assertNotInfinite from './utils/assertNotInfinite';
import deepEqual from './utils/deepEqual';
import mixin from './utils/mixin';
import quoteString from './utils/quoteString';

import { List } from './List';
import { Map } from './Map';
import { getIn } from './methods/getIn';
import { hasIn } from './methods/hasIn';
import { toObject } from './methods/toObject';
import {
  concatFactory,
  countByFactory,
  filterFactory,
  flatMapFactory,
  flattenFactory,
  flipFactory,
  FromEntriesSequence,
  groupByFactory,
  interposeFactory,
  mapFactory,
  maxFactory,
  partitionFactory,
  reify,
  reverseFactory,
  skipWhileFactory,
  sliceFactory,
  sortFactory,
  takeWhileFactory,
  ToIndexedSequence,
  ToKeyedSequence,
  ToSetSequence,
  zipWithFactory,
} from './Operations';
import { OrderedMap } from './OrderedMap';
import { OrderedSet } from './OrderedSet';
import { Range } from './Range';
import {
  ArraySeq,
  IndexedSeq,
  IndexedSeqImpl,
  KeyedSeqImpl,
  SetSeqImpl,
} from './Seq';
import { Set } from './Set';
import { Stack } from './Stack';
import { toJS } from './toJS';

export { Collection, CollectionPrototype, IndexedCollectionPrototype };

Collection.Iterator = Iterator;

mixin(CollectionImpl, {
  // ### Conversion to other types

  toArray() {
    assertNotInfinite(this.size);
    const array = new Array(this.size || 0);
    const useTuples = isKeyed(this);
    let i = 0;
    this.__iterate((v, k) => {
      // Keyed collections produce an array of tuples.
      array[i++] = useTuples ? [k, v] : v;
    });
    return array;
  },

  toIndexedSeq() {
    return new ToIndexedSequence(this);
  },

  toJS() {
    return toJS(this);
  },

  toKeyedSeq() {
    return new ToKeyedSequence(this, true);
  },

  toMap() {
    // Use Late Binding here to solve the circular dependency.
    return Map(this.toKeyedSeq());
  },

  toObject: toObject,

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
    return isIndexed(this)
      ? this.toIndexedSeq()
      : isKeyed(this)
      ? this.toKeyedSeq()
      : this.toSetSeq();
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
    return '[Collection]';
  },

  __toString(head, tail) {
    if (this.size === 0) {
      return head + tail;
    }
    return (
      head +
      ' ' +
      this.toSeq().map(this.__toStringMapper).join(', ') +
      ' ' +
      tail
    );
  },

  // ### ES6 Collection methods (ES6 Array and Map)

  concat(...values) {
    return reify(this, concatFactory(this, values));
  },

  includes(searchValue) {
    return this.some(value => is(value, searchValue));
  },

  entries() {
    return this.__iterator(ITERATE_ENTRIES);
  },

  every(predicate, context) {
    assertNotInfinite(this.size);
    let returnValue = true;
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

  partition(predicate, context) {
    return partitionFactory(this, predicate, context);
  },

  find(predicate, context, notSetValue) {
    const entry = this.findEntry(predicate, context);
    return entry ? entry[1] : notSetValue;
  },

  forEach(sideEffect, context) {
    assertNotInfinite(this.size);
    return this.__iterate(context ? sideEffect.bind(context) : sideEffect);
  },

  join(separator) {
    assertNotInfinite(this.size);
    separator = separator !== undefined ? '' + separator : ',';
    let joined = '';
    let isFirst = true;
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
    return reduce(
      this,
      reducer,
      initialReduction,
      context,
      arguments.length < 2,
      false
    );
  },

  reduceRight(reducer, initialReduction, context) {
    return reduce(
      this,
      reducer,
      initialReduction,
      context,
      arguments.length < 2,
      true
    );
  },

  reverse() {
    return reify(this, reverseFactory(this, true));
  },

  slice(begin, end) {
    return reify(this, sliceFactory(this, begin, end, true));
  },

  some(predicate, context) {
    assertNotInfinite(this.size);
    let returnValue = false;
    this.__iterate((v, k, c) => {
      if (predicate.call(context, v, k, c)) {
        returnValue = true;
        return false;
      }
    });
    return returnValue;
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
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const collection = this;
    if (collection._cache) {
      // We cache as an entries array, so we can just return the cache!
      return new ArraySeq(collection._cache);
    }
    const entriesSequence = collection.toSeq().map(entryMapper).toIndexedSeq();
    entriesSequence.fromEntrySeq = () => collection.toSeq();
    return entriesSequence;
  },

  filterNot(predicate, context) {
    return this.filter(not(predicate), context);
  },

  findEntry(predicate, context, notSetValue) {
    let found = notSetValue;
    this.__iterate((v, k, c) => {
      if (predicate.call(context, v, k, c)) {
        found = [k, v];
        return false;
      }
    });
    return found;
  },

  findKey(predicate, context) {
    const entry = this.findEntry(predicate, context);
    return entry && entry[0];
  },

  findLast(predicate, context, notSetValue) {
    return this.toKeyedSeq().reverse().find(predicate, context, notSetValue);
  },

  findLastEntry(predicate, context, notSetValue) {
    return this.toKeyedSeq()
      .reverse()
      .findEntry(predicate, context, notSetValue);
  },

  findLastKey(predicate, context) {
    return this.toKeyedSeq().reverse().findKey(predicate, context);
  },

  first(notSetValue) {
    return this.find(returnTrue, null, notSetValue);
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

  getIn: getIn,

  groupBy(grouper, context) {
    return groupByFactory(this, grouper, context);
  },

  has(searchKey) {
    return this.get(searchKey, NOT_SET) !== NOT_SET;
  },

  hasIn: hasIn,

  isSubset(iter) {
    iter = typeof iter.includes === 'function' ? iter : Collection(iter);
    return this.every(value => iter.includes(value));
  },

  isSuperset(iter) {
    iter = typeof iter.isSubset === 'function' ? iter : Collection(iter);
    return iter.isSubset(this);
  },

  keyOf(searchValue) {
    return this.findKey(value => is(value, searchValue));
  },

  keySeq() {
    return this.toSeq().map(keyMapper).toIndexedSeq();
  },

  last(notSetValue) {
    return this.toSeq().reverse().first(notSetValue);
  },

  lastKeyOf(searchValue) {
    return this.toKeyedSeq().reverse().keyOf(searchValue);
  },

  max(comparator) {
    return maxFactory(this, comparator);
  },

  maxBy(mapper, comparator) {
    return maxFactory(this, comparator, mapper);
  },

  min(comparator) {
    return maxFactory(
      this,
      comparator ? neg(comparator) : defaultNegComparator
    );
  },

  minBy(mapper, comparator) {
    return maxFactory(
      this,
      comparator ? neg(comparator) : defaultNegComparator,
      mapper
    );
  },

  rest() {
    return this.slice(1);
  },

  skip(amount) {
    return amount === 0 ? this : this.slice(Math.max(0, amount));
  },

  skipLast(amount) {
    return amount === 0 ? this : this.slice(0, -Math.max(0, amount));
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
    return this.slice(-Math.max(0, amount));
  },

  takeWhile(predicate, context) {
    return reify(this, takeWhileFactory(this, predicate, context));
  },

  takeUntil(predicate, context) {
    return this.takeWhile(not(predicate), context);
  },

  update(fn) {
    return fn(this);
  },

  valueSeq() {
    return this.toIndexedSeq();
  },

  // ### Hashable Object

  hashCode() {
    return this.__hash || (this.__hash = hashCollection(this));
  },

  // ### Internal

  // abstract __iterate(fn, reverse)

  // abstract __iterator(type, reverse)
});

const CollectionPrototype = CollectionImpl.prototype;
CollectionPrototype[IS_COLLECTION_SYMBOL] = true;
CollectionPrototype[ITERATOR_SYMBOL] = CollectionPrototype.values;
CollectionPrototype.toJSON = CollectionPrototype.toArray;
CollectionPrototype.__toStringMapper = quoteString;
CollectionPrototype.inspect = CollectionPrototype.toSource = function () {
  return this.toString();
};
CollectionPrototype.chain = CollectionPrototype.flatMap;
CollectionPrototype.contains = CollectionPrototype.includes;

mixin(KeyedCollectionImpl, {
  // ### More sequential methods

  flip() {
    return reify(this, flipFactory(this));
  },

  mapEntries(mapper, context) {
    let iterations = 0;
    return reify(
      this,
      this.toSeq()
        .map((v, k) => mapper.call(context, [k, v], iterations++, this))
        .fromEntrySeq()
    );
  },

  mapKeys(mapper, context) {
    return reify(
      this,
      this.toSeq()
        .flip()
        .map((k, v) => mapper.call(context, k, v, this))
        .flip()
    );
  },
});

const KeyedCollectionPrototype = KeyedCollectionImpl.prototype;
KeyedCollectionPrototype[IS_KEYED_SYMBOL] = true;
KeyedCollectionPrototype[ITERATOR_SYMBOL] = CollectionPrototype.entries;
KeyedCollectionPrototype.toJSON = toObject;
KeyedCollectionPrototype.__toStringMapper = (v, k) =>
  quoteString(k) + ': ' + quoteString(v);

mixin(IndexedCollectionImpl, {
  // ### Conversion to other types

  toKeyedSeq() {
    return new ToKeyedSequence(this, false);
  },

  // ### ES6 Collection methods (ES6 Array and Map)

  filter(predicate, context) {
    return reify(this, filterFactory(this, predicate, context, false));
  },

  findIndex(predicate, context) {
    const entry = this.findEntry(predicate, context);
    return entry ? entry[0] : -1;
  },

  indexOf(searchValue) {
    const key = this.keyOf(searchValue);
    return key === undefined ? -1 : key;
  },

  lastIndexOf(searchValue) {
    const key = this.lastKeyOf(searchValue);
    return key === undefined ? -1 : key;
  },

  reverse() {
    return reify(this, reverseFactory(this, false));
  },

  slice(begin, end) {
    return reify(this, sliceFactory(this, begin, end, false));
  },

  splice(index, removeNum /*, ...values*/) {
    const numArgs = arguments.length;
    removeNum = Math.max(removeNum || 0, 0);
    if (numArgs === 0 || (numArgs === 2 && !removeNum)) {
      return this;
    }
    // If index is negative, it should resolve relative to the size of the
    // collection. However size may be expensive to compute if not cached, so
    // only call count() if the number is in fact negative.
    index = resolveBegin(index, index < 0 ? this.count() : this.size);
    const spliced = this.slice(0, index);
    return reify(
      this,
      numArgs === 1
        ? spliced
        : spliced.concat(arrCopy(arguments, 2), this.slice(index + removeNum))
    );
  },

  // ### More collection methods

  findLastIndex(predicate, context) {
    const entry = this.findLastEntry(predicate, context);
    return entry ? entry[0] : -1;
  },

  first(notSetValue) {
    return this.get(0, notSetValue);
  },

  flatten(depth) {
    return reify(this, flattenFactory(this, depth, false));
  },

  get(index, notSetValue) {
    index = wrapIndex(this, index);
    return index < 0 ||
      this.size === Infinity ||
      (this.size !== undefined && index > this.size)
      ? notSetValue
      : this.find((_, key) => key === index, undefined, notSetValue);
  },

  has(index) {
    index = wrapIndex(this, index);
    return (
      index >= 0 &&
      (this.size !== undefined
        ? this.size === Infinity || index < this.size
        : this.indexOf(index) !== -1)
    );
  },

  interpose(separator) {
    return reify(this, interposeFactory(this, separator));
  },

  interleave(/*...collections*/) {
    const collections = [this].concat(arrCopy(arguments));
    const zipped = zipWithFactory(this.toSeq(), IndexedSeq.of, collections);
    const interleaved = zipped.flatten(true);
    if (zipped.size) {
      interleaved.size = zipped.size * collections.length;
    }
    return reify(this, interleaved);
  },

  keySeq() {
    return Range(0, this.size);
  },

  last(notSetValue) {
    return this.get(-1, notSetValue);
  },

  skipWhile(predicate, context) {
    return reify(this, skipWhileFactory(this, predicate, context, false));
  },

  zip(/*, ...collections */) {
    const collections = [this].concat(arrCopy(arguments));
    return reify(this, zipWithFactory(this, defaultZipper, collections));
  },

  zipAll(/*, ...collections */) {
    const collections = [this].concat(arrCopy(arguments));
    return reify(this, zipWithFactory(this, defaultZipper, collections, true));
  },

  zipWith(zipper /*, ...collections */) {
    const collections = arrCopy(arguments);
    collections[0] = this;
    return reify(this, zipWithFactory(this, zipper, collections));
  },
});

const IndexedCollectionPrototype = IndexedCollectionImpl.prototype;
IndexedCollectionPrototype[IS_INDEXED_SYMBOL] = true;
IndexedCollectionPrototype[IS_ORDERED_SYMBOL] = true;

mixin(SetCollectionImpl, {
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

const SetCollectionPrototype = SetCollectionImpl.prototype;
SetCollectionPrototype.has = CollectionPrototype.includes;
SetCollectionPrototype.contains = SetCollectionPrototype.includes;
SetCollectionPrototype.keys = SetCollectionPrototype.values;

// Mixin subclasses

mixin(KeyedSeqImpl, KeyedCollectionPrototype);
mixin(IndexedSeqImpl, IndexedCollectionPrototype);
mixin(SetSeqImpl, SetCollectionPrototype);

// #pragma Helper functions

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

function keyMapper(v, k) {
  return k;
}

function entryMapper(v, k) {
  return [k, v];
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

function defaultZipper() {
  return arrCopy(arguments);
}

function defaultNegComparator(a, b) {
  return a < b ? 1 : a > b ? -1 : 0;
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
      ? v => {
          h = (31 * h + hash(v)) | 0;
        }
      : v => {
          h = (h + hash(v)) | 0;
        }
  );

  return murmurHashOfSize(collection.size, h);
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

function hashMerge(a, b) {
  return (a ^ (b + 0x9e3779b9 + (a << 6) + (a >> 2))) | 0; // int
}
