import { NOT_SET, ensureSize, resolveBegin, returnTrue } from './TrieUtils';
import { imul, smi } from './Math';
import { is } from './is';
import { hash } from './Hash';
import {
  countByFactory,
  concatFactory,
  flatMapFactory,
  flattenFactory,
  FromEntriesSequence,
  groupByFactory,
  maxFactory,
  skipWhileFactory,
  sortFactory,
  reverseFactory,
  sliceFactory,
  partitionFactory,
  reify,
  ToIndexedSequence,
  ToKeyedSequence,
  filterFactory,
  zipWithFactory,
  takeWhileFactory,
  mapFactory,
  ToSetSequence,
} from './Operations';
import { isKeyed } from './predicates/isKeyed';
import { isIndexed } from './predicates/isIndexed';
import { isOrdered } from './predicates/isOrdered';
import arrCopy from './utils/arrCopy';
import deepEqual from './utils/deepEqual';
import assertNotInfinite from './utils/assertNotInfinite';
import { toJS } from './toJS';
import { OrderedMap } from './OrderedMap';
import { OrderedSet } from './OrderedSet';
import { Set } from './Set';
import { Map } from './Map';
import { ArraySeq, IndexedSeq } from './Seq';
import { List } from './List';
import { Stack } from './Stack';
import { ITERATE_ENTRIES, ITERATE_KEYS, ITERATE_VALUES } from './Iterator';

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
  const ordered = isOrdered(collection);
  const keyed = isKeyed(collection);
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

function reduce(collection, reducer, reduction, context, useFirst, reverse) {
  assertNotInfinite(collection.size);
  collection.__iterate((v, k, c) => {
    if (useFirst) {
      useFirst = false;
      reduction = v;
    } else {
      reduction = reducer.call(context, reduction, v, k, c);
    }
  }, reverse);
  return reduction;
}

function not(predicate) {
  return function () {
    return !predicate.apply(this, arguments);
  };
}

function neg(predicate) {
  return function () {
    return -predicate.apply(this, arguments);
  };
}

function defaultNegComparator(a, b) {
  return a < b ? 1 : a > b ? -1 : 0;
}

// #pragma Helper functions

function keyMapper(v, k) {
  return k;
}

function entryMapper(v, k) {
  return [k, v];
}

const collectionToArray = (collection) => {
  assertNotInfinite(collection.size);
  const array = new Array(collection.size || 0);
  const useTuples = isKeyed(collection);
  let i = 0;
  collection.__iterate((v, k) => {
    // Keyed collections produce an array of tuples.
    array[i++] = useTuples ? [k, v] : v;
  });
  return array;
};

const collectionSplice = (collection, index, removeNum, args) => {
  const numArgs =
    typeof index === 'undefined'
      ? 0
      : args.length
        ? 3
        : typeof removeNum === 'undefined'
          ? 1
          : 2;
  removeNum = Math.max(removeNum || 0, 0);
  if (numArgs === 0 || (numArgs === 2 && !removeNum)) {
    return collection;
  }
  // If index is negative, it should resolve relative to the size of the
  // collection. However size may be expensive to compute if not cached, so
  // only call count() if the number is in fact negative.
  index = resolveBegin(index, index < 0 ? collection.count() : collection.size);
  const spliced = collection.slice(0, index);
  return reify(
    collection,
    numArgs === 1
      ? spliced
      : spliced.concat(args, collection.slice(index + removeNum))
  );
};

const collectionInterleave = (collection, collections) => {
  const collectionsJoined = [collection].concat(arrCopy(collections));
  const zipped = zipWithFactory(
    collection.toSeq(),
    IndexedSeq.of,
    collectionsJoined
  );
  const interleaved = zipped.flatten(true);
  if (zipped.size) {
    interleaved.size = zipped.size * collectionsJoined.length;
  }
  return reify(collection, interleaved);
};

const collectionReduce = (collection, reducer, initialReduction, context) => {
  return reduce(
    collection,
    reducer,
    initialReduction,
    context,
    typeof initialReduction === 'undefined' && typeof context === 'undefined',
    false
  );
};

