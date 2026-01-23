import {
  Iterator,
  iteratorValue,
  ITERATE_VALUES,
  ITERATE_ENTRIES,
} from '../Iterator';
import { NOT_SET } from '../const';
import { isIndexed } from '../predicates/isIndexed';
import { isKeyed } from '../predicates/isKeyed';
import { isOrdered } from '../predicates/isOrdered';

const factoryCountBy = (cx, grouper, context, mapCreate) => {
  const groups = mapCreate().asMutable();
  cx.__iterate((v, k) => {
    groups.update(grouper.call(context, v, k, cx), 0, (a) => a + 1);
  });
  return groups.asImmutable();
};

const factoryGroupBy = (
  cx,
  Map,
  OrderedMap,
  reify,
  collectionClass,
  grouper,
  context
) => {
  const isKeyedIter = isKeyed(cx);
  const groups = (isOrdered(cx) ? OrderedMap() : Map()).asMutable();
  cx.__iterate((v, k) => {
    groups.update(
      grouper.call(context, v, k, cx),
      (a) => ((a = a || []), a.push(isKeyedIter ? [k, v] : v), a)
    );
  });
  const coerce = collectionClass(cx);
  return groups.map((arr) => reify(cx, coerce(arr))).asImmutable();
};

const factoryInterpose = (collection, makeSequence, separator) => {
  const interposedSequence = makeSequence(collection);
  interposedSequence.size = collection.size && collection.size * 2 - 1;
  interposedSequence.__iterateUncached = function (fn, reverse) {
    let iterations = 0;
    collection.__iterate(
      (v) =>
        (!iterations || fn(separator, iterations++, this) !== false) &&
        fn(v, iterations++, this) !== false,
      reverse
    );
    return iterations;
  };
  interposedSequence.__iteratorUncached = function (type, reverse) {
    const iterator = collection.__iterator(ITERATE_VALUES, reverse);
    let iterations = 0;
    let step;
    return new Iterator(() => {
      if (!step || iterations % 2) {
        step = iterator.next();
        if (step.done) {
          return step;
        }
      }
      return iterations % 2
        ? iteratorValue(type, iterations++, separator)
        : iteratorValue(type, iterations++, step.value, step);
    });
  };
  return interposedSequence;
};

const factoryPartition = (
  collection,
  collectionClass,
  reify,
  predicate,
  context
) => {
  const isKeyedIter = isKeyed(collection);
  const groups = [[], []];
  collection.__iterate((v, k) => {
    groups[predicate.call(context, v, k, collection) ? 1 : 0].push(
      isKeyedIter ? [k, v] : v
    );
  });
  const coerce = collectionClass(collection);
  return groups.map((arr) => reify(collection, coerce(arr)));
};

const factoryFilter = (
  collection,
  makeSequence,
  predicate,
  context,
  useKeys
) => {
  const filterSequence = makeSequence(collection);
  if (useKeys) {
    filterSequence.has = (key) => {
      const v = collection.get(key, NOT_SET);
      return v !== NOT_SET && !!predicate.call(context, v, key, collection);
    };
    filterSequence.get = (key, notSetValue) => {
      const v = collection.get(key, NOT_SET);
      return v !== NOT_SET && predicate.call(context, v, key, collection)
        ? v
        : notSetValue;
    };
  }
  filterSequence.__iterateUncached = function (fn, reverse) {
    let iterations = 0;
    collection.__iterate((v, k, c) => {
      if (predicate.call(context, v, k, c)) {
        iterations++;
        return fn(v, useKeys ? k : iterations - 1, this);
      }
    }, reverse);
    return iterations;
  };
  filterSequence.__iteratorUncached = function (type, reverse) {
    const iterator = collection.__iterator(ITERATE_ENTRIES, reverse);
    let iterations = 0;
    return new Iterator(() => {
      while (true) {
        const step = iterator.next();
        if (step.done) {
          return step;
        }
        const entry = step.value;
        const key = entry[0];
        const value = entry[1];
        if (predicate.call(context, value, key, collection)) {
          return iteratorValue(type, useKeys ? key : iterations++, value, step);
        }
      }
    });
  };
  return filterSequence;
};

function defaultComparator(a, b) {
  if (a === undefined && b === undefined) {
    return 0;
  }

  if (a === undefined) {
    return 1;
  }

  if (b === undefined) {
    return -1;
  }

  return a > b ? 1 : a < b ? -1 : 0;
}

const factorySort = (
  collection,
  KeyedSeq,
  IndexedSeq,
  SetSeq,
  comparator,
  mapper
) => {
  if (!comparator) {
    comparator = defaultComparator;
  }
  const isKeyedCollection = isKeyed(collection);
  let index = 0;
  const entries = collection
    .toSeq()
    .map((v, k) => [k, v, index++, mapper ? mapper(v, k, collection) : v])
    .valueSeq()
    .toArray();
  entries
    .sort((a, b) => comparator(a[3], b[3]) || a[2] - b[2])
    .forEach(
      isKeyedCollection
        ? (v, i) => {
            entries[i].length = 2;
          }
        : (v, i) => {
            entries[i] = v[1];
          }
    );
  return isKeyedCollection
    ? KeyedSeq(entries)
    : isIndexed(collection)
      ? IndexedSeq(entries)
      : SetSeq(entries);
};

const factoryFlatMap = (cx, collectionClass, mapper, context) => {
  const coerce = collectionClass(cx);
  return cx
    .toSeq()
    .map((v, k) => coerce(mapper.call(context, v, k, cx)))
    .flatten(true);
};

export {
  factoryCountBy,
  factoryGroupBy,
  factoryInterpose,
  factoryFlatMap,
  factoryFilter,
  factoryPartition,
  factorySort,
};
