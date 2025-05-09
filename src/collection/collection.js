import transformToMethods from '../transformToMethods';

import { returnTrue, ensureSize, wrapIndex, OwnerID } from '../TrieUtils';

import {
  utilCopyShallow,
  utilQuoteString,
  utilHasOwnProperty,
  utilAssertNotInfinite,
} from '../util';

import {
  NOT_SET,
  IS_COLLECTION_SYMBOL,
  ITERATE_VALUES,
  ITERATE_ENTRIES,
  ITERATE_KEYS,
  ITERATOR_SYMBOL,
} from '../const';

import {
  probeIsSame,
  probeIsImmutable,
  probeIsOrdered,
  probeIsKeyed,
  probeIsDataStructure,
  probeIsSameDeep,
  probeCoerceKeyPath,
} from '../probe';

import { factoryMax } from '../factory/factoryMax';

import { imul, smi } from '../Math';
import { hash } from '../Hash';

function neg(predicate) {
  return function () {
    return -predicate.apply(this, arguments);
  };
}

const collectionReduce = (
  cx,
  reducer,
  reduction,
  context,
  useFirst,
  reverse
) => {
  utilAssertNotInfinite(cx.size);
  cx.__iterate((v, k, c) => {
    if (useFirst) {
      useFirst = false;
      reduction = v;
    } else {
      reduction = reducer.call(context, reduction, v, k, c);
    }
  }, reverse);
  return reduction;
};

function hashMerge(a, b) {
  return (a ^ (b + 0x9e3779b9 + (a << 6) + (a >> 2))) | 0; // int
}

function murmurHashOfSize(size, h) {
  h = imul(h, 0xcc9e2d51);
  h = imul((h << 15) | (h >>> -15), 0x1b873593);
  h = imul((h << 13) | (h >>> -13), 5);
  h = ((h + 0xe6546b64) | 0) ^ size;
  h = imul(h ^ (h >>> 16), 0x85ebca6b);
  h = imul(h ^ (h >>> 13), 0xc2b2ae35);
  h = smi(h ^ (h >>> 16));
  return h;
}

function hashCollection(collection) {
  if (collection.size === Infinity) {
    return 0;
  }
  const ordered = probeIsOrdered(collection);
  const keyed = probeIsKeyed(collection);
  let h = ordered ? 1 : 0;

  collection.__iterate(
    keyed
      ? ordered
        ? (v, k) => {
            h = (31 * h + hashMerge(hash(v), hash(k))) | 0;
          }
        : (v, k) => {
            h = (h + hashMerge(hash(v), hash(k))) | 0;
          }
      : ordered
        ? (v) => {
            h = (31 * h + hash(v)) | 0;
          }
        : (v) => {
            h = (h + hash(v)) | 0;
          }
  );

  return murmurHashOfSize(collection.size, h);
}

const collectionOpSize = (cx) => {
  return cx._values.size;
};

const collectionOpRest = (cx) => {
  return cx.slice(1);
};

const collectionOpReduce = (cx, reducer, initialReduction, context) => {
  return collectionReduce(
    cx,
    reducer,
    initialReduction,
    context,
    typeof initialReduction === 'undefined' && typeof context === 'undefined',
    false
  );
};

const collectionOpReduceRight = (cx, reducer, initialReduction, context) => {
  return collectionReduce(
    cx,
    reducer,
    initialReduction,
    context,
    typeof initialReduction === 'undefined' && typeof context === 'undefined',
    true
  );
};

const collectionOpKeys = (cx) => {
  return cx.__iterator(ITERATE_KEYS);
};

const collectionOpKeySeq = (cx) => {
  return cx
    .toSeq()
    .map((v, k) => k)
    .toIndexedSeq();
};

const collectionOpToStringMapper = (cx, value) => {
  return utilQuoteString(value);
};

const collectionOpToArray = (cx) => {
  utilAssertNotInfinite(cx.size);
  const array = new Array(cx.size || 0);
  const useTuples = probeIsKeyed(cx);

  let i = 0;
  cx.__iterate((v, k) => {
    array[i++] = useTuples ? [k, v] : v;
  });
  return array;
};