const collectionReduceRight = (
  collection,
  reducer,
  initialReduction,
  context
) => {
  return reduce(
    collection,
    reducer,
    initialReduction,
    context,
    typeof initialReduction === 'undefined' && typeof context === 'undefined',
    true
  );
};

const collectionFilter = (collection, predicate, context) => {
  return reify(collection, filterFactory(collection, predicate, context, true));
};

const collectionFindEntry = (collection, predicate, context, notSetValue) => {
  let found = notSetValue;
  collection.__iterate((v, k, c) => {
    if (predicate.call(context, v, k, c)) {
      found = [k, v];
      return false;
    }
  });
  return found;
};

const collectionTake = (collection, amount) => {
  return collection.slice(0, Math.max(0, amount));
};

const collectionTakeLast = (collection, amount) => {
  return collection.slice(-Math.max(0, amount));
};

const collectionTakeWhile = (collection, predicate, context) => {
  return reify(collection, takeWhileFactory(collection, predicate, context));
};

const collectionToIndexedSeq = (collection) => {
  return new ToIndexedSequence(collection);
};

const collectionToJS = toJS;

const collectionToKeyedSequence = (collection) => {
  return new ToKeyedSequence(collection, true);
};

const collectionToMap = (collection) => {
  // Use Late Binding here to solve the circular dependency.
  return Map(collectionToKeyedSequence(collection));
};

const collectionToOrderedMap = (collection) => {
  // Use Late Binding here to solve the circular dependency.
  return OrderedMap(collectionToKeyedSequence(collection));
};

const collectionValueSeq = (collection) => {
  return collection.toIndexedSeq();
};

const collectionToOrderedSet = (collection) => {
  // Use Late Binding here to solve the circular dependency.
  return OrderedSet(isKeyed(collection) ? collection.valueSeq() : collection);
};

const collectionToSet = (collection) => {
  // Use Late Binding here to solve the circular dependency.
  return Set(isKeyed(collection) ? collection.valueSeq() : collection);
};

const collectionToSetSeq = (collection) => {
  return new ToSetSequence(collection);
};

const collectionToSeq = (collection) => {
  return isIndexed(collection)
    ? collection.toIndexedSeq()
    : isKeyed(collection)
      ? collection.toKeyedSeq()
      : collection.toSetSeq();
};

const collectionToStack = (collection) => {
  // Use Late Binding here to solve the circular dependency.
  return Stack(isKeyed(collection) ? collection.valueSeq() : collection);
};

const collectionToList = (collection) => {
  // Use Late Binding here to solve the circular dependency.
  return List(isKeyed(collection) ? collection.valueSeq() : collection);
};

const collectionToStringDetails = (collection, head, tail) => {
  if (collection.size === 0) {
    return head + tail;
  }
  return (
    head +
    ' ' +
    collection.toSeq().map(collection.__toStringMapper).join(', ') +
    ' ' +
    tail
  );
};

const collectionConcat = (collection, values) => {
  return reify(collection, concatFactory(collection, values));
};

const collectionIncludes = (collection, searchValue) => {
  return collection.some((value) => is(value, searchValue));
};

const collectionEntries = (collection) => {
  return collection.__iterator(ITERATE_ENTRIES);
};

const collectionEvery = (collection, predicate, context) => {
  assertNotInfinite(collection.size);
  let returnValue = true;
  collection.__iterate((v, k, c) => {
    if (!predicate.call(context, v, k, c)) {
      returnValue = false;
      return false;
    }
  });
  return returnValue;
};

const collectionPartition = (collection, predicate, context) => {
  return partitionFactory(collection, predicate, context);
};

const collectionFind = (collection, predicate, context, notSetValue) => {
  const entry = collection.findEntry(predicate, context);
  return entry ? entry[1] : notSetValue;
};

const collectionForEach = (collection, sideEffect, context) => {
  assertNotInfinite(collection.size);
  return collection.__iterate(context ? sideEffect.bind(context) : sideEffect);
};

