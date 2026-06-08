import {
  Collection,
  type CollectionImpl,
  type IndexedCollectionImpl,
  type KeyedCollectionImpl,
} from '../Collection';
import {
  getIterator,
  Iterator,
  iteratorValue,
  iteratorDone,
  ITERATE_KEYS,
  ITERATE_VALUES,
  ITERATE_ENTRIES,
  type IteratorType,
} from '../Iterator';
import { KeyedSeq, SetSeq, IndexedSeq, ArraySeq } from '../Seq';
import {
  NOT_SET,
  ensureSize,
  wrapIndex,
  wholeSlice,
  resolveBegin,
  resolveEnd,
} from '../TrieUtils';
import { isCollection } from '../predicates/isCollection';
import { isIndexed } from '../predicates/isIndexed';
import { isKeyed } from '../predicates/isKeyed';
import { isSeq } from '../predicates/isSeq';
import {
  cacheResultThrough,
  collectionClass,
  defaultComparator,
  makeSequence,
  reify,
} from './helpers';

export type Comparator<T> = (a: T, b: T) => number;

// TODO [TS-MIGRATION] This whole MutableSequence scaffolding — the interface,
// every "makeSequence(...) as unknown as MutableSequence", every "return ... as
// unknown as <kind>", and every loose method reassignment
// (get/has/reverse/flip/cacheResult/...) — exists only because operation
// sequences are built by mutating a bare object. Once sequences.js becomes real
// typed classes, the mutation pattern and all these casts disappear.
// The factories build a sequence by dynamically mutating the bare object
// returned by `makeSequence`, assigning operation-specific implementations of
// `_iter`, `size`, `get`, `__iterate`, `__iterator`, etc. Those assignments
// cannot be expressed against the real Seq class types, so each factory works
// against this augmentable shape and casts back to the declared return type at
// the construction boundary (the only place casts are allowed here).
interface MutableSequence {
  size: number | undefined;
  _iter?: CollectionImpl<unknown, unknown>;
  flip?: () => unknown;
  reverse?: (...args: Array<unknown>) => MutableSequence;
  has?: (key: unknown) => boolean;
  includes?: (value: unknown) => boolean;
  get?: (key: unknown, notSetValue?: unknown) => unknown;
  cacheResult?: () => MutableSequence;
  __iterate?: (
    fn: (value: unknown, key: unknown, iter: unknown) => unknown,
    reverse?: boolean
  ) => number;
  __iterator?: (type: IteratorType, reverse?: boolean) => Iterator<unknown>;
  __iterateUncached?: (
    fn: (value: unknown, key: unknown, iter: unknown) => unknown,
    reverse?: boolean
  ) => number;
  __iteratorUncached?: (
    type: IteratorType,
    reverse?: boolean
  ) => Iterator<unknown>;
}