const collectionOpToJSON = (cx) => {
  return cx.toArray();
};

const collectionOpIndexedHas = (cx, index) => {
  index = wrapIndex(cx, index);
  return (
    index >= 0 &&
    (cx.size !== undefined
      ? cx.size === Infinity || index < cx.size
      : cx.indexOf(index) !== -1)
  );
};

const collectionOpIndexedFindIndex = (cx, predicate, context) => {
  const entry = cx.findEntry(predicate, context);
  return entry ? entry[0] : -1;
};

const collectionOpIndexedIndexOf = (cx, searchValue) => {
  const key = cx.keyOf(searchValue);
  return key === undefined ? -1 : key;
};

const collectionOpIndexedLastIndexOf = (cx, searchValue) => {
  const key = cx.lastKeyOf(searchValue);
  return key === undefined ? -1 : key;
};

// ### More collection methods

const collectionOpIndexedFindLastIndex = (cx, predicate, context) => {
  const entry = cx.findLastEntry(predicate, context);
  return entry ? entry[0] : -1;
};

const collectionOpFirst = (cx, notSetValue) => {
  return cx.find(returnTrue, null, notSetValue);
};

const collectionOpIndexedFirst = (cx, notSetValue) => {
  return cx.get(0, notSetValue);
};

const collectionOpIndexedGet = (cx, index, notSetValue) => {
  index = wrapIndex(cx, index);
  return index < 0 ||
    cx.size === Infinity ||
    (cx.size !== undefined && index > cx.size)
    ? notSetValue
    : cx.find((_, key) => key === index, undefined, notSetValue);
};

const collectionOpIndexedKeySeq = (cx) => {
  return Range(0, cx.size);
};

const collectionOpIndexedLast = (cx, notSetValue) => {
  return cx.get(-1, notSetValue);
};

const collectionOpSome = (cx, predicate, context) => {
  utilAssertNotInfinite(cx.size);
  let returnValue = false;
  cx.__iterate((v, k, c) => {
    if (predicate.call(context, v, k, c)) {
      returnValue = true;
      return false;
    }
  });
  return returnValue;
};

const collectionOpEvery = (cx, predicate, context) => {
  utilAssertNotInfinite(cx.size);
  let returnValue = true;
  cx.__iterate((v, k, c) => {
    if (!predicate.call(context, v, k, c)) {
      returnValue = false;
      return false;
    }
  });
  return returnValue;
};

const collectionOpForEach = (cx, sideEffect, context) => {
  utilAssertNotInfinite(cx.size);

  return cx.__iterate(context ? sideEffect.bind(context) : sideEffect);
};

const collectionOpFindEntry = (cx, predicate, context, notSetValue) => {
  let found = notSetValue;
  cx.__iterate((v, k, c) => {
    if (predicate.call(context, v, k, c)) {
      found = [k, v];
      return false;
    }
  });
  return found;
};

const collectionOpFindLast = (cx, predicate, context, notSetValue) => {
  return cx.toKeyedSeq().reverse().find(predicate, context, notSetValue);
};

const collectionOpFindLastEntry = (cx, predicate, context, notSetValue) => {
  return cx.toKeyedSeq().reverse().findEntry(predicate, context, notSetValue);
};

const collectionOpFindLastKey = (cx, predicate, context) => {
  return cx.toKeyedSeq().reverse().findKey(predicate, context);
};

const collectionOpFind = (cx, predicate, context, notSetValue) => {
  const entry = collectionOpFindEntry(cx, predicate, context);
  return entry ? entry[1] : notSetValue;
};

const collectionOpFindKey = (cx, predicate, context) => {
  const entry = collectionOpFindEntry(cx, predicate, context);

  return entry && entry[0];
};

const collectionOpTake = (cx, amount) => {
  return cx.slice(0, Math.max(0, amount));
};