const collectionJoin = (collection, separator) => {
  assertNotInfinite(collection.size);
  separator = separator !== undefined ? '' + separator : ',';
  let joined = '';
  let isFirst = true;
  collection.__iterate((v) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions -- TODO enable eslint here
    isFirst ? (isFirst = false) : (joined += separator);
    joined += v !== null && v !== undefined ? v.toString() : '';
  });
  return joined;
};

const collectionKeys = (collection) => {
  return collection.__iterator(ITERATE_KEYS);
};

const collectionMap = (collection, mapper, context) => {
  return reify(collection, mapFactory(collection, mapper, context));
};

const collectionReverse = (collection) => {
  return reify(collection, reverseFactory(collection, true));
};

const collectionSlice = (collection, begin, end) => {
  return reify(collection, sliceFactory(collection, begin, end, true));
};

const collectionSome = (collection, predicate, context) => {
  assertNotInfinite(collection.size);
  let returnValue = false;
  collection.__iterate((v, k, c) => {
    if (predicate.call(context, v, k, c)) {
      returnValue = true;
      return false;
    }
  });
  return returnValue;
};

const collectionSort = (collection, comparator) => {
  return reify(collection, sortFactory(collection, comparator));
};

const collectionValues = (collection) => {
  return collection.__iterator(ITERATE_VALUES);
};

const collectionButLast = (collection) => {
  return collection.slice(0, -1);
};

const collectionIsEmpty = (collection) => {
  return collection.size !== undefined
    ? collection.size === 0
    : !collection.some(() => true);
};

const collectionCount = (collection, predicate, context) => {
  return ensureSize(
    predicate ? collection.toSeq().filter(predicate, context) : collection
  );
};

const collectionCountBy = (collection, grouper, context) => {
  return countByFactory(collection, grouper, context);
};

const collectionEquals = (collection, other) => {
  return deepEqual(collection, other);
};

const collectionEntrySeq = (collection) => {
  if (collection._cache) {
    // We cache as an entries array, so we can just return the cache!
    return new ArraySeq(collection._cache);
  }
  const entriesSequence = collection.toSeq().map(entryMapper).toIndexedSeq();
  entriesSequence.fromEntrySeq = () => collection.toSeq();
  return entriesSequence;
};

const collectionFilterNot = (collection, predicate, context) => {
  return collection.filter(not(predicate), context);
};

const collectionFindKey = (collection, predicate, context) => {
  const entry = collectionFindEntry(collection, predicate, context);

  return entry && entry[0];
};

const collectionFindLast = (collection, predicate, context, notSetValue) => {
  return collection
    .toKeyedSeq()
    .reverse()
    .find(predicate, context, notSetValue);
};

const collectionFindLastEntry = (
  collection,
  predicate,
  context,
  notSetValue
) => {
  return collection
    .toKeyedSeq()
    .reverse()
    .findEntry(predicate, context, notSetValue);
};

const collectionFindLastKey = (collection, predicate, context) => {
  return collection.toKeyedSeq().reverse().findKey(predicate, context);
};

const collectionFirst = (collection, notSetValue) => {
  return collection.find(returnTrue, null, notSetValue);
};

const collectionFlatMap = (collection, mapper, context) => {
  return reify(collection, flatMapFactory(collection, mapper, context));
};

const collectionFlatten = (collection, depth) => {
  return reify(collection, flattenFactory(collection, depth, true));
};

const collectionFromEntrySeq = (collection) => {
  return new FromEntriesSequence(collection);
};

const collectionGet = (collection, searchKey, notSetValue) => {
  return collection.find(
    (_, key) => is(key, searchKey),
    undefined,
    notSetValue
  );
};

const collectionGroupBy = (collection, grouper, context) => {
  return groupByFactory(collection, grouper, context);
};

const collectionHas = (collection, searchKey) => {
  return collection.get(searchKey, NOT_SET) !== NOT_SET;
};

const collectionIsSubset = (collection, iter, Collection) => {
  iter = typeof iter.includes === 'function' ? iter : Collection(iter);
  return collection.every((value) => iter.includes(value));
};

