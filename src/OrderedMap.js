import { listCreateEmpty } from './List';
import { mapPropertiesCreate, mapCreateEmpty } from './Map';
import { SeqKeyedWhenNotKeyed } from './Seq';
import { SIZE } from './TrieUtils';
import { collectionOpWithMutations } from './collection/collection';
import { IS_ORDERED_SYMBOL, DELETE, NOT_SET } from './const';
import { isOrderedMap } from './predicates/isOrderedMap';
import transformToMethods from './transformToMethods';
import { assertNotInfinite } from './utils';

const mapOrderedOpUpdate = (omap, k, v) => {
  const map = omap._map;
  const list = omap._list;
  const i = map.get(k);
  const has = i !== undefined;
  let newMap;
  let newList;
  if (v === NOT_SET) {
    // removed
    if (!has) {
      return omap;
    }
    if (list.size >= SIZE && list.size >= map.size * 2) {
      newList = list.filter((entry, idx) => entry !== undefined && i !== idx);
      newMap = newList
        .toKeyedSeq()
        .map((entry) => entry[0])
        .flip()
        .toMap();
      if (omap.__ownerID) {
        newMap.__ownerID = newList.__ownerID = omap.__ownerID;
      }
    } else {
      newMap = map.remove(k);
      newList = i === list.size - 1 ? list.pop() : list.set(i, undefined);
    }
  } else if (has) {
    if (v === list.get(i)[1]) {
      return omap;
    }
    newMap = map;
    newList = list.set(i, [k, v]);
  } else {
    newMap = map.set(k, list.size);
    newList = list.set(list.size, [k, v]);
  }
  if (omap.__ownerID) {
    omap.size = newMap.size;
    omap._map = newMap;
    omap._list = newList;
    omap.__hash = undefined;
    omap.__altered = true;
    return omap;
  }
  return mapOrderedCreate(newMap, newList);
};

const mapOrderedOpRemove = (cx, k) => {
  return mapOrderedOpUpdate(cx, k, NOT_SET);
};

const mapOrderedOpToString = (cx) => {
  return cx.__toString('OrderedMap {', '}');
};

const mapOrderedOpGet = (cx, k, notSetValue) => {
  const index = cx._map.get(k);
  return index !== undefined ? cx._list.get(index)[1] : notSetValue;
};

const mapOrderedOpClear = (cx) => {
  if (cx.size === 0) {
    return cx;
  }
  if (cx.__ownerID) {
    cx.size = 0;
    cx._map.clear();
    cx._list.clear();
    cx.__altered = true;
    return cx;
  }
  return mapOrderedCreateEmpty();
};

const mapOrderedOpIterate = (cx, fn, reverse) => {
  return cx._list.__iterate((entry) => {
    return entry && fn(entry[1], entry[0], cx);
  }, reverse);
};

const mapOrderedOpIterator = (cx, type, reverse) => {
  return cx._list.fromEntrySeq().__iterator(type, reverse);
};

const mapOrderedOpEnsureOwner = (cx, ownerID) => {
  if (ownerID === cx.__ownerID) {
    return cx;
  }
  const newMap = cx._map.__ensureOwner(ownerID);
  const newList = cx._list.__ensureOwner(ownerID);
  if (!ownerID) {
    if (cx.size === 0) {
      return mapOrderedCreateEmpty();
    }
    cx.__ownerID = ownerID;
    cx.__altered = false;
    cx._map = newMap;
    cx._list = newList;
    return cx;
  }
  return mapOrderedCreate(newMap, newList, ownerID, cx.__hash);
};

const mapOrderedPropertiesCreate = (
  (cache) => () =>
    (cache =
      cache ||
      (cache = Object.assign(
        {},
        mapPropertiesCreate(),
        {
          create: OrderedMap,
        },
        transformToMethods({
          [IS_ORDERED_SYMBOL]: true,
          toString: mapOrderedOpToString,
          get: mapOrderedOpGet,
          set: mapOrderedOpUpdate,
          remove: mapOrderedOpRemove,
          clear: mapOrderedOpClear,
          [DELETE]: mapOrderedOpRemove,
          __iterate: mapOrderedOpIterate,
          __iterator: mapOrderedOpIterator,
          __ensureOwner: mapOrderedOpEnsureOwner,
        })
      )))
)();

export const mapOrderedCreate = (map, list, ownerID, hash) => {
  const omap = Object.create(mapOrderedPropertiesCreate());
  omap.size = map ? map.size : 0;

  omap._map = map;
  omap._list = list;
  omap.__ownerID = ownerID;
  omap.__hash = hash;
  omap.__altered = false;
  omap.__shape = 'orderedmap';

  return omap;
};

export const mapOrderedCreateEmpty = (
  (cache) => () =>
    cache || (cache = mapOrderedCreate(mapCreateEmpty(), listCreateEmpty()))
)();

export const OrderedMap = (value) =>
  value === undefined || value === null
    ? mapOrderedCreateEmpty()
    : isOrderedMap(value)
      ? value
      : collectionOpWithMutations(mapOrderedCreateEmpty(), (map) => {
          const iter = SeqKeyedWhenNotKeyed(value);
          assertNotInfinite(iter.size);
          iter.forEach((v, k) => map.set(k, v));
        });

OrderedMap.of = (...args) => OrderedMap(args);
OrderedMap.isOrderedMap = isOrderedMap;