const collectionOpTakeLast = (cx, amount) => {
  return cx.slice(-Math.max(0, amount));
};

const collectionOpButLast = (cx) => {
  return cx.slice(0, -1);
};

const collectionOpIsEmpty = (cx) => {
  return cx.size !== undefined ? cx.size === 0 : !cx.some(() => true);
};

const collectionOpGet = (cx, searchKey, notSetValue) => {
  return collectionOpFind(
    cx,
    (_, key) => probeIsSame(key, searchKey),
    undefined,
    notSetValue
  );
};

/**
 * Returns the value within the provided collection associated with the
 * provided key, or notSetValue if the key is not defined in the collection.
 *
 * A functional alternative to `collection.get(key)` which will also work on
 * plain Objects and Arrays as an alternative for `collection[key]`.
 *
 * <!-- runkit:activate -->
 * ```js
 * import { get } from 'immutable';
 *
 * get([ 'dog', 'frog', 'cat' ], 1) // 'frog'
 * get({ x: 123, y: 456 }, 'x') // 123
 * get({ x: 123, y: 456 }, 'z', 'ifNotSet') // 'ifNotSet'
 * ```
 */
const collectionOrAnyOpGet = (collection, key, notSetValue) => {
  return probeIsImmutable(collection)
    ? collection.get(key, notSetValue)
    : !collectionOrAnyOpHas(collection, key)
      ? notSetValue
      : // @ts-expect-error weird "get" here,
        typeof collection.get === 'function'
        ? // @ts-expect-error weird "get" here,
          collection.get(key)
        : // @ts-expect-error key is unknown here,
          collection[key];
};

/**
 * Returns the value at the provided key path starting at the provided
 * collection, or notSetValue if the key path is not defined.
 *
 * A functional alternative to `collection.getIn(keypath)` which will also
 * work with plain Objects and Arrays.
 *
 * <!-- runkit:activate -->
 * ```js
 * import { getIn } from 'immutable';
 *
 * getIn({ x: { y: { z: 123 }}}, ['x', 'y', 'z']) // 123
 * getIn({ x: { y: { z: 123 }}}, ['x', 'q', 'p'], 'ifNotSet') // 'ifNotSet'
 * ```
 */
const collectionOrAnyOpGetIn = (cx, searchKeyPath, notSetValue) => {
  const keyPath = probeCoerceKeyPath(searchKeyPath);
  let i = 0;
  while (i !== keyPath.length) {
    // @ts-expect-error keyPath[i++] can not be undefined by design
    cx = collectionOrAnyOpGet(cx, keyPath[i++], NOT_SET);
    if (cx === NOT_SET) {
      return notSetValue;
    }
  }
  return cx;
};

/**
 * Returns true if the key is defined in the provided collection.
 *
 * A functional alternative to `collection.has(key)` which will also work with
 * plain Objects and Arrays as an alternative for
 * `collection.hasOwnProperty(key)`.
 *
 * <!-- runkit:activate -->
 * ```js
 * import { has } from 'immutable';
 *
 * has([ 'dog', 'frog', 'cat' ], 2) // true
 * has([ 'dog', 'frog', 'cat' ], 5) // false
 * has({ x: 123, y: 456 }, 'x') // true
 * has({ x: 123, y: 456 }, 'z') // false
 * ```
 */

const collectionOrAnyOpHas = (collection, key) => {
  return probeIsImmutable(collection)
    ? // @ts-expect-error key might be a number or symbol, which is not handled be Record key type
      collection.has(key)
    : // @ts-expect-error key might be anything else than PropertyKey, and will return false in that case but runtime is OK
      probeIsDataStructure(collection) &&
        utilHasOwnProperty.call(collection, key);
};

const collectionOpHas = (cx, searchKey) => {
  return collectionOpGet(cx, searchKey, NOT_SET) !== NOT_SET;
};