const collectionIsSuperset = (collection, iter, Collection) => {
  iter = typeof iter.isSubset === 'function' ? iter : Collection(iter);
  return iter.isSubset(collection);
};

const collectionKeyOf = (collection, searchValue) => {
  return collection.findKey((value) => is(value, searchValue));
};

const collectionKeySeq = (collection) => {
  return collection.toSeq().map(keyMapper).toIndexedSeq();
};

const collectionLast = (collection, notSetValue) => {
  return collection.toSeq().reverse().first(notSetValue);
};

const collectionLastKeyOf = (collection, searchValue) => {
  return collection.toKeyedSeq().reverse().keyOf(searchValue);
};

const collectionMax = (collection, comparator) => {
  return maxFactory(collection, comparator);
};

const collectionMaxBy = (collection, mapper, comparator) => {
  return maxFactory(collection, comparator, mapper);
};

const collectionMin = (collection, comparator) => {
  return maxFactory(
    collection,
    comparator ? neg(comparator) : defaultNegComparator
  );
};

const collectionMinBy = (collection, mapper, comparator) => {
  return maxFactory(
    collection,
    comparator ? neg(comparator) : defaultNegComparator,
    mapper
  );
};

const collectionRest = (collection) => {
  return collection.slice(1);
};

const collectionSkip = (collection, amount) => {
  return amount === 0 ? collection : collection.slice(Math.max(0, amount));
};

const collectionSkipLast = (collection, amount) => {
  return amount === 0 ? collection : collection.slice(0, -Math.max(0, amount));
};

const collectionSkipWhile = (collection, predicate, context) => {
  return reify(
    collection,
    skipWhileFactory(collection, predicate, context, true)
  );
};

const collectionSkipUntil = (collection, predicate, context) => {
  return collection.skipWhile(not(predicate), context);
};

const collectionSortBy = (collection, mapper, comparator) => {
  return reify(collection, sortFactory(collection, comparator, mapper));
};

const collectionTakeUntil = (collection, predicate, context) => {
  return collection.takeWhile(not(predicate), context);
};

const collectionHashCode = (collection) => {
  return collection.__hash || (collection.__hash = hashCollection(collection));
};

export {
  collectionToArray,
  collectionToIndexedSeq,
  collectionToJS,
  collectionToKeyedSequence,
  collectionToMap,
  collectionToOrderedMap,
  collectionValueSeq,
  collectionToOrderedSet,
  collectionToSet,
  collectionToSetSeq,
  collectionToSeq,
  collectionToStack,
  collectionToList,
  collectionToStringDetails,
  collectionConcat,
  collectionIncludes,
  collectionEntries,
  collectionEvery,
  collectionPartition,
  collectionFind,
  collectionForEach,
  collectionSplice,
  collectionInterleave,
  collectionReduce,
  collectionReduceRight,
  collectionFilter,
  collectionFindEntry,
  collectionTake,
  collectionTakeLast,
  collectionTakeWhile,
  collectionJoin,
  collectionKeys,
  collectionMap,
  collectionReverse,
  collectionSlice,
  collectionSort,
  collectionSome,
  collectionValues,
  collectionButLast,
  collectionIsEmpty,
  collectionCount,
  collectionCountBy,
  collectionEquals,
  collectionEntrySeq,
  collectionFilterNot,
  collectionFindKey,
  collectionFindLast,
  collectionFindLastEntry,
  collectionFindLastKey,
  collectionFirst,
  collectionFlatMap,
  collectionFlatten,
  collectionFromEntrySeq,
  collectionGet,
  collectionGroupBy,
  collectionHas,
  collectionIsSubset,
  collectionIsSuperset,
  collectionKeyOf,
  collectionKeySeq,
  collectionLast,
  collectionLastKeyOf,
  collectionMax,
  collectionMaxBy,
  collectionMin,
  collectionMinBy,
  collectionRest,
  collectionSkip,
  collectionSkipLast,
  collectionSkipWhile,
  collectionSkipUntil,
  collectionSortBy,
  collectionTakeUntil,
  collectionHashCode,
};
