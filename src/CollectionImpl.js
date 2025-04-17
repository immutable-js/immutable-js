import {
  Collection,
  CollectionImpl,
  IndexedCollectionImpl,
  KeyedCollectionImpl,
  SetCollectionImpl,
} from './Collection';
import CollectionProtoAssign from './CollectionProtoAssign';
import { Iterator, ITERATOR_SYMBOL } from './Iterator';
import { IS_INDEXED_SYMBOL } from './predicates/isIndexed';
import { IS_KEYED_SYMBOL } from './predicates/isKeyed';
import { IS_ORDERED_SYMBOL } from './predicates/isOrdered';
import { wrapIndex } from './TrieUtils';

import arrCopy from './utils/arrCopy';
import mixin from './utils/mixin';
import quoteString from './utils/quoteString';

import { getIn } from './methods/getIn';
import { hasIn } from './methods/hasIn';
import { toObject } from './methods/toObject';
import {
  filterFactory,
  flattenFactory,
  flipFactory,
  interposeFactory,
  reify,
  reverseFactory,
  skipWhileFactory,
  sliceFactory,
  ToKeyedSequence,
  zipWithFactory,
} from './Operations';
import { Range } from './Range';
import { IndexedSeqImpl, IndexedSeq, KeyedSeqImpl, SetSeqImpl, ArraySeq } from './Seq';

import {
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
} from './manipulations';

export { Collection, CollectionPrototype, IndexedCollectionPrototype };

Collection.Iterator = Iterator;