export function flipFactory<K, V>(
  collection: KeyedCollectionImpl<K, V>
): KeyedCollectionImpl<V, K> {
  // TODO [TS-MIGRATION] build-by-mutation scaffold (see MutableSequence)
  const flipSequence = makeSequence(collection) as unknown as MutableSequence;
  flipSequence._iter = collection;
  flipSequence.size = collection.size;
  flipSequence.flip = () => collection;
  flipSequence.reverse = function (this: MutableSequence) {
    // TODO [TS-MIGRATION] this is `super.reverse()`; once the operation
    // sequences are real classes it needs no `apply`/cast.
    const reversedSequence = (
      collection.reverse as unknown as () => MutableSequence
    ).apply(this);
    reversedSequence.flip = () => collection.reverse();
    return reversedSequence;
  };
  // TODO [TS-MIGRATION] the built seq receives `unknown` keys here; with real
  // classes `has`/`includes` are typed methods (no `as V`/`as K`).
  flipSequence.has = (key) => collection.includes(key as V);
  flipSequence.includes = (key) => collection.has(key as K);
  // TODO [TS-MIGRATION] `cacheResultThrough` returns `this`/the cached seq;
  // cast at this build site (see MutableSequence).
  flipSequence.cacheResult = cacheResultThrough as () => MutableSequence;
  flipSequence.__iterateUncached = function (
    this: MutableSequence,
    fn,
    reverse
  ) {
    return collection.__iterate((v, k) => fn(k, v, this) !== false, reverse);
  };
  flipSequence.__iteratorUncached = function (type, reverse) {
    if (type === ITERATE_ENTRIES) {
      const iterator = collection.__iterator(type, reverse);
      return new Iterator(() => {
        const step = iterator.next();
        if (!step.done) {
          // Swap key/value in place; the swapped entry is `[V, K]`, which the
          // source tuple type `[K, V]` cannot describe, so write through a
          // loose tuple view at this build site.
          const entry = step.value as [unknown, unknown];
          const k = entry[0];
          entry[0] = entry[1];
          entry[1] = k;
        }
        return step;
      });
    }
    // The parent iterator is returned directly as this sequence's iterator;
    // coerce it to the internal `Iterator` shape at this build site.
    return collection.__iterator(
      type === ITERATE_VALUES ? ITERATE_KEYS : ITERATE_VALUES,
      reverse
    ) as unknown as Iterator<unknown>;
  };
  // TODO [TS-MIGRATION] dynamic-build boundary (see MutableSequence)
  return flipSequence as unknown as KeyedCollectionImpl<V, K>;
}

export function mapFactory<K, V, M, C extends CollectionImpl<K, V>>(
  collection: C,
  mapper: (value: V, key: K, iter: C) => M,
  context?: unknown
): CollectionImpl<K, M> {
  // TODO [TS-MIGRATION] build-by-mutation scaffold (see MutableSequence)
  const mappedSequence = makeSequence(collection) as unknown as MutableSequence;
  mappedSequence.size = collection.size;
  mappedSequence.has = (key) => collection.has(key as K);
  mappedSequence.get = (key, notSetValue) => {
    // TODO [TS-MIGRATION] unknown-key/value bridge: `get` receives `unknown`
    // here but will be a typed method param once sequences are classes.
    const v = collection.get(key as K, NOT_SET);
    return v === NOT_SET
      ? notSetValue
      : mapper.call(context, v as V, key as K, collection);
  };
  mappedSequence.__iterateUncached = function (
    this: MutableSequence,
    fn,
    reverse
  ) {
    return collection.__iterate(
      (v, k, c) => fn(mapper.call(context, v, k, c), k, this) !== false,
      reverse
    );
  };
  mappedSequence.__iteratorUncached = function (type, reverse) {
    const iterator = collection.__iterator(ITERATE_ENTRIES, reverse);
    return new Iterator(() => {
      const step = iterator.next();
      if (step.done) {
        return step;
      }
      const entry = step.value;
      const key = entry[0];
      return iteratorValue<K, M>(
        type,
        key,
        mapper.call(context, entry[1], key, collection),
        // The entries step is reused for the mapped result here; its `[K, V]`
        // type no longer matches the produced value, so widen at this build site.
        step as IteratorYieldResult<unknown>
      );
    });
  };
  // TODO [TS-MIGRATION] dynamic-build boundary (see MutableSequence)
  return mappedSequence as unknown as CollectionImpl<K, M>;
}

