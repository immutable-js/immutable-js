import {
  Collection,
  CollectionImpl,
  IndexedCollectionImpl,
} from './Collection';
import { Iterator } from './Iterator';
import { List } from './List';
import { Map } from './Map';
import { OrderedMap } from './OrderedMap';
import { OrderedSet } from './OrderedSet';
import { Range } from './Range';
import { Set } from './Set';
import { Stack } from './Stack';
import { resolveBegin } from './TrieUtils';
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
import mixin from './utils/mixin';

export { Collection, CollectionPrototype, IndexedCollectionPrototype };

Collection.Iterator = Iterator;

mixin(CollectionImpl, {
  // ### Conversion to other types

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
// `chain` is a legacy alias of `flatMap`, absent from the public type
// declarations.
CollectionPrototype.chain = CollectionPrototype.flatMap;

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
