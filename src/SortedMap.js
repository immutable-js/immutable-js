/**
 *  Copyright (c) 2017, Applitopia, Inc.
 *
 *  Modified source code is licensed under the MIT-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * Original source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { is } from './is';
import { KeyedCollection } from './Collection';
import { IS_SORTED_SYMBOL } from './predicates/isSorted';
import { isSortedMap } from './predicates/isSortedMap';
import { DELETE, NOT_SET, MakeRef, GetRef } from './TrieUtils';
import assertNotInfinite from './utils/assertNotInfinite';
import { sortFactory } from './Operations';
import { Map } from './Map';
import { KeyedSeq } from './Seq';
import { SortedMapBtreeNodeFactory } from './SortedMapBtreeNode';

export class SortedMap extends Map {
  // @pragma Construction

  constructor(value, comparator, options) {
    if (!comparator) {
      if (this instanceof SortedMap) {
        comparator = this.getComparator();
      }
      if (!comparator) {
        comparator = SortedMap.defaultComparator;
      }
    }
    if (!options) {
      if (this instanceof SortedMap) {
        options = this.getOptions();
      }
      if (!options) {
        options = SortedMap.defaultOptions;
      }
    }

    return value === null || value === undefined
      ? emptySortedMap(comparator, options)
      : isSortedMap(value) &&
        value.getComparator() === comparator &&
        value.getOptions() === options
      ? value
      : emptySortedMap(comparator, options).withMutations(map => {
          map.pack(value);
        });
  }

  static of(...keyValues) {
    return emptySortedMap().withMutations(map => {
      for (let i = 0; i < keyValues.length; i += 2) {
        if (i + 1 >= keyValues.length) {
          throw new Error('Missing value for key: ' + keyValues[i]);
        }
        map.set(keyValues[i], keyValues[i + 1]);
      }
    });
  }

  toString() {
    return this.__toString('SortedMap {', '}');
  }

  // @pragma Access

  getComparator() {
    return this._comparator;
  }

  getOptions() {
    return this._options;
  }

  get(k, notSetValue) {
    return this._root ? this._root.get(k, notSetValue) : notSetValue;
  }

  entryAt(index) {
    return this._root
      ? this._root.entryAt(index)
      : new Error('index is out of bounds');
  }

  keyAt(index) {
    return this._root
      ? this._root.keyAt(index)
      : new Error('index is out of bounds');
  }

  valueAt(index) {
    return this._root
      ? this._root.valueAt(index)
      : new Error('index is out of bounds');
  }

  // @pragma Modification

  clear() {
    if (this.size === 0) {
      return this;
    }
    if (this.__ownerID) {
      this.size = 0;
      this._root = null;
      this.__altered = true;
      return this;
    }
    return emptySortedMap(this._comparator, this._options);
  }

  pack(value) {
    let collection;
    if (value === undefined) {
      collection = this;
    } else {
      // Sort and deduplicate the entries
      let index = 0;
      const entries = KeyedCollection(value)
        .map((v, k) => [k, v, index++])
        .valueSeq()
        .toArray();
      if (entries.length === 0) {
        if (this.__ownerID) {
          this._root = undefined;
          (this.size = 0), (this.__altered = true);
          return this;
        }
        return emptySortedMap(this._comparator, this._options);
      }
      entries.sort((a, b) => this._comparator(a[0], b[0]) || a[2] - b[2]);
      const result = [];
      for (let i = 0, stop = entries.length - 1; i < stop; i++) {
        const entry = entries[i];
        const nextEntry = entries[i + 1];
        if (this._comparator(entry[0], nextEntry[0]) < 0) {
          const newEntry = [entry[0], entry[1]];
          result.push(newEntry);
        }
      }
      // push the last ownerID
      const entry = entries[entries.length - 1];
      const newEntry = [entry[0], entry[1]];
      result.push(newEntry);
      collection = KeyedSeq(result);
    }
    assertNotInfinite(collection.size);

    const newSize = collection.size;
    const newRoot = this._factory
      .createPacker()
      .pack(this._comparator, this._options, this.__ownerID, collection);

    if (this.__ownerID) {
      this._root = newRoot;
      (this.size = newSize), (this.__altered = true);
      return this;
    }
    return newRoot
      ? makeSortedMap(this._comparator, this._options, newSize, newRoot)
      : emptySortedMap(this._comparator, this._options);
  }

  set(k, v) {
    return updateMap(this, k, v);
  }

  remove(k) {
    return updateMap(this, k, NOT_SET);
  }

  fastRemove(k) {
    return updateMap(this, k, NOT_SET, true);
  }

  // @pragma Composition

  sort(comparator) {
    return SortedMap(this, comparator, this.getOptions());
  }

  sortBy(mapper, comparator) {
    return SortedMap(
      sortFactory(this, comparator, mapper),
      comparator,
      this.getOptions()
    );
  }

  // @pragma Mutability

  __iterator(type, reverse) {
    return this._factory.createIterator(this, type, reverse);
  }

  __ensureOwner(ownerID) {
    if (ownerID === this.__ownerID) {
      return this;
    }
    if (!ownerID) {
      if (this.size === 0) {
        return emptySortedMap(this._comparator, this._options);
      }
      this.__ownerID = ownerID;
      this.__altered = false;
      return this;
    }
    return makeSortedMap(
      this._comparator,
      this._options,
      this.size,
      this._root,
      ownerID
    );
  }

  checkConsistency(printFlag) {
    if (this._root) {
      if (!(this.size > 0)) {
        return 1;
      }
      return this._root.checkConsistency(printFlag);
    } else if (!(this.size === 0)) {
      return 2;
    }

    let n = 0;
    let prevKey;
    this.keySeq().forEach(key => {
      if (n && !(this._comparator(prevKey, key) < 0)) {
        return 3;
      }
      prevKey = key;
      n++;
    });

    if (this.size !== n) {
      return 4;
    }

    return 0;
  }

  print(maxDepth) {
    let header = 'SORTED MAP: size=' + this.size;
    if (this._options) {
      header = header + ', options=' + JSON.stringify(this._options);
    }
    // eslint-disable-next-line
    console.log(header);
    if (this._root) {
      this._root.print(1, maxDepth);
    }
    return this;
  }

  from(key, backwards) {
    const self = this;
    const sequence = Object.create(KeyedSeq).prototype;
    sequence.__iterateUncached = function (fn, reverse) {
      if (!self._root) {
        return 0;
      }

      let iterations = 0;
      if (backwards) {
        self._root.iterateFromBackwards(
          key,
          entry => {
            iterations++;
            return fn(entry[1], entry[0], this);
          },
          reverse
        );
      } else {
        self._root.iterateFrom(
          key,
          entry => {
            iterations++;
            return fn(entry[1], entry[0], this);
          },
          reverse
        );
      }

      return iterations;
    };

    return sequence;
  }

  fromIndex(index, backwards) {
    const self = this;
    const sequence = Object.create(KeyedSeq).prototype;
    sequence.__iterateUncached = function (fn, reverse) {
      if (reverse) {
        throw new Error('fromIndex: reverse mode not supported');
      }

      if (!self._root) {
        return 0;
      }

      let iterations = 0;
      if (backwards) {
        self._root.iterateFromIndexBackwards(
          index,
          entry => {
            iterations++;
            return fn(entry[1], entry[0], this);
          },
          reverse
        );
      } else {
        self._root.iterateFromIndex(
          index,
          entry => {
            iterations++;
            return fn(entry[1], entry[0], this);
          },
          reverse
        );
      }

      return iterations;
    };

    return sequence;
  }
}

SortedMap.isSortedMap = isSortedMap;

SortedMap.defaultComparator = defaultComparator;
SortedMap.defaultOptions = {
  type: 'btree',
};

export const SortedMapPrototype = SortedMap.prototype;
SortedMapPrototype[IS_SORTED_SYMBOL] = true;
SortedMapPrototype[DELETE] = SortedMapPrototype.remove;
SortedMapPrototype.removeIn = SortedMapPrototype.deleteIn;
SortedMapPrototype.removeAll = SortedMapPrototype.deleteAll;

function makeSortedMap(comparator, options, size, root, ownerID) {
  const map = Object.create(SortedMapPrototype);
  map._comparator = comparator || SortedMap.defaultComparator;
  map._options = options || SortedMap.defaultOptions;
  map.size = size;
  map._root = root;
  map._factory = SortedMap.getFactory(map._options);
  map.__ownerID = ownerID;
  map.__altered = false;

  if (map._options.btreeOrder && map._options.btreeOrder < 3) {
    throw new Error(
      'SortedMap: minimum value of options.btreeOrder is 3, but got: ' +
        map._options.btreeOrder
    );
  }

  if (!map._factory) {
    throw new Error('SortedMap type not supported: ' + map._options.type);
  }

  return map;
}

let DEFAULT_EMPTY_MAP;
export function emptySortedMap(comparator, options) {
  if (
    comparator === SortedMap.defaultComparator &&
    options === SortedMap.defaultOptions
  ) {
    return (
      DEFAULT_EMPTY_MAP ||
      (DEFAULT_EMPTY_MAP = makeSortedMap(
        SortedMap.defaultComparator,
        SortedMap.defaultOptions,
        0
      ))
    );
  }
  return makeSortedMap(comparator, options, 0);
}

function updateMap(map, k, v, fast) {
  const remove = v === NOT_SET;
  const root = map._root;
  let newRoot;
  let newSize;
  if (!root) {
    if (remove) {
      return map;
    }
    newSize = 1;
    const entries = [[k, v]];
    newRoot = map._factory.createNode(
      map._comparator,
      map._options,
      map.__ownerID,
      entries
    );
  } else {
    const didChangeSize = MakeRef();
    const didAlter = MakeRef();

    if (remove) {
      if (fast) {
        newRoot = map._root.fastRemove(
          map.__ownerID,
          k,
          didChangeSize,
          didAlter
        );
      } else {
        newRoot = map._root.remove(map.__ownerID, k, didChangeSize, didAlter);
      }
    } else {
      newRoot = map._root.upsert(map.__ownerID, k, v, didChangeSize, didAlter);
    }
    if (!GetRef(didAlter)) {
      return map;
    }
    newSize = map.size + (GetRef(didChangeSize) ? (remove ? -1 : 1) : 0);
    if (newSize === 0) {
      newRoot = undefined;
    }
  }
  if (map.__ownerID) {
    map.size = newSize;
    map._root = newRoot;
    map.__altered = true;
    return map;
  }
  return newRoot
    ? makeSortedMap(map._comparator, map._options, newSize, newRoot)
    : emptySortedMap(map._comparator, map._options);
}

export function defaultComparator(a, b) {
  if (is(a, b)) {
    return 0;
  }

  const ta = typeof a;
  const tb = typeof b;

  if (ta !== tb) {
    return ta < tb ? -1 : 1;
  }

  switch (ta) {
    case 'undefined':
      // we should not get here and is above should take care of this case
      break;
    case 'object':
      // Take care of null cases then convert objects to strings
      if (a === null) {
        return 1;
      }
      if (b === null) {
        return -1;
      }
      a = a.toString();
      b = b.toString();
      break;
    case 'boolean':
      // default comparisons work
      break;
    case 'number':
      // take care of NaN
      if (is(a, NaN)) {
        return 1;
      }
      if (is(b, NaN)) {
        return -1;
      }
      // for all other cases the
      // default comparisons work
      break;
    case 'string':
      // default comparisons work
      break;
    case 'symbol':
      // convert symbols to strings
      a = a.toString();
      b = b.toString();
      break;
    case 'function':
      // convert functions to strings
      a = a.toString();
      b = b.toString();
      break;
    default:
      // we should not get here as all types are covered
      break;
  }

  return a < b ? -1 : a > b ? 1 : 0;
}

//
// Register all the factories
//
SortedMap.getFactory = function (options) {
  const type =
    options && options.type ? options.type : SortedMap.defaultOptions.type;

  return SortedMap.factories[type];
};

SortedMap.factories = {
  btree: new SortedMapBtreeNodeFactory(),
};
