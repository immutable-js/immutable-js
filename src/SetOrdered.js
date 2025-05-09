import transformToMethods from './transformToMethods';

import { setPropertiesCreate } from './Set';

import { mapOrderedCreateEmpty } from './MapOrdered';

import { SeqSetWhenNotAssociative, SeqKeyedWhenNotKeyed } from './Seq';

import { utilAssertNotInfinite } from './util';

import { probeIsOrderedSet } from './probe';

import { IS_ORDERED_SYMBOL } from './const';

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
          create: SetOrdered,
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

const SetOrdered = (value) => {
  return value === undefined || value === null
    ? setOrderedCreateEmpty()
    : probeIsOrderedSet(value)
      ? value
      : setOrderedCreateEmpty().withMutations((set) => {
          const iter = SeqSetWhenNotAssociative(value);
          utilAssertNotInfinite(iter.size);
          iter.forEach((v) => set.add(v));
        });
};

SetOrdered.isOrderedSet = probeIsOrderedSet;
SetOrdered.of = (...args) => SetOrdered(args);
SetOrdered.fromKeys = (value) =>
  SetOrdered(SeqKeyedWhenNotKeyed(value).keySeq());

export {
  SetOrdered,
  setOrderedPropertiesCreate,
  setOrderedCreate,
  setOrderedCreateEmpty,
};
