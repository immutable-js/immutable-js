import {
  Collection,
  CollectionImpl,
  IndexedCollectionImpl,
  KeyedCollectionImpl,
  SetCollectionImpl,
} from './Collection';
import {
  defaultNegComparator,
  entryMapper,
  keyMapper,
  neg,
  not,
} from './CollectionHelperMethods';
import { Iterator } from './Iterator';
import { List } from './List';
import { Map } from './Map';
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
import { ensureSize, resolveBegin } from './TrieUtils';
import { getIn } from './methods/getIn';
import { hasIn } from './methods/hasIn';
import { toObject } from './methods/toObject';
import { countByFactory, groupByFactory } from './operations/aggregations';
import {
  filterFactory,
  flatMapFactory,
  flattenFactory,
  flipFactory,
  interposeFactory,
  maxFactory,
  partitionFactory,
  reverseFactory,
  skipWhileFactory,
  sliceFactory,
  sortFactory,
  takeWhileFactory,
  zipWithFactory,
} from './operations/factories';
import { reify } from './operations/helpers';
import {
  concatFactory,
  FromEntriesSequence,
  ToIndexedSequence,
  ToKeyedSequence,
  ToSetSequence,
} from './operations/sequences';
import { isKeyed } from './predicates/isKeyed';
import { toJS } from './toJS';
import assertNotInfinite from './utils/assertNotInfinite';
import mixin from './utils/mixin';
import quoteString from './utils/quoteString';

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

  filter(predicate, context) {
    return reify(this, filterFactory(this, predicate, context, true));
  },

  partition(predicate, context) {
    return partitionFactory(this, predicate, context);
  },

  reverse() {
    return reify(this, reverseFactory(this, true));
  },

  slice(begin, end) {
    return reify(this, sliceFactory(this, begin, end, true));
  },

  sort(comparator) {
    return reify(this, sortFactory(this, comparator));
  },

  // ### More sequential methods

  butLast() {
    return this.slice(0, -1);
  },

  count(predicate, context) {
    return ensureSize(
      predicate ? this.toSeq().filter(predicate, context) : this
    );
  },

  countBy(grouper, context) {
    return countByFactory(this, grouper, context);
  },

  // equals(other) {
  //   return deepEqual(this, other);
  // },

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

  flatMap(mapper, context) {
    return reify(this, flatMapFactory(this, mapper, context));
  },

  flatten(depth) {
    return reify(this, flattenFactory(this, depth, true));
  },

  fromEntrySeq() {
    return new FromEntriesSequence(this);
  },

  getIn: getIn,

  groupBy(grouper, context) {
    return groupByFactory(this, grouper, context);
  },

  hasIn: hasIn,

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

  valueSeq() {
    return this.toIndexedSeq();
  },

  // ### Hashable Object

  // hashCode() {
  //   return this.__hash || (this.__hash = hashCollection(this));
  // },

  // ### Internal

  // abstract __iterate(fn, reverse)

  // abstract __iterator(type, reverse)
});

const CollectionPrototype = CollectionImpl.prototype;
CollectionPrototype[Symbol.iterator] = CollectionPrototype.values;
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
KeyedCollectionPrototype[Symbol.iterator] = CollectionPrototype.entries;
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
        : spliced.concat(values, this.slice(index + removeNum))
    );
  },

  // ### More collection methods

  findLastIndex(predicate, context) {
    const entry = this.findLastEntry(predicate, context);
    return entry ? entry[0] : -1;
  },

  flatten(depth) {
    return reify(this, flattenFactory(this, depth, false));
  },

  interpose(separator) {
    return reify(this, interposeFactory(this, separator));
  },

  interleave(...collections) {
    const thisAndCollections = [this].concat(collections);
    const zipped = zipWithFactory(
      this.toSeq(),
      IndexedSeq.of,
      thisAndCollections
    );
    const interleaved = zipped.flatten(true);
    if (zipped.size) {
      interleaved.size = zipped.size * thisAndCollections.length;
    }
    return reify(this, interleaved);
  },

  keySeq() {
    return Range(0, this.size);
  },

  skipWhile(predicate, context) {
    return reify(this, skipWhileFactory(this, predicate, context, false));
  },

  zip(...collections) {
    const thisAndCollections = [this].concat(collections);

    return reify(this, zipWithFactory(this, defaultZipper, thisAndCollections));
  },

  zipAll(...collections) {
    const thisAndCollections = [this].concat(collections);

    return reify(
      this,
      zipWithFactory(this, defaultZipper, thisAndCollections, true)
    );
  },

  zipWith(zipper, ...collections) {
    const thisAndCollections = [this].concat(collections);

    return reify(this, zipWithFactory(this, zipper, thisAndCollections));
  },
});

const IndexedCollectionPrototype = IndexedCollectionImpl.prototype;

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

function defaultZipper(...values) {
  return values;
}
