import { mapOrderedCreateEmpty } from './OrderedMap';
import { SeqSetWhenNotAssociative, SeqKeyedWhenNotKeyed } from './Seq';
import { setPropertiesCreate } from './Set';
import { IS_ORDERED_SYMBOL } from './const';
import { isOrderedSet } from './predicates/isOrderedSet';
import transformToMethods from './transformToMethods';
import { assertNotInfinite } from './utils';

const setOrderedOpToString = (cx) => {
  return cx.__toString('OrderedSet {', '}');
};

const setOrderedPropertiesCreate = (
  (cache) => () =>
    (cache =
      cache ||
      (cache = Object.assign(
        {},
        setPropertiesCreate(),
        {
          create: OrderedSet,
          __make: setOrderedCreate,
          __empty: setOrderedCreateEmpty,
        },
        transformToMethods({
          [IS_ORDERED_SYMBOL]: true,
          toString: setOrderedOpToString,
        })
      )))
)();

const setOrderedCreate = (map, ownerID) => {
  const oset = Object.create(setOrderedPropertiesCreate());
  oset.size = map ? map.size : 0;
  oset._map = map;
  oset.__ownerID = ownerID;
  return oset;
};

const setOrderedCreateEmpty = (
  (cache) => () =>
    cache || (cache = setOrderedCreate(mapOrderedCreateEmpty()))
)();

const OrderedSet = (value) => {
  return value === undefined || value === null
    ? setOrderedCreateEmpty()
    : isOrderedSet(value)
      ? value
      : setOrderedCreateEmpty().withMutations((set) => {
          const iter = SeqSetWhenNotAssociative(value);
          assertNotInfinite(iter.size);
          iter.forEach((v) => set.add(v));
        });
};

OrderedSet.isOrderedSet = isOrderedSet;
OrderedSet.of = (...args) => OrderedSet(args);
OrderedSet.fromKeys = (value) =>
  OrderedSet(SeqKeyedWhenNotKeyed(value).keySeq());

export {
  OrderedSet,
  setOrderedPropertiesCreate,
  setOrderedCreate,
  setOrderedCreateEmpty,
};