export function reverseFactory<C extends CollectionImpl<unknown, unknown>>(
  collection: C,
  useKeys: boolean
): C {
  // TODO [TS-MIGRATION] build-by-mutation scaffold (see MutableSequence)
  const reversedSequence = makeSequence(
    collection
  ) as unknown as MutableSequence;
  reversedSequence._iter = collection;
  reversedSequence.size = collection.size;
  // TODO [TS-MIGRATION] real collection typed as the loose builder (see
  // MutableSequence)
  reversedSequence.reverse = () => collection as unknown as MutableSequence;
  if (isKeyed(collection)) {
    // Capture the narrowed (keyed) collection so it stays keyed in the closure.
    const keyed = collection;
    reversedSequence.flip = function () {
      const flipSequence = flipFactory(keyed) as unknown as MutableSequence;
      // TODO [TS-MIGRATION] real collection typed as the loose builder (see
      // MutableSequence)
      flipSequence.reverse = () => keyed.flip() as unknown as MutableSequence;
      return flipSequence;
    };
  }
  reversedSequence.get = (key, notSetValue) =>
    // TODO [TS-MIGRATION] loosely-typed seq key narrowed to number (see
    // MutableSequence)
    collection.get(useKeys ? key : -1 - (key as number), notSetValue);
  reversedSequence.has = (key) =>
    // TODO [TS-MIGRATION] loosely-typed seq key narrowed to number (see
    // MutableSequence)
    collection.has(useKeys ? key : -1 - (key as number));
  reversedSequence.includes = (value) => collection.includes(value);
  // TODO [TS-MIGRATION] `cacheResultThrough` returns `this`/the cached seq;
  // cast at this build site (see MutableSequence).
  reversedSequence.cacheResult = cacheResultThrough as () => MutableSequence;
  reversedSequence.__iterate = function (this: MutableSequence, fn, reverse) {
    let i = 0;
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions -- TODO enable eslint here
    reverse && ensureSize(collection);
    return collection.__iterate(
      (v, k) =>
        fn(v, useKeys ? k : reverse ? (this.size ?? 0) - ++i : i++, this),
      !reverse
    );
  };
  reversedSequence.__iterator = (type, reverse) => {
    let i = 0;
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions -- TODO enable eslint here
    reverse && ensureSize(collection);
    const iterator = collection.__iterator(ITERATE_ENTRIES, !reverse);
    return new Iterator(() => {
      const step = iterator.next();
      if (step.done) {
        return step;
      }
      const entry = step.value;
      return iteratorValue(
        type,
        // `__iterator` is an arrow function, so `this` is not the reversed
        // sequence here — read `reversedSequence.size` explicitly.
        useKeys ? entry[0] : reverse ? (reversedSequence.size ?? 0) - ++i : i++,
        entry[1],
        step
      );
    });
  };
  // TODO [TS-MIGRATION] dynamic-build boundary (see MutableSequence)
  return reversedSequence as unknown as C;
}

export function filterFactory<K, V, C extends CollectionImpl<K, V>>(
  collection: C,
  predicate: (value: V, key: K, iter: C) => unknown,
  context: unknown,
  useKeys: boolean
): C {
  // TODO [TS-MIGRATION] build-by-mutation scaffold (see MutableSequence)
  const filterSequence = makeSequence(collection) as unknown as MutableSequence;
  if (useKeys) {
    filterSequence.has = (key) => {
      // TODO [TS-MIGRATION] unknown-key/value bridge: `has` receives `unknown`
      // here but will be a typed method param once sequences are classes.
      const v = collection.get(key as K, NOT_SET);
      return (
        v !== NOT_SET && !!predicate.call(context, v as V, key as K, collection)
      );
    };
    filterSequence.get = (key, notSetValue) => {
      // TODO [TS-MIGRATION] unknown-key/value bridge: `get` receives `unknown`
      // here but will be a typed method param once sequences are classes.
      const v = collection.get(key as K, NOT_SET);
      return v !== NOT_SET &&
        predicate.call(context, v as V, key as K, collection)
        ? v
        : notSetValue;
    };
  }
  filterSequence.__iterateUncached = function (
    this: MutableSequence,
    fn,
    reverse
  ) {
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
          return iteratorValue(
            type,
            useKeys ? key : iterations++,
            value,
            // The entries step is reused for the result here; its `[K, V]` type
            // no longer matches every produced value, so widen at this build site.
            step as IteratorYieldResult<unknown>
          );
        }
      }
    });
  };
  // TODO [TS-MIGRATION] dynamic-build boundary (see MutableSequence)
  return filterSequence as unknown as C;
}

