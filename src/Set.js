import { mapCreateEmpty } from './Map';

import {
  SeqIndexed,
  SeqKeyedWhenNotKeyed,
  SeqWhenNotCollection,
  SeqSetWhenNotAssociative,
} from './Seq';

import {
  collectionOpWithMutations,
  collectionOpAsMutable,
  collectionPropertiesCreate,
} from './collection/collection';

import { collectionCastSetSeqCreate } from './collection/collectionCastSetSeq';
import { DELETE, IS_SET_SYMBOL, SHAPE_SET } from './const';
import {
  probeIsSet,
  probeIsOrdered,
  probeIsCollection,
  probeIsAssociative,
} from './probe';
import transformToMethods from './transformToMethods';

import { assertNotInfinite, flagSpread } from './utils';

const setOpUpdate = (set, newMap) => {
  if (set.__ownerID) {
    set.size = newMap.size;
    set._map = newMap;
    return set;
  }

  return newMap === set._map
    ? set
    : newMap.size === 0
      ? set.__empty()
      : set.__make(newMap);
};

const setOpIterate = (cx, fn, reverse) => {
  return cx._map.__iterate((k) => fn(k, k, cx), reverse);
};

const setOpMap = (cx, mapper, context) => {
  // keep track if the set is altered by the map function
  let didChanges = false;

  const newMap = setOpUpdate(
    cx,
    cx._map.mapEntries(([, v]) => {
      const mapped = mapper.call(context, v, v, cx);

      if (mapped !== v) {
        didChanges = true;
      }

      return [mapped, mapped];
    }, context)
  );

  return didChanges ? newMap : cx;
};

const setOpIterator = (cx, type, reverse) => {
  return cx._map.__iterator(type, reverse);
};

const setOpEnsureOwner = (cx, ownerID) => {
  if (ownerID === cx.__ownerID) {
    return cx;
  }

  const newMap = cx._map.__ensureOwner(ownerID);
  if (!ownerID) {
    if (cx.size === 0) {
      return cx.__empty();
    }
    cx.__ownerID = ownerID;
    cx._map = newMap;
    return cx;
  }
  return cx.__make(newMap, ownerID);
};

const setOpToString = (cx) => {
  return cx.__toString('Set {', '}');
};

const setOpHas = (cx, value) => {
  return cx._map.has(value);
};

const setOpAdd = (cx, value) => {
  return setOpUpdate(cx, cx._map.set(value, value));
};

const setOpRemove = (cx, value) => {
  return setOpUpdate(cx, cx._map.remove(value));
};

const setOpClear = (cx) => {
  return setOpUpdate(cx, cx._map.clear());
};

const setOpWasAltered = (cx) => {
  return cx._map.wasAltered();
};

const setOpUnion = (cx, iters) => {
  iters = iters.filter((x) => x.size !== 0);
  if (iters.length === 0) {
    return cx;
  }
  if (cx.size === 0 && !cx.__ownerID && iters.length === 1) {
    return Set(iters[0]);
  }
  return collectionOpWithMutations(cx, (set) => {
    for (let ii = 0; ii < iters.length; ii++) {
      if (typeof iters[ii] === 'string') {
        set.add(iters[ii]);
      } else {
        SeqSetWhenNotAssociative(iters[ii]).forEach((value) => set.add(value));
      }
    }
  });
};

const setOpIntersect = (cx, iters) => {
  if (iters.length === 0) {
    return cx;
  }
  iters = iters.map((iter) => SeqSetWhenNotAssociative(iter));
  const toRemove = [];
  cx.forEach((value) => {
    if (!iters.every((iter) => iter.includes(value))) {
      toRemove.push(value);
    }
  });
  return collectionOpWithMutations(cx, (set) => {
    toRemove.forEach((value) => {
      set.remove(value);
    });
  });
};

const setOpSubtract = (cx, iters) => {
  if (iters.length === 0) {
    return cx;
  }
  iters = iters.map((iter) => SeqSetWhenNotAssociative(iter));
  const toRemove = [];
  cx.forEach((value) => {
    if (iters.some((iter) => iter.includes(value))) {
      toRemove.push(value);
    }
  });
  return collectionOpWithMutations(cx, (set) => {
    toRemove.forEach((value) => {
      set.remove(value);
    });
  });
};

const setPropertiesCreate = ((cache) => () => {
  cache =
    cache ||
    (cache = Object.assign(
      {},
      collectionPropertiesCreate(),
      {
        __make: setCreate,
        __empty: setCreateEmpty,
        create: Set,
        ['@@transducer/init']() {
          return collectionOpAsMutable(this);
        },
        ['@@transducer/step']: (result, arr) => {
          return result.add(arr);
        },
        ['@@transducer/result']: (obj) => {
          return obj.asImmutable();
        },
      },
      transformToMethods({
        [IS_SET_SYMBOL]: true,
        toString: setOpToString,
        wasAltered: setOpWasAltered,
        remove: setOpRemove,
        [DELETE]: setOpRemove,
        clear: setOpClear,
        has: setOpHas,
        add: setOpAdd,
        map: setOpMap,
        withMutations: collectionOpWithMutations,
        merge: flagSpread(setOpUnion),
        concat: flagSpread(setOpUnion),
        union: flagSpread(setOpUnion),
        intersect: flagSpread(setOpIntersect),
        subtract: flagSpread(setOpSubtract),
        contains: setOpHas,
        __ensureOwner: setOpEnsureOwner,
        __iterate: setOpIterate,
        __iterator: setOpIterator,
      })
    ));

  // existing tests expect ref-equal keys, values, iterator
  cache.keys = cache.values;

  return cache;
})();

const setCreate = (map, ownerID) => {
  const set = Object.create(setPropertiesCreate());
  set.size = map ? map.size : 0;
  set._map = map;
  set.__ownerID = ownerID;
  set.__shape = SHAPE_SET;
  return set;
};

const setCreateEmpty = ((cache) => () => {
  return cache || (cache = setCreate(mapCreateEmpty()));
})();

const setCollection = (value) =>
  collectionCastSetSeqCreate(
    probeIsCollection(value) && !probeIsAssociative(value)
      ? value
      : SeqIndexed(value)
  );

const Set = (value) =>
  value === undefined || value === null
    ? setCreateEmpty()
    : probeIsSet(value) && !probeIsOrdered(value)
      ? value
      : collectionOpWithMutations(setCreateEmpty(), (set) => {
          const iter = setCollection(value);
          assertNotInfinite(iter.size);
          iter.forEach((v) => set.add(v));
        });

Set.isSet = probeIsSet;
Set.of = (...args) => Set(args);
Set.fromKeys = (value) => Set(SeqKeyedWhenNotKeyed(value).keySeq());
Set.union = (sets) => {
  const setArray = SeqWhenNotCollection(sets).toArray();
  return setArray.length
    ? setOpUnion(Set(setArray.pop()), setArray)
    : setCreateEmpty();
};

Set.intersect = (sets) => {
  sets = SeqWhenNotCollection(sets).toArray();
  return sets.length ? setOpIntersect(Set(sets.pop()), sets) : setCreateEmpty();
};

export { Set, setPropertiesCreate, setCreateEmpty };
