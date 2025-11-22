import { Iterator, iteratorValue, iteratorDone } from './Iterator';
import { KeyedSeq, SeqWhenNotCollection } from './Seq';
import { MakeRef } from './TrieUtils';
import {
  collectionOpForEach,
  collectionOpWithMutations,
  collectionOpWasAltered,
  collectionOpToObject,
} from './collection/collection';
import { collectionKeyedPropertiesCreate } from './collection/collectionKeyed';
import {
  kernelKeyedArrayMapCreate,
  kernelKeyedOpUpdateOrCreate,
  kernelKeyedArrayEntriesIterate,
} from './collection/kernelKeyed';
import {
  DELETE,
  NOT_SET,
  IS_MAP_SYMBOL,
  SHAPE_MAP,
  ITERATOR_SYMBOL,
} from './const';
import { isMap } from './predicates/isMap';
import { isOrdered } from './predicates/isOrdered';
import transformToMethods from './transformToMethods';
import { assertNotInfinite, quoteString } from './utils';

class MapIterator extends Iterator {
  constructor(map, type, reverse) {
    super();

    this._type = type;
    this._reverse = reverse;
    this._stack = map._root && mapIteratorFrame(map._root);
  }

  next() {
    const type = this._type;
    let stack = this._stack;
    while (stack) {
      const node = stack.node;
      const index = stack.index++;
      let maxIndex;
      if (node.entry) {
        if (index === 0) {
          return mapIteratorValue(type, node.entry);
        }
      } else if (node.entries) {
        maxIndex = node.entries.length - 1;
        if (index <= maxIndex) {
          return mapIteratorValue(
            type,
            node.entries[this._reverse ? maxIndex - index : index]
          );
        }
      } else {
        maxIndex = node.nodes.length - 1;
        if (index <= maxIndex) {
          const subNode = node.nodes[this._reverse ? maxIndex - index : index];
          if (subNode) {
            if (subNode.entry) {
              return mapIteratorValue(type, subNode.entry);
            }
            stack = this._stack = mapIteratorFrame(subNode, stack);
          }
          continue;
        }
      }
      stack = this._stack = this._stack.__prev;
    }
    return iteratorDone();
  }
}

function mapIteratorValue(type, entry) {
  return iteratorValue(type, entry[0], entry[1]);
}

function mapIteratorFrame(node, prev) {
  return {
    node: node,
    index: 0,
    __prev: prev,
  };
}

const mapOpCreate = (m, value) => {
  return Map(value);
};

const mapOpToString = (m) => {
  return m.__toString('Map {', '}');
};

const mapOpGet = (m, k, notSetValue) => {
  return m._root ? m._root.get(0, undefined, k, notSetValue) : notSetValue;
};

// @pragma Modification

const mapOpSet = (m, k, v) => {
  return mapUpdate(m, k, v);
};

const mapOpRemove = (m, k) => {
  return mapUpdate(m, k, NOT_SET);
};

const mapOpDeleteAll = (m, keys) => {
  const collection = SeqWhenNotCollection(keys);

  if (collection.size === 0) {
    return m;
  }

  return collectionOpWithMutations(m, (map) => {
    collection.forEach((key) => map.remove(key));
  });
};

const mapOpClear = (m) => {
  if (m.size === 0) {
    return m;
  }
  if (m.__ownerID) {
    m.size = 0;
    m._root = null;
    m.__hash = undefined;
    m.__altered = true;
    return m;
  }
  return mapCreateEmpty();
};

const mapOpMap = (m, mapper, context) => {
  return collectionOpWithMutations(m, (map) => {
    map.forEach((value, key) => {
      map.set(key, mapper.call(context, value, key, m));
    });
  });
};

const mapOpIterator = (m, type, reverse) => {
  return new MapIterator(m, type, reverse);
};

const mapOpIterate = (m, fn, reverse) => {
  let iterations = 0;

  if (m._root) {
    if (m._root.nodetype === 'nodeHashArrayMap') {
      kernelKeyedArrayEntriesIterate(
        m._root,
        (entry) => {
          iterations++;
          return fn(entry[1], entry[0], m);
        },
        reverse
      );
    } else {
      m._root.iterate((entry) => {
        iterations++;
        return fn(entry[1], entry[0], m);
      }, reverse);
    }
  }

  return iterations;
};

const mapOpEnsureOwner = (m, ownerID) => {
  if (ownerID === m.__ownerID) {
    return m;
  }
  if (!ownerID) {
    if (m.size === 0) {
      return mapCreateEmpty();
    }
    m.__ownerID = ownerID;
    m.__altered = false;
    return m;
  }
  return mapCreate(m.size, m._root, ownerID, m.__hash);
};

const mapOpToStringMapper = (m, v, k) => {
  return quoteString(k) + ': ' + quoteString(v);
};

export const mapPropertiesCreate = ((cache) => () => {
  return (
    cache ||
    (cache = Object.assign(
      {},
      collectionKeyedPropertiesCreate(),
      transformToMethods({
        [IS_MAP_SYMBOL]: true,
        toJSON: collectionOpToObject,
        __toStringMapper: mapOpToStringMapper,
        create: mapOpCreate,
        toString: mapOpToString,
        get: mapOpGet,
        set: mapOpSet,
        remove: mapOpRemove,
        removeAll: mapOpDeleteAll,
        [DELETE]: mapOpRemove,
        deleteAll: mapOpDeleteAll,
        clear: mapOpClear,
        map: mapOpMap,
        wasAltered: collectionOpWasAltered,
        __iterator: mapOpIterator,
        __iterate: mapOpIterate,
        __ensureOwner: mapOpEnsureOwner,
      })
    ))
  );
})();

export const mapCreate = (size, root, ownerID, hash) => {
  const map = Object.create(mapPropertiesCreate());

  map[ITERATOR_SYMBOL] = map.entries;
  map.size = size;
  map._root = root;
  map.__ownerID = ownerID;
  map.__hash = hash;
  map.__altered = false;
  map.__shape = SHAPE_MAP;

  return map;
};

export function emptyMap() {
  return mapCreate(0);
}

function mapUpdate(map, k, v) {
  let newRoot;
  let newSize;
  if (!map._root) {
    if (v === NOT_SET) {
      return map;
    }
    newSize = 1;
    newRoot = kernelKeyedArrayMapCreate(map.__ownerID, [[k, v]]);
  } else {
    const didChangeSize = MakeRef();
    const didAlter = MakeRef();
    newRoot = kernelKeyedOpUpdateOrCreate(
      map._root,
      map.__ownerID,
      0,
      undefined,
      k,
      v,
      didChangeSize,
      didAlter
    );
    if (!didAlter.value) {
      return map;
    }
    newSize = map.size + (didChangeSize.value ? (v === NOT_SET ? -1 : 1) : 0);
  }
  if (map.__ownerID) {
    map.size = newSize;
    map._root = newRoot;
    map.__hash = undefined;
    map.__altered = true;
    return map;
  }
  return newRoot ? mapCreate(newSize, newRoot) : mapCreateEmpty();
}

export const mapCreateEmpty = () => mapCreate(0);

export const Map = (value) =>
  value === undefined || value === null
    ? mapCreateEmpty()
    : isMap(value) && !isOrdered(value)
      ? value
      : collectionOpWithMutations(mapCreateEmpty(), (map) => {
          const iter = KeyedSeq(value);

          assertNotInfinite(iter.size);

          collectionOpForEach(iter, (v, k) => mapUpdate(map, k, v));
        });

Map.isMap = isMap;