export function partitionFactory<K, V, C extends CollectionImpl<K, V>>(
  collection: C,
  predicate: (value: V, key: K, iter: C) => unknown,
  context: unknown
): [C, C] {
  const isKeyedIter = isKeyed(collection);
  const groups: [Array<unknown>, Array<unknown>] = [[], []];
  collection.__iterate((v, k) => {
    groups[predicate.call(context, v, k, collection) ? 1 : 0].push(
      isKeyedIter ? [k, v] : v
    );
  });
  const coerce = collectionClass(collection);
  // Dynamic-build boundary: each partition is rebuilt through `coerce` and
  // reified back to the collection's kind.
  return groups.map((arr) =>
    reify(collection, coerce(arr as Array<unknown>))
  ) as unknown as [C, C];
}

export function sliceFactory<C extends CollectionImpl<unknown, unknown>>(
  collection: C,
  begin: number | undefined,
  end: number | undefined,
  useKeys: boolean
): C {
  const originalSize = collection.size;

  if (wholeSlice(begin, end, originalSize)) {
    return collection;
  }

  // begin or end can not be resolved if they were provided as negative numbers
  // and this collection's size is unknown. In that case, cache first so there
  // is a known size and these do not resolve to NaN.
  if (
    typeof originalSize === 'undefined' &&
    ((begin ?? 0) < 0 || (end ?? 0) < 0)
  ) {
    return sliceFactory(
      // TODO [TS-MIGRATION] `cacheResult` is a Seq method not on the base type
      // (see MutableSequence)
      (collection.toSeq() as unknown as { cacheResult: () => C }).cacheResult(),
      begin,
      end,
      useKeys
    );
  }

  const resolvedBegin = resolveBegin(begin, originalSize);
  const resolvedEnd = resolveEnd(end, originalSize);

  // Note: resolvedEnd is undefined when the original sequence's length is
  // unknown and this slice did not supply an end and should contain all
  // elements after resolvedBegin.
  // In that case, resolvedSize will be NaN and sliceSize will remain undefined.
  const resolvedSize = resolvedEnd - resolvedBegin;
  let sliceSize: number | undefined;
  if (resolvedSize === resolvedSize) {
    sliceSize = resolvedSize < 0 ? 0 : resolvedSize;
  }

  // TODO [TS-MIGRATION] build-by-mutation scaffold (see MutableSequence)
  const sliceSeq = makeSequence(collection) as unknown as MutableSequence;

  // If collection.size is undefined, the size of the realized sliceSeq is
  // unknown at this point unless the number of items to slice is 0
  sliceSeq.size =
    sliceSize === 0 ? sliceSize : (collection.size && sliceSize) || undefined;

  if (
    !useKeys &&
    isSeq(collection) &&
    sliceSize !== undefined &&
    sliceSize >= 0
  ) {
    sliceSeq.get = function (this: MutableSequence, index, notSetValue) {
      const i = wrapIndex(
        // TODO [TS-MIGRATION] loosely-typed built seq passed as the typed
        // collection (see MutableSequence)
        this as unknown as CollectionImpl<unknown, unknown>,
        // TODO [TS-MIGRATION] loosely-typed seq index narrowed to number (see
        // MutableSequence)
        index as number
      );
      return i >= 0 && i < sliceSize
        ? collection.get(i + resolvedBegin, notSetValue)
        : notSetValue;
    };
  }

  sliceSeq.__iterateUncached = function (this: MutableSequence, fn, reverse) {
    if (sliceSize === 0) {
      return 0;
    }
    if (reverse) {
      return this.cacheResult!().__iterate!(fn, reverse);
    }
    let skipped = 0;
    let isSkipping = true;
    let iterations = 0;
    collection.__iterate((v, k) => {
      if (!(isSkipping && (isSkipping = skipped++ < resolvedBegin))) {
        iterations++;
        return (
          fn(v, useKeys ? k : iterations - 1, this) !== false &&
          iterations !== sliceSize
        );
      }
    });
    return iterations;
  };

  sliceSeq.__iteratorUncached = function (
    this: MutableSequence,
    type,
    reverse
  ) {
    if (sliceSize !== 0 && reverse) {
      return this.cacheResult!().__iterator!(type, reverse);
    }
    // Don't bother instantiating parent iterator if taking 0.
    if (sliceSize === 0) {
      return new Iterator(iteratorDone);
    }
    const iterator = collection.__iterator(type, reverse);
    let skipped = 0;
    let iterations = 0;
    return new Iterator(() => {
      while (skipped++ < resolvedBegin) {
        iterator.next();
      }

      iterations++;
      if (sliceSize !== undefined && iterations > sliceSize) {
        return iteratorDone();
      }
      const step = iterator.next();
      if (useKeys || type === ITERATE_VALUES || step.done) {
        return step;
      }
      if (type === ITERATE_KEYS) {
        return iteratorValue(type, iterations - 1, undefined, step);
      }
      const entry = step.value as [unknown, unknown];
      return iteratorValue(type, iterations - 1, entry[1], step);
    });
  };

  // TODO [TS-MIGRATION] dynamic-build boundary (see MutableSequence)
  return sliceSeq as unknown as C;
}

