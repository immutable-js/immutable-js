import {
  Collection,
  CollectionImpl,
  IndexedCollectionImpl,
  KeyedCollectionImpl,
  SetCollectionImpl,
} from './Collection';
import { entryMapper } from './CollectionHelperMethods';
import { Iterator } from './Iterator';
import { List } from './List';
import { Map } from './Map';
import { OrderedMap } from './OrderedMap';
import { OrderedSet } from './OrderedSet';
import { Range } from './Range';
import { ArraySeq, IndexedSeqImpl, KeyedSeqImpl, SetSeqImpl } from './Seq';
import { Set } from './Set';
import { Stack } from './Stack';
import { resolveBegin } from './TrieUtils';
import { toObject } from './methods/toObject';
import { countByFactory, groupByFactory } from './operations/aggregations';
import { reify } from './operations/helpers';
import {
  concatFactory,
  FromEntriesSequence,
  ToIndexedSequence,
  ToKeyedSequence,
  ToSetSequence,
} from './operations/sequences';
import { isKeyed } from './predicates/isKeyed';
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

  toKeyedSeq() {
    return new ToKeyedSequence(this, true);
  },

  toMap() {
    // Use Late Binding here to solve the circular dependency.
    return Map(this.toKeyedSeq());
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

  toStack() {
    // Use Late Binding here to solve the circular dependency.
    return Stack(isKeyed(this) ? this.valueSeq() : this);
  },

  toList() {
    // Use Late Binding here to solve the circular dependency.
    return List(isKeyed(this) ? this.valueSeq() : this);
  },

  // ### Common JavaScript methods and properties

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

  // ### More sequential methods

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

  fromEntrySeq() {
    return new FromEntriesSequence(this);
  },

  groupBy(grouper, context) {
    return groupByFactory(this, grouper, context);
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

  keySeq() {
    return Range(0, this.size);
  },
});

const IndexedCollectionPrototype = IndexedCollectionImpl.prototype;

const SetCollectionPrototype = SetCollectionImpl.prototype;
SetCollectionPrototype.has = CollectionPrototype.includes;
SetCollectionPrototype.contains = SetCollectionPrototype.includes;
SetCollectionPrototype.keys = SetCollectionPrototype.values;

// Mixin subclasses

mixin(KeyedSeqImpl, KeyedCollectionPrototype);
mixin(IndexedSeqImpl, IndexedCollectionPrototype);
mixin(SetSeqImpl, SetCollectionPrototype);