/**
 * Returns true if the key path is defined in the provided collection.
 *
 * A functional alternative to `collection.hasIn(keypath)` which will also
 * work with plain Objects and Arrays.
 *
 * <!-- runkit:activate -->
 * ```js
 * import { hasIn } from 'immutable';
 *
 * hasIn({ x: { y: { z: 123 }}}, ['x', 'y', 'z']) // true
 * hasIn({ x: { y: { z: 123 }}}, ['x', 'q', 'p']) // false
 * ```
 */
const collectionOrAnyOpHasIn = (cx, keyPath) => {
  return collectionOrAnyOpGetIn(cx, keyPath, NOT_SET) !== NOT_SET;
};

const collectionOpKeyOf = (cx, searchValue) => {
  return cx.findKey((value) => probeIsSame(value, searchValue));
};

/**
 * Returns a copy of the collection with the value at key set to the provided
 * value.
 *
 * A functional alternative to `collection.set(key, value)` which will also
 * work with plain Objects and Arrays as an alternative for
 * `collectionCopy[key] = value`.
 *
 * <!-- runkit:activate -->
 * ```js
 * import { set } from 'immutable';
 *
 * const originalArray = [ 'dog', 'frog', 'cat' ]
 * set(originalArray, 1, 'cow') // [ 'dog', 'cow', 'cat' ]
 * console.log(originalArray) // [ 'dog', 'frog', 'cat' ]
 * const originalObject = { x: 123, y: 456 }
 * set(originalObject, 'x', 789) // { x: 789, y: 456 }
 * console.log(originalObject) // { x: 123, y: 456 }
 * ```
 */
const collectionOrAnyOpSet = (cx, key, value) => {
  if (!probeIsDataStructure(cx)) {
    throw new TypeError(
      'Cannot update non-data-structure value: ' + cx
    );
  }
  if (probeIsImmutable(cx)) {
    // @ts-expect-error weird "set" here,
    if (!cx.set) {
      throw new TypeError(
        'Cannot update immutable value without .set() method: ' +
          (cx._toString ? cx._toString() : cx)
      );
    }
    // @ts-expect-error weird "set" here,
    return cx.set(key, value);
  }
  // @ts-expect-error mix of key and string here. Probably need a more fine type here
  if (utilHasOwnProperty.call(cx, key) && value === cx[key]) {
    return cx;
  }
  const collectionCopy = utilCopyShallow(cx);
  // @ts-expect-error mix of key and string here. Probably need a more fine type here
  collectionCopy[key] = value;
  return collectionCopy;
};

/**
 * Returns a copy of the collection with the value at key removed.
 *
 * A functional alternative to `collection.remove(key)` which will also work
 * with plain Objects and Arrays as an alternative for
 * `delete collectionCopy[key]`.
 *
 * <!-- runkit:activate -->
 * ```js
 * import { remove } from 'immutable';
 *
 * const originalArray = [ 'dog', 'frog', 'cat' ]
 * remove(originalArray, 1) // [ 'dog', 'cat' ]
 * console.log(originalArray) // [ 'dog', 'frog', 'cat' ]
 * const originalObject = { x: 123, y: 456 }
 * remove(originalObject, 'x') // { y: 456 }
 * console.log(originalObject) // { x: 123, y: 456 }
 * ```
 */
const collectionOrAnyOpRemove = (cx, key) => {
  if (!probeIsDataStructure(cx)) {
    throw new TypeError(
      'Cannot update non-data-structure value: ' + cx
    );
  }
  if (probeIsImmutable(cx)) {
    // @ts-expect-error weird "remove" here,
    if (!cx.remove) {
      throw new TypeError(
        'Cannot update immutable value without .remove() method: ' + cx
      );
    }
    // @ts-expect-error weird "remove" here,
    return cx.remove(key);
  }
  if (!utilHasOwnProperty.call(cx, key)) {
    return cx;
  }
  const collectionCopy = utilCopyShallow(cx);
  if (Array.isArray(collectionCopy)) {
    // @ts-expect-error assert that key is a number here
    collectionCopy.splice(key, 1);
  } else {
    delete collectionCopy[key];
  }
  return collectionCopy;
};