export function takeWhileFactory<K, V, C extends CollectionImpl<K, V>>(
  collection: C,
  predicate: (value: V, key: K, iter: C) => unknown,
  context?: unknown
): C {
  // TODO [TS-MIGRATION] build-by-mutation scaffold (see MutableSequence)
  const takeSequence = makeSequence(collection) as unknown as MutableSequence;
  takeSequence.__iterateUncached = function (
    this: MutableSequence,
    fn,
    reverse
  ) {
    if (reverse) {
      return this.cacheResult!().__iterate!(fn, reverse);
    }
    let iterations = 0;
    collection.__iterate(
      (v, k, c) =>
        predicate.call(context, v, k, c) && ++iterations && fn(v, k, this)
    );
    return iterations;
  };
  takeSequence.__iteratorUncached = function (
    this: MutableSequence,
    type,
    reverse
  ) {
    if (reverse) {
      return this.cacheResult!().__iterator!(type, reverse);
    }
    const iterator = collection.__iterator(ITERATE_ENTRIES, reverse);
    let iterating = true;
    return new Iterator(() => {
      if (!iterating) {
        return iteratorDone();
      }
      const step = iterator.next();
      if (step.done) {
        return step;
      }
      const entry = step.value;
      const k = entry[0];
      const v = entry[1];
      // TODO [TS-MIGRATION] built seq passed as the typed collection to the
      // predicate (see MutableSequence)
      if (!predicate.call(context, v, k, this as unknown as C)) {
        iterating = false;
        return iteratorDone();
      }
      return type === ITERATE_ENTRIES
        ? step
        : // The entries step is reused for the result here; its `[K, V]` type
          // no longer matches the produced key/value, so widen at this build site.
          iteratorValue(type, k, v, step as IteratorYieldResult<unknown>);
    });
  };
  // TODO [TS-MIGRATION] dynamic-build boundary (see MutableSequence)
  return takeSequence as unknown as C;
}

