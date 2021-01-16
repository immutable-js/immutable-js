/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { SetCollection, KeyedCollection } from './Collection';
import { IS_ORDERED_SYMBOL } from './predicates/isOrdered';
import { isOrderedSet } from './predicates/isOrderedSet';
import { IndexedCollectionPrototype } from './CollectionImpl';
import { Set } from './Set';
import { emptyOrderedMap } from './OrderedMap';
import assertNotInfinite from './utils/assertNotInfinite';

export class OrderedSet extends Set {
  // @pragma Construction

  constructor(value) {
    return value === null || value === undefined
      ? emptyOrderedSet()
      : isOrderedSet(value)
      ? value
      : emptyOrderedSet().withMutations((set) => {
          const iter = SetCollection(value);
          assertNotInfinite(iter.size);
          iter.forEach((v) => set.add(v));
        });
  }

  static of(/*...values*/) {
    return this(arguments);
  }

  static fromKeys(value) {
    return this(KeyedCollection(value).keySeq());
  }

  toString() {
    return this.__toString('OrderedSet {', '}');
  }
}

OrderedSet.isOrderedSet = isOrderedSet;

const OrderedSetPrototype = OrderedSet.prototype;
OrderedSetPrototype[IS_ORDERED_SYMBOL] = true;
OrderedSetPrototype.zip = IndexedCollectionPrototype.zip;
OrderedSetPrototype.zipWith = IndexedCollectionPrototype.zipWith;
OrderedSetPrototype.zipAll = IndexedCollectionPrototype.zipAll;

OrderedSetPrototype.__empty = emptyOrderedSet;
OrderedSetPrototype.__make = makeOrderedSet;

function makeOrderedSet(map, ownerID) {
  const set = Object.create(OrderedSetPrototype);
  set.size = map ? map.size : 0;
  set._map = map;
  set.__ownerID = ownerID;
  return set;
}

let EMPTY_ORDERED_SET;
function emptyOrderedSet() {
  return (
    EMPTY_ORDERED_SET || (EMPTY_ORDERED_SET = makeOrderedSet(emptyOrderedMap()))
  );
}