const collectionOpToObject = (cx) => {
  utilAssertNotInfinite(cx.size);
  const object = {};
  cx.__iterate((v, k) => {
    object[k] = v;
  });
  return object;
};

const collectionOpToStringDetails = (cx, head, tail) => {
  if (cx.size === 0) {
    return head + tail;
  }
  return (
    head + ' ' + cx.toSeq().map(cx.__toStringMapper).join(', ') + ' ' + tail
  );
};

function defaultNegComparator(a, b) {
  return a < b ? 1 : a > b ? -1 : 0;
}

const collectionOpMax = (cx, comparator) => {
  return factoryMax(cx, comparator);
};

const collectionOpMaxBy = (cx, mapper, comparator) => {
  return factoryMax(cx, comparator, mapper);
};

const collectionOpMin = (cx, comparator) => {
  return factoryMax(cx, comparator ? neg(comparator) : defaultNegComparator);
};

const collectionOpMinBy = (cx, mapper, comparator) => {
  return factoryMax(
    cx,
    comparator ? neg(comparator) : defaultNegComparator,
    mapper
  );
};

const collectionOpJoin = (cx, separator) => {
  utilAssertNotInfinite(cx.size);
  separator = separator !== undefined ? '' + separator : ',';
  let joined = '';
  let isFirst = true;
  cx.__iterate((v) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions -- TODO enable eslint here
    isFirst ? (isFirst = false) : (joined += separator);
    joined += v !== null && v !== undefined ? v.toString() : '';
  });
  return joined;
};

const collectionOpCount = (cx, predicate, context) => {
  return ensureSize(predicate ? cx.toSeq().filter(predicate, context) : cx);
};

const collectionOpWasAltered = (cx) => {
  return cx.__altered;
};

const collectionOpAsMutable = (cx) => {
  return cx.__ownerID ? cx : cx.__ensureOwner(new OwnerID());
};

const collectionOpAsImmutable = (cx) => {
  return cx.__ensureOwner();
};

const collectionOpWithMutations = (cx, fn) => {
  const mutable = collectionOpAsMutable(cx);
  fn(mutable);
  return mutable.wasAltered() ? mutable.__ensureOwner(cx.__ownerID) : cx;
};

const collectionOpSkip = (cx, amount) => {
  return amount === 0 ? cx : cx.slice(Math.max(0, amount));
};

const collectionOpSkipLast = (cx, amount) => {
  return amount === 0 ? cx : cx.slice(0, -Math.max(0, amount));
};

const collectionOpValues = (collection) => {
  return collection.__iterator(ITERATE_VALUES);
};

const collectionOpEquals = (cx, other) => {
  return probeIsSameDeep(cx, other);
};

const collectionOpEntries = (collection) => {
  return collection.__iterator(ITERATE_ENTRIES);
};

const collectionOpIncludes = (cx, searchValue) => {
  return cx.some((value) => probeIsSame(value, searchValue));
};

const collectionOpInspect = (cx) => {
  return cx.toString();
};

const collectionOpHashCode = (cx) => {
  return cx.__hash || (cx.__hash = hashCollection(cx));
};

const collectionOpCache = (cx) => {
  if (!cx._cache && cx.__iterateUncached) {
    cx._cache = cx.entrySeq().toArray();
    cx.size = cx._cache.length;
  }
  return cx;
};

const collectionOpCacheResultThrough = (cx) => {
  if (cx._iter.cacheResult) {
    cx._iter.cacheResult();
    cx.size = cx._iter.size;
    return cx;
  }

  // WARNING tests do not cover this area!
  return collectionOpCache(cx);
};