export function skipWhileFactory<K, V, C extends CollectionImpl<K, V>>(
  collection: C,
  predicate: (value: V, key: K, iter: C) => unknown,
  context: unknown,
  useKeys: boolean
): C {
  // TODO [TS-MIGRATION] build-by-mutation scaffold (see MutableSequence)
  const skipSequence = makeSequence(collection) as unknown as MutableSequence;
  skipSequence.__iterateUncached = function (
    this: MutableSequence,
    fn,
    reverse
  ) {
    if (reverse) {
      return this.cacheResult!().__iterate!(fn, reverse);
    }
    let isSkipping = true;
    let iterations = 0;
    collection.__iterate((v, k) => {
      if (
        !(
          isSkipping &&
          (isSkipping = !!predicate.call(context, v, k, collection))
        )
      ) {
        iterations++;
        return fn(v, useKeys ? k : iterations - 1, this);
      }
    });
    return iterations;
  };
  skipSequence.__iteratorUncached = function (
    this: MutableSequence,
    type,
    reverse
  ) {
    if (reverse) {
      return this.cacheResult!().__iterator!(type, reverse);
    }
    const iterator = collection.__iterator(ITERATE_ENTRIES, reverse);
    let skipping = true;
    let iterations = 0;
    return new Iterator(() => {
      let step;
      let k;
      let v;
      do {
        step = iterator.next();
        if (step.done) {
          if (useKeys || type === ITERATE_VALUES) {
            return step;
          }
          if (type === ITERATE_KEYS) {
            return iteratorValue(
              type,
              iterations++,
              undefined,
              step as unknown as IteratorYieldResult<unknown>
            );
          }
          return iteratorValue(
            type,
            iterations++,
            (step.value as unknown as [unknown, unknown])[1],
            step as unknown as IteratorYieldResult<unknown>
          );
        }
        const entry = step.value;
        k = entry[0];
        v = entry[1];
        // TODO [TS-MIGRATION] built seq passed as the typed collection to the
        // predicate (see MutableSequence)
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions -- TODO enable eslint here
        skipping &&
          (skipping = !!predicate.call(context, v, k, this as unknown as C));
      } while (skipping);
      return type === ITERATE_ENTRIES
        ? step
        : // The entries step is reused for the result here; its `[K, V]` type
          // no longer matches the produced key/value, so widen at this build site.
          iteratorValue(type, k, v, step as IteratorYieldResult<unknown>);
    });
  };
  // TODO [TS-MIGRATION] dynamic-build boundary (see MutableSequence)
  return skipSequence as unknown as C;
}

export function flattenFactory<K, V>(
  collection: CollectionImpl<K, V>,
  depth: number | boolean | undefined,
  useKeys: boolean
): CollectionImpl<unknown, unknown> {
  // TODO [TS-MIGRATION] build-by-mutation scaffold (see MutableSequence)
  const flatSequence = makeSequence(collection) as unknown as MutableSequence;
  flatSequence.__iterateUncached = function (
    this: MutableSequence,
    fn,
    reverse
  ) {
    if (reverse) {
      return this.cacheResult!().__iterate!(fn, reverse);
    }
    let iterations = 0;
    let stopped = false;
    function flatDeep(
      iter: CollectionImpl<unknown, unknown>,
      currentDepth: number
    ) {
      iter.__iterate((v, k) => {
        if ((!depth || currentDepth < Number(depth)) && isCollection(v)) {
          flatDeep(v, currentDepth + 1);
        } else {
          iterations++;
          if (fn(v, useKeys ? k : iterations - 1, flatSequence) === false) {
            stopped = true;
          }
        }
        return !stopped;
      }, reverse);
    }
    flatDeep(collection, 0);
    return iterations;
  };
  flatSequence.__iteratorUncached = function (
    this: MutableSequence,
    type,
    reverse
  ) {
    if (reverse) {
      return this.cacheResult!().__iterator!(type, reverse);
    }
    // The wrapped collections yield their native iterators here (not the
    // internal `Iterator` class), so the working set is typed structurally.
    let iterator: IterableIterator<unknown> | undefined = collection.__iterator(
      type,
      reverse
    );
    const stack: Array<IterableIterator<unknown>> = [];
    let iterations = 0;
    return new Iterator(() => {
      while (iterator) {
        const step = iterator.next();
        if (step.done !== false) {
          iterator = stack.pop();
          continue;
        }
        let v: unknown = step.value;
        if (type === ITERATE_ENTRIES) {
          v = (v as [unknown, unknown])[1];
        }
        if ((!depth || stack.length < Number(depth)) && isCollection(v)) {
          stack.push(iterator);
          iterator = v.__iterator(type, reverse);
        } else {
          return useKeys ? step : iteratorValue(type, iterations++, v, step);
        }
      }
      return iteratorDone();
    });
  };
  // TODO [TS-MIGRATION] dynamic-build boundary (see MutableSequence)
  return flatSequence as unknown as CollectionImpl<unknown, unknown>;
}

