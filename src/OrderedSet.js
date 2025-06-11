import { KeyedCollection, SetCollection } from './Collection';
import { IndexedCollectionPrototype } from './CollectionImpl';
import { emptyOrderedMap } from './OrderedMap';
import { SetImpl } from './Set';
import { IS_ORDERED_SYMBOL } from './predicates/isOrdered';
import { isOrderedSet } from './predicates/isOrderedSet';
import assertNotInfinite from './utils/assertNotInfinite';

export const OrderedSet = (value) =>
  value === undefined || value === null
    ? emptyOrderedSet()
    : isOrderedSet(value)
      ? value
      : emptyOrderedSet().withMutations((set) => {
          const iter = SetCollection(value);
          assertNotInfinite(iter.size);
          iter.forEach((v) => set.add(v));
        });

OrderedSet.of = function (...values) {
  return OrderedSet(values);
};

OrderedSet.fromKeys = function (value) {
  return OrderedSet(KeyedCollection(value).keySeq());
};
export class OrderedSetImpl extends SetImpl {
  create(value) {
    return OrderedSet(value);
  }

  toString() {
    return this.__toString('OrderedSet {', '}');
  }
}

OrderedSet.isOrderedSet = isOrderedSet;

const OrderedSetPrototype = OrderedSetImpl.prototype;
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