mixin(CollectionImpl, {
  // ### Conversion to other types

  toArray() {
    return collectionToArray(this);
  },

  toIndexedSeq() {
    return collectionToIndexedSeq(this);
  },

  toJS() {
    return collectionToJS(this);
  },

  toKeyedSeq() {
    return collectionToKeyedSequence(this);
  },

  toMap() {
    // Use Late Binding here to solve the circular dependency.
    return collectionToMap(this);
  },

  toObject: toObject,

  toOrderedMap() {
    return collectionToOrderedMap(this);
  },

  toOrderedSet() {
    return collectionToOrderedSet(this);
  },

  toSet() {
    return collectionToSet(this);
  },

  toSetSeq() {
    return collectionToSetSeq(this);
  },

  toSeq() {
    return collectionToSeq(this);
  },

  toStack() {
    return collectionToStack(this);
  },

  toList() {
    return collectionToList(this);
  },

  // ### Common JavaScript methods and properties

  toString() {
    return '[Collection]';
  },

  __toString(head, tail) {
    return collectionToStringDetails(this, head, tail);
  },

  // ### ES6 Collection methods (ES6 Array and Map)

  concat(...values) {
    return collectionConcat(this, values);
  },

  includes(searchValue) {
    return collectionIncludes(this, searchValue);
  },

  entries() {
    return collectionEntries(this);
  },

  every(predicate, context) {
    return collectionEvery(this, predicate, context);
  },

  filter(predicate, context) {
    return collectionFilter(this, predicate, context);
  },

  partition(predicate, context) {
    return collectionPartition(this, predicate, context);
  },

  find(predicate, context, notSetValue) {
    return collectionFind(this, predicate, context, notSetValue);
  },

  forEach(sideEffect, context) {
    return collectionForEach(this, sideEffect, context);
  },

  join(separator) {
    return collectionJoin(this, separator);
  },

  keys() {
    return collectionKeys(this);
  },

  map(mapper, context) {
    return collectionMap(this, mapper, context);
  },

  reduce(reducer, initialReduction, context) {
    return collectionReduce(this, reducer, initialReduction, context);
  },

  reduceRight(reducer, initialReduction, context) {
    return collectionReduceRight(this, reducer, initialReduction, context);
  },

  reverse() {
    return collectionReverse(this);
  },

  slice(begin, end) {
    return collectionSlice(this, begin, end);
  },

  some(predicate, context) {
    return collectionSome(this, predicate, context);
  },

  sort(comparator) {
    return collectionSort(this, comparator);
  },

  values() {
    return collectionValues(this);
  },

  // ### More sequential methods

  butLast() {
    return collectionButLast(this);
  },

  isEmpty() {
    return collectionIsEmpty(this);
  },

  count(predicate, context) {
    return collectionCount(this, predicate, context);
  },

  countBy(grouper, context) {
    return collectionCountBy(this, grouper, context);
  },

  equals(other) {
    return collectionEquals(this, other);
  },

  entrySeq() {
    return collectionEntrySeq(this, ArraySeq);
  },

  filterNot(predicate, context) {
    return collectionFilterNot(this, predicate, context);
  },

  findEntry(predicate, context, notSetValue) {
    return collectionFindEntry(this, predicate, context, notSetValue);
  },

  findKey(predicate, context) {
    return collectionFindKey(this, predicate, context);
  },

  findLast(predicate, context, notSetValue) {
    return collectionFindLast(this, predicate, context, notSetValue);
  },

  findLastEntry(predicate, context, notSetValue) {
    return collectionFindLastEntry(this, predicate, context, notSetValue);
  },

  findLastKey(predicate, context) {
    return collectionFindLastKey(this, predicate, context);
  },

  first(notSetValue) {
    return collectionFirst(this, notSetValue);
  },

  flatMap(mapper, context) {
    return collectionFlatMap(this, mapper, context);
  },

  flatten(depth) {
    return collectionFlatten(this, depth);
  },

  fromEntrySeq() {
    return collectionFromEntrySeq(this);
  },

  get(searchKey, notSetValue) {
    return collectionGet(this, searchKey, notSetValue);
  },

  getIn: getIn,

  groupBy(grouper, context) {
    return collectionGroupBy(this, grouper, context);
  },

  has(searchKey) {
    return collectionHas(this, searchKey);
  },

  hasIn: hasIn,

  isSubset(iter) {
    return collectionIsSubset(this, iter, Collection);
  },

  isSuperset(iter) {
    return collectionIsSuperset(this, iter, Collection);
  },

  keyOf(searchValue) {
    return collectionKeyOf(this, searchValue);
  },

  keySeq() {
    return collectionKeySeq(this);
  },

  last(notSetValue) {
    return collectionLast(this, notSetValue);
  },

  lastKeyOf(searchValue) {
    return collectionLastKeyOf(this, searchValue);
  },

  max(comparator) {
    return collectionMax(this, comparator);
  },

  maxBy(mapper, comparator) {
    return collectionMaxBy(this, mapper, comparator);
  },

  min(comparator) {
    return collectionMin(this, comparator);
  },

  minBy(mapper, comparator) {
    return collectionMinBy(this, mapper, comparator);
  },

  rest() {
    return collectionRest(this);
  },

  skip(amount) {
    return collectionSkip(this, amount);
  },

  skipLast(amount) {
    return collectionSkipLast(this, amount);
  },

  skipWhile(predicate, context) {
    return collectionSkipWhile(this, predicate, context);
  },

  skipUntil(predicate, context) {
    return collectionSkipUntil(this, predicate, context);
  },

  sortBy(mapper, comparator) {
    return collectionSortBy(this, mapper, comparator);
  },

  take(amount) {
    return collectionTake(this, amount);
  },

  takeLast(amount) {
    return collectionTakeLast(this, amount);
  },

  takeWhile(predicate, context) {
    return collectionTakeWhile(this, predicate, context);
  },

  takeUntil(predicate, context) {
    return collectionTakeUntil(this, predicate, context);
  },

  update(fn) {
    return fn(this);
  },

  valueSeq() {
    return collectionValueSeq(this);
  },

  // ### Hashable Object

  hashCode() {
    return collectionHashCode(this);
  },

  // ### Internal

  // abstract __iterate(fn, reverse)

  // abstract __iterator(type, reverse)
});

const CollectionPrototype = CollectionProtoAssign(CollectionImpl.prototype);

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

  splice(index, removeNum, ...values) {
    return collectionSplice(this, index, removeNum, values);
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

  interleave(...collections) {
    return collectionInterleave(this, collections, IndexedSeq.of);
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
function defaultZipper() {
  return arrCopy(arguments);
}