export function flatMapFactory<K, V, C extends CollectionImpl<K, V>>(
  collection: C,
  mapper: (value: V, key: K, iter: C) => unknown,
  context?: unknown
): CollectionImpl<unknown, unknown> {
  // Dynamic-build boundary: `coerce` is one of three collection factories with
  // distinct signatures; here it is driven generically over `unknown` values.
  const coerce = collectionClass(collection) as unknown as (
    value: unknown
  ) => CollectionImpl<unknown, unknown>;
  return collection
    .toSeq()
    .map((v: V, k: K) => coerce(mapper.call(context, v, k, collection)))
    .flatten(true) as unknown as CollectionImpl<unknown, unknown>;
}

export function interposeFactory<C extends CollectionImpl<unknown, unknown>>(
  collection: C,
  separator: unknown
): C {
  // TODO [TS-MIGRATION] build-by-mutation scaffold (see MutableSequence)
  const interposedSequence = makeSequence(
    collection
  ) as unknown as MutableSequence;
  interposedSequence.size = collection.size && collection.size * 2 - 1;
  interposedSequence.__iterateUncached = function (
    this: MutableSequence,
    fn,
    reverse
  ) {
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
    let step: IteratorResult<unknown> | undefined;
    return new Iterator(() => {
      if (!step || iterations % 2) {
        step = iterator.next();
        if (step.done) {
          return step;
        }
      }
      return iterations % 2
        ? iteratorValue(type, iterations++, separator)
        : iteratorValue(
            type,
            iterations++,
            step!.value,
            step as unknown as IteratorYieldResult<unknown>
          );
    });
  };
  // TODO [TS-MIGRATION] dynamic-build boundary (see MutableSequence)
  return interposedSequence as unknown as C;
}

// `SV` is the type the comparator/mapper compare by — the value type `V` for a
// plain `sort`, the mapped type for `sortBy`. `SV` and the collection's `K`/`V`
// are type parameters (rather than the spec's fixed `unknown`) so the
// contravariant comparator and mapper forwarded by `Collection.sort`/`sortBy`
// (e.g. `(a: V, b: V) => number` and `(v: V, k: K, iter: this) => C`) are
// accepted under `strictFunctionTypes`.
export function sortFactory<K, V, C extends CollectionImpl<K, V>, SV>(
  collection: C,
  comparator?: Comparator<SV>,
  mapper?: (value: V, key: K, collection: C) => SV
): C {
  const cmp = comparator ?? defaultComparator;
  const isKeyedCollection = isKeyed(collection);
  let index = 0;
  const entries: Array<Array<unknown>> = collection
    .toSeq()
    .map((v: unknown, k: unknown) => [
      k,
      v,
      index++,
      mapper ? mapper(v as V, k as K, collection) : v,
    ])
    .valueSeq()
    .toArray();
  entries
    .sort(
      (a, b) =>
        cmp(a[3] as SV, b[3] as SV) || (a[2] as number) - (b[2] as number)
    )
    .forEach(
      isKeyedCollection
        ? (v, i) => {
            entries[i]!.length = 2;
          }
        : (v, i) => {
            entries[i] = v[1] as Array<unknown>;
          }
    );
  // Dynamic-build boundary: a fresh Seq of the matching kind is built from the
  // sorted entries.
  return (isKeyedCollection
    ? KeyedSeq(entries)
    : isIndexed(collection)
      ? IndexedSeq(entries)
      : SetSeq(entries)) as unknown as C;
}

