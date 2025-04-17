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

import mixin from './utils/mixin';
import quoteString from './utils/quoteString';

import { getIn } from './methods/getIn';
import { hasIn } from './methods/hasIn';
import { toObject } from './methods/toObject';

import {
  IndexedSeqImpl,
  KeyedSeqImpl,
  SetSeqImpl,
  ArraySeq,
} from './Seq';

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

  collectionSetGet,
  collectionSetIncludes,
  collectionSetKeySeq,
  
  collectionKeyedFlip,
  collectionKeyedMapEntries,
  collectionKeyedMapKeys,

  collectionIndexedToKeyedSeq,
  collectionIndexedFilter,
  collectionIndexedFindIndex,
  collectionIndexedIndexOf,
  collectionIndexedLastIndexOf,
  collectionIndexedReverse,
  collectionIndexedSlice,
  collectionIndexedSplice,
  collectionIndexedFindLastIndex,
  collectionIndexedFirst,
  collectionIndexedFlatten,
  collectionIndexedGet,
  collectionIndexedHas,
  collectionIndexedInterpose,
  collectionIndexedInterleave,
  collectionIndexedKeySeq,
  collectionIndexedLast,
  collectionIndexedSkipWhile,
  collectionIndexedZip,
  collectionIndexedZipAll,
  collectionIndexedZipWith
} from './Operations';

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
    return collectionKeyedFlip(this)
  },

  mapEntries(mapper, context) {
    return collectionKeyedMapEntries(this, mapper, context)
  },

  mapKeys(mapper, context) {
    return collectionKeyedMapKeys(this, mapper, context)
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
    return collectionIndexedToKeyedSeq(this)
  },

  // ### ES6 Collection methods (ES6 Array and Map)

  filter(predicate, context) {
    return collectionIndexedFilter(this, predicate, context)
  },

  findIndex(predicate, context) {
    return collectionIndexedFindIndex(this, predicate, context)
  },

  indexOf(searchValue) {
    return collectionIndexedIndexOf(this, searchValue)
  },

  lastIndexOf(searchValue) {
    return collectionIndexedLastIndexOf(this, searchValue)
  },

  reverse() {
    return collectionIndexedReverse(this)
  },

  slice(begin, end) {
    return collectionIndexedSlice(this, begin, end)
  },

  splice(index, removeNum, ...values) {
    return collectionIndexedSplice(this, index, removeNum, values)
  },

  // ### More collection methods

  findLastIndex(predicate, context) {
    return collectionIndexedFindLastIndex(this, predicate, context)  },

  first(notSetValue) {
    return collectionIndexedFirst(this, notSetValue)
  },

  flatten(depth) {
    return collectionIndexedFlatten(this, depth)
  },

  get(index, notSetValue) {
    return collectionIndexedGet(this, index, notSetValue)
  },

  has(index) {
    return collectionIndexedHas(this, index)
  },

  interpose(separator) {
    return collectionIndexedInterpose(this, separator);
  },

  interleave(...collections) {
    return collectionIndexedInterleave(this, collections);
  },

  keySeq() {
    return collectionIndexedKeySeq(this);
  },

  last(notSetValue) {
    return collectionIndexedLast(this, notSetValue);
  },

  skipWhile(predicate, context) {
    return collectionIndexedSkipWhile(this, predicate, context);
  },

  zip(...collections) {
    return collectionIndexedZip(this, collections);
  },

  zipAll(...collections) {
    return collectionIndexedZipAll(this, collections);
  },

  zipWith(zipper, ...collections) {
    return collectionIndexedZipWith(this, zipper, collections);
  }
});

const IndexedCollectionPrototype = IndexedCollectionImpl.prototype;
IndexedCollectionPrototype[IS_INDEXED_SYMBOL] = true;
IndexedCollectionPrototype[IS_ORDERED_SYMBOL] = true;

mixin(SetCollectionImpl, {
  // ### ES6 Collection methods (ES6 Array and Map)

  get(value, notSetValue) {
    return collectionSetGet(this, value, notSetValue);
  },

  includes(value) {
    return collectionSetIncludes(this, value)
  },

  // ### More sequential methods
  keySeq() {
    return collectionSetKeySeq(this)
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