const collectionPropertiesCreate = ((cache) => () => {
  cache =
    cache ||
    (cache = transformToMethods({
      [IS_COLLECTION_SYMBOL]: true,
      toArray: collectionOpToArray,
      forEach: collectionOpForEach,
      values: collectionOpValues,
      join: collectionOpJoin,
      toJSON: collectionOpToJSON,
      inspect: collectionOpInspect,
      toSource: collectionOpInspect,
      min: collectionOpMin,
      minBy: collectionOpMinBy,
      max: collectionOpMax,
      maxBy: collectionOpMaxBy,
      reduceRight: collectionOpReduceRight,
      keyOf: collectionOpKeyOf,
      first: collectionOpFirst,
      find: collectionOpFind,
      findKey: collectionOpFindKey,
      findEntry: collectionOpFindEntry,
      findLast: collectionOpFindLast,
      findLastEntry: collectionOpFindLastEntry,
      findLastKey: collectionOpFindLastKey,
      isEmpty: collectionOpIsEmpty,
      some: collectionOpSome,
      count: collectionOpCount,
      entries: collectionOpEntries,
      skip: collectionOpSkip,
      skipLast: collectionOpSkipLast,
      equals: collectionOpEquals,
      hashCode: collectionOpHashCode,
      toObject: collectionOpToObject,
      get: collectionOpGet,
      every: collectionOpEvery,
      includes: collectionOpIncludes,
      keySeq: collectionOpKeySeq,
      keys: collectionOpKeys,
      getIn: collectionOrAnyOpGetIn,
      hasIn: collectionOrAnyOpHasIn,
      has: collectionOpHas,
      asImmutable: collectionOpAsImmutable,
      asMutable: collectionOpAsMutable,
      withMutations: collectionOpWithMutations,
      rest: collectionOpRest,
      butLast: collectionOpButLast,
      reduce: collectionOpReduce,
      __toString: collectionOpToStringDetails,
      __toStringMapper: collectionOpToStringMapper,
    }));

  // existing tests require ref-equal
  // cx.keys, cx.values, cx[ITERATOR_SYMBOL]
  // ```
  // expect(l[Symbol.iterator]).toBe(l.values);
  // ```
  cache[ITERATOR_SYMBOL] = cache.values;

  return cache;
})();

export {
  collectionOrAnyOpSet,
  collectionOrAnyOpGet,
  collectionOrAnyOpGetIn,
  collectionOrAnyOpHas,
  collectionOrAnyOpHasIn,
  collectionOrAnyOpRemove,
  collectionOpCache,
  collectionOpCacheResultThrough,
  collectionOpToObject,
  collectionOpGet,
  collectionOpHas,
  collectionOpMax,
  collectionOpMaxBy,
  collectionOpMin,
  collectionOpMinBy,
  collectionOpWithMutations,
  collectionOpWasAltered,
  collectionOpAsMutable,
  collectionOpAsImmutable,
  collectionOpToArray,
  collectionOpToStringMapper,
  collectionOpInspect,
  collectionOpIncludes,
  collectionOpFindEntry,
  collectionOpFindKey,
  collectionOpForEach,
  collectionOpToStringDetails,
  collectionOpFind,
  collectionOpFindLast,
  collectionOpFindLastEntry,
  collectionOpFindLastKey,
  collectionOpSize,
  collectionOpRest,
  collectionOpEvery,
  collectionOpSome,
  collectionOpReduce,
  collectionOpReduceRight,
  collectionOpKeys,
  collectionOpKeySeq,
  collectionOpIsEmpty,
  collectionOpKeyOf,
  collectionOpTake,
  collectionOpTakeLast,
  collectionOpSkip,
  collectionOpSkipLast,
  collectionOpValues,
  collectionOpEntries,
  collectionOpEquals,
  collectionOpJoin,
  collectionOpCount,
  collectionOpButLast,
  collectionPropertiesCreate,
  collectionOpIndexedFindIndex,
  collectionOpIndexedIndexOf,
  collectionOpIndexedLastIndexOf,
  collectionOpIndexedFindLastIndex,
  collectionOpIndexedFirst,
  collectionOpIndexedGet,
  collectionOpIndexedHas,
  collectionOpIndexedKeySeq,
  collectionOpIndexedLast,
};