// `comparator` is typed with `never` parameters so that any comparator the
// callers forward is accepted under `strictFunctionTypes` — including the
// `min`/`minBy` case where it is a union of the negated user comparator and
// `defaultNegComparator` (whose compared value types differ). `CV` keeps the
// optional `mapper` (used by `maxBy`/`minBy`) typed precisely.
export function maxFactory<K, V, C extends CollectionImpl<K, V>>(
  collection: C,
  comparator: undefined | Comparator<V>,
  mapper: undefined
): V | undefined;
export function maxFactory<K, V, C extends CollectionImpl<K, V>, CV>(
  collection: C,
  comparator?: Comparator<CV>,
  mapper?: (value: V, key: K, collection: C) => CV
): V | undefined;
export function maxFactory<K, V, C extends CollectionImpl<K, V>, CV = V>(
  collection: C,
  comparator?: Comparator<V | CV>,
  mapper?: (value: V, key: K, collection: C) => CV
): V | undefined {
  const cmp = comparator ?? defaultComparator;

  if (mapper) {
    const entry = collection
      .toSeq()
      .map((v: V, k: K): [V, CV] => [v, mapper(v, k, collection)])
      .reduce((a: [V, CV], b: [V, CV]) =>
        maxCompare(cmp, a[1], b[1]) ? b : a
      );
    return entry && entry[0];
  }

  return collection.reduce((a: V, b: V) => (maxCompare(cmp, a, b) ? b : a));
}

function maxCompare<T>(comparator: Comparator<T>, a: T, b: T): boolean {
  const comp = comparator(b, a);
  // b is considered the new max if the comparator declares them equal, but
  // they are not equal and b is in fact a nullish value.
  return (
    (comp === 0 && b !== a && (b === undefined || b === null || b !== b)) ||
    comp > 0
  );
}

// `zipper` and `iters` are typed loosely (`unknown` / `Array<unknown>`) rather
// than the spec's narrower types so the loose implementation signatures of
// `Collection.zip`/`zipAll`/`zipWith` (which forward `unknown` values) type-
// check; the values are driven dynamically through the iteration protocol here.
export function zipWithFactory(
  keyIter: CollectionImpl<unknown, unknown>,
  zipper: unknown,
  iters: Array<unknown>,
  zipAll?: boolean
): IndexedCollectionImpl<unknown> {
  const zip = zipper as (...values: Array<unknown>) => unknown;
  // TODO [TS-MIGRATION] build-by-mutation scaffold (see MutableSequence)
  const zipSequence = makeSequence(keyIter) as unknown as MutableSequence;
  const sizes = new ArraySeq(iters).map(
    (i) => (i as CollectionImpl<unknown, unknown>).size
  );
  zipSequence.size = zipAll ? sizes.max() : sizes.min();
  // Note: this is a generic base implementation of __iterate in terms of
  // __iterator which may be more generically useful in the future.
  zipSequence.__iterate = function (this: MutableSequence, fn, reverse) {
    /* generic:
    var iterator = this.__iterator(ITERATE_ENTRIES, reverse);
    var step;
    var iterations = 0;
    while (!(step = iterator.next()).done) {
      iterations++;
      if (fn(step.value[1], step.value[0], this) === false) {
        break;
      }
    }
    return iterations;
    */
    // indexed:
    const iterator = this.__iterator!(ITERATE_VALUES, reverse);
    let step;
    let iterations = 0;
    while (!(step = iterator.next()).done) {
      if (fn(step.value, iterations++, this) === false) {
        break;
      }
    }
    return iterations;
  };
  zipSequence.__iteratorUncached = function (type, reverse) {
    const iterators = iters.map((i) => {
      const c = Collection(i as CollectionImpl<unknown, unknown>);
      return getIterator(reverse ? c.reverse() : c);
    });
    let iterations = 0;
    let isDone = false;
    return new Iterator(() => {
      let steps: Array<IteratorResult<unknown>> | undefined;
      if (!isDone) {
        steps = iterators.map((i) => i!.next());
        isDone = zipAll
          ? steps.every((s) => s.done)
          : steps.some((s) => s.done);
      }
      if (isDone) {
        return iteratorDone();
      }
      return iteratorValue(
        type,
        iterations++,
        zip.apply(
          null,
          steps!.map((s) => s.value)
        )
      );
    });
  };
  // TODO [TS-MIGRATION] dynamic-build boundary (see MutableSequence)
  return zipSequence as unknown as IndexedCollectionImpl<unknown>;
}
