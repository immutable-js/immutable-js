import {
  KeyedCollection,
  type CollectionImpl,
  type IndexedCollectionImpl,
} from '../Collection';
import {
  ITERATE_ENTRIES,
  ITERATE_KEYS,
  ITERATE_VALUES,
  Iterator,
  iteratorDone,
  iteratorValue,
  type IteratorType,
} from '../Iterator';
import {
  indexedSeqFromValue,
  IndexedSeqImpl,
  keyedSeqFromValue,
  KeyedSeqImpl,
  SeqImpl,
  SetSeqImpl,
} from '../Seq';
import { ensureSize } from '../TrieUtils';
import { isCollection } from '../predicates/isCollection';
import { IS_INDEXED_SYMBOL, isIndexed } from '../predicates/isIndexed';
import { IS_KEYED_SYMBOL, isKeyed } from '../predicates/isKeyed';
import { IS_ORDERED_SYMBOL } from '../predicates/isOrdered';
import { mapFactory, reverseFactory } from './factories';
import { cacheResultThrough } from './helpers';

export class ToKeyedSequence<K, V> extends KeyedSeqImpl<K, V> {
  declare [IS_ORDERED_SYMBOL]: true;

  private _iter: CollectionImpl<K, V>;
  private _useKeys: boolean;

  constructor(indexed: CollectionImpl<K, V>, useKeys: boolean) {
    super();

    this._iter = indexed;
    this._useKeys = useKeys;
    this.size = indexed.size;
  }

  override get<NSV>(key: K, notSetValue: NSV): V | NSV;
  override get(key: K): V | undefined;
  override get(key: K, notSetValue?: unknown): unknown {
    return this._iter.get(key, notSetValue);
  }

  override has(key: K): boolean {
    return this._iter.has(key);
  }

  override valueSeq(): IndexedSeqImpl<V> {
    return this._iter.valueSeq();
  }

  override reverse(): this {
    const reversedSequence = reverseFactory(this, true);
    if (!this._useKeys) {
      // TODO [TS-MIGRATION] `_useKeys` is false only when wrapping an indexed
      // collection (`Collection.Indexed#toKeyedSeq`): the reversed wrapped
      // collection is then this sequence's values seq, which the kind-agnostic
      // static type of `_iter` cannot express.
      reversedSequence.valueSeq = () =>
        this._iter.toSeq().reverse() as unknown as IndexedSeqImpl<V>;
    }
    return reversedSequence;
  }

  override map<M>(
    mapper: (value: V, key: K, iter: this) => M,
    context?: unknown
  ): CollectionImpl<K, M> {
    const mappedSequence = mapFactory(this, mapper, context);
    if (!this._useKeys) {
      // TODO [TS-MIGRATION] same indexed-only shortcut as in `reverse` above;
      // the mapper is re-driven over the wrapped values seq, so its `iter`
      // param is not `this` there.
      mappedSequence.valueSeq = () =>
        this._iter
          .toSeq()
          .map(
            mapper as (value: V, key: K, iter: unknown) => M,
            context
          ) as unknown as IndexedSeqImpl<M>;
    }
    return mappedSequence;
  }

  override __iterate(
    fn: (value: V, key: K, iter: this) => unknown,
    reverse?: boolean
  ): number {
    return this._iter.__iterate((v, k) => fn(v, k, this), reverse);
  }

  override __iterator(
    type: typeof ITERATE_ENTRIES,
    reverse?: boolean
  ): IterableIterator<[K, V]>;
  override __iterator(
    type: typeof ITERATE_KEYS,
    reverse?: boolean
  ): IterableIterator<K>;
  override __iterator(
    type: typeof ITERATE_VALUES,
    reverse?: boolean
  ): IterableIterator<V>;
  override __iterator(
    type: IteratorType,
    reverse?: boolean
  ): IterableIterator<K | V | [K, V]>;
  override __iterator(
    type: IteratorType,
    reverse?: boolean
  ): IterableIterator<K | V | [K, V]> {
    return this._iter.__iterator(type, reverse);
  }
}
ToKeyedSequence.prototype[IS_ORDERED_SYMBOL] = true;

export class ToIndexedSequence<T> extends IndexedSeqImpl<T> {
  private _iter: CollectionImpl<unknown, T>;

  constructor(iter: CollectionImpl<unknown, T>) {
    super();

    this._iter = iter;
    this.size = iter.size;
  }

  override includes(value: T): boolean {
    return this._iter.includes(value);
  }

  override __iterate(
    fn: (value: T, index: number, iter: this) => unknown,
    reverse?: boolean
  ): number {
    let i = 0;
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions -- TODO enable eslint here
    reverse && ensureSize(this);
    return this._iter.__iterate(
      (v) => fn(v, reverse ? (this.size ?? 0) - ++i : i++, this),
      reverse
    );
  }

  override __iterator(
    type: typeof ITERATE_ENTRIES,
    reverse?: boolean
  ): IterableIterator<[number, T]>;
  override __iterator(
    type: typeof ITERATE_KEYS,
    reverse?: boolean
  ): IterableIterator<number>;
  override __iterator(
    type: typeof ITERATE_VALUES,
    reverse?: boolean
  ): IterableIterator<T>;
  override __iterator(
    type: IteratorType,
    reverse?: boolean
  ): IterableIterator<number | T | [number, T]>;
  override __iterator(
    type: IteratorType,
    reverse?: boolean
  ): IterableIterator<number | T | [number, T]> {
    const iterator = this._iter.__iterator(ITERATE_VALUES, reverse);
    let i = 0;
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions -- TODO enable eslint here
    reverse && ensureSize(this);
    return new Iterator<number | T | [number, T]>(() => {
      const step = iterator.next();
      return step.done
        ? step
        : iteratorValue(
            type,
            reverse ? (this.size ?? 0) - ++i : i++,
            step.value,
            step
          );
    });
  }
}

export class ToSetSequence<T> extends SetSeqImpl<T> {
  private _iter: CollectionImpl<unknown, T>;

  constructor(iter: CollectionImpl<unknown, T>) {
    super();

    this._iter = iter;
    this.size = iter.size;
  }

  override has(key: T): boolean {
    return this._iter.includes(key);
  }

  override __iterate(
    fn: (value: T, key: T, iter: this) => unknown,
    reverse?: boolean
  ): number {
    return this._iter.__iterate((v) => fn(v, v, this), reverse);
  }

  override __iterator(
    type: typeof ITERATE_ENTRIES,
    reverse?: boolean
  ): IterableIterator<[T, T]>;
  override __iterator(
    type: typeof ITERATE_KEYS,
    reverse?: boolean
  ): IterableIterator<T>;
  override __iterator(
    type: typeof ITERATE_VALUES,
    reverse?: boolean
  ): IterableIterator<T>;
  override __iterator(
    type: IteratorType,
    reverse?: boolean
  ): IterableIterator<T | [T, T]>;
  override __iterator(
    type: IteratorType,
    reverse?: boolean
  ): IterableIterator<T | [T, T]> {
    const iterator = this._iter.__iterator(ITERATE_VALUES, reverse);
    return new Iterator<T | [T, T]>(() => {
      const step = iterator.next();
      return step.done
        ? step
        : iteratorValue(type, step.value, step.value, step);
    });
  }
}

export class FromEntriesSequence extends KeyedSeqImpl<unknown, unknown> {
  private _iter: IndexedCollectionImpl<[unknown, unknown]>;

  constructor(entries: IndexedCollectionImpl<[unknown, unknown]>) {
    super();

    this._iter = entries;
    this.size = entries.size;
  }

  override entrySeq(): IndexedSeqImpl<[unknown, unknown]> {
    return this._iter.toSeq();
  }

  override __iterate(
    fn: (value: unknown, key: unknown, iter: this) => unknown,
    reverse?: boolean
  ): number {
    return this._iter.__iterate((entry) => {
      // Check if entry exists first so array access doesn't throw for holes
      // in the parent iteration.
      if (entry) {
        validateEntry(entry);
        const indexedCollection = isCollection(entry);
        return fn(
          indexedCollection ? entry.get(1) : entry[1],
          indexedCollection ? entry.get(0) : entry[0],
          this
        );
      }
    }, reverse);
  }

  override __iterator(
    type: typeof ITERATE_ENTRIES,
    reverse?: boolean
  ): IterableIterator<[unknown, unknown]>;
  override __iterator(
    type: typeof ITERATE_KEYS,
    reverse?: boolean
  ): IterableIterator<unknown>;
  override __iterator(
    type: typeof ITERATE_VALUES,
    reverse?: boolean
  ): IterableIterator<unknown>;
  override __iterator(
    type: IteratorType,
    reverse?: boolean
  ): IterableIterator<unknown>;
  override __iterator(
    type: IteratorType,
    reverse?: boolean
  ): IterableIterator<unknown> {
    const iterator = this._iter.__iterator(ITERATE_VALUES, reverse);
    return new Iterator<unknown>(() => {
      while (true) {
        const step = iterator.next();
        if (step.done) {
          return step;
        }
        const entry = step.value;
        // Check if entry exists first so array access doesn't throw for holes
        // in the parent iteration.
        if (entry) {
          validateEntry(entry);
          const indexedCollection = isCollection(entry);
          return iteratorValue(
            type,
            indexedCollection ? entry.get(0) : entry[0],
            indexedCollection ? entry.get(1) : entry[1],
            step
          );
        }
      }
    });
  }
}

// All four wrapping sequences cache through their wrapped `_iter`, which also
// fixes their own `size`.
// TODO [TS-MIGRATION] `cacheResultThrough` is typed against the loose wrapping
// shape while the prototypes expect `() => this` (see MutableSequence in
// factories.ts).
ToIndexedSequence.prototype.cacheResult =
  ToKeyedSequence.prototype.cacheResult =
  ToSetSequence.prototype.cacheResult =
  FromEntriesSequence.prototype.cacheResult =
    cacheResultThrough as <S>(this: S) => S;

class ConcatSeq extends SeqImpl<unknown, unknown> {
  // The concatenated sequence adopts the kind of its first wrapped iterable;
  // the brands are copied dynamically in the constructor.
  declare [IS_KEYED_SYMBOL]: boolean | undefined;
  declare [IS_INDEXED_SYMBOL]: boolean | undefined;
  declare [IS_ORDERED_SYMBOL]: boolean | undefined;

  private _wrappedIterables: Array<CollectionImpl<unknown, unknown>>;

  constructor(iterables: Array<CollectionImpl<unknown, unknown>>) {
    super();

    this._wrappedIterables = iterables.flatMap((iterable) => {
      // A nested ConcatSeq (detected by its own `_wrappedIterables`) is
      // flattened into the iterables it wraps.
      const wrappedIterables = (iterable as ConcatSeq)._wrappedIterables;
      if (wrappedIterables) {
        return wrappedIterables;
      }
      return [iterable];
    });
    this.size = this._wrappedIterables.reduce<number | undefined>(
      (sum, iterable) => {
        if (sum !== undefined) {
          const size = iterable.size;
          if (size !== undefined) {
            return sum + size;
          }
        }
        return undefined;
      },
      0
    );
    // The kind brands live on the concrete subclass prototypes, not on the
    // base collection type, so the first iterable is read through a loose view.
    const first = this._wrappedIterables[0]! as CollectionImpl<
      unknown,
      unknown
    > & {
      [IS_KEYED_SYMBOL]?: boolean;
      [IS_INDEXED_SYMBOL]?: boolean;
      [IS_ORDERED_SYMBOL]?: boolean;
    };
    this[IS_KEYED_SYMBOL] = first[IS_KEYED_SYMBOL];
    this[IS_INDEXED_SYMBOL] = first[IS_INDEXED_SYMBOL];
    this[IS_ORDERED_SYMBOL] = first[IS_ORDERED_SYMBOL];
  }

  // Arrow fields (not methods): the base declares the uncached hooks as
  // optional properties, so the overrides must also be properties (see
  // CollectionSeq in Seq.ts).
  override __iterateUncached = (
    fn: (value: unknown, key: unknown, iter: this) => unknown,
    reverse?: boolean
  ): number => {
    if (this._wrappedIterables.length === 0) {
      return 0;
    }

    if (reverse) {
      return this.cacheResult().__iterate(fn, reverse);
    }

    let iterableIndex = 0;
    const useKeys = isKeyed(this);
    const iteratorType = useKeys ? ITERATE_ENTRIES : ITERATE_VALUES;
    let currentIterator = this._wrappedIterables[iterableIndex]!.__iterator(
      iteratorType,
      reverse
    );

    let keepGoing = true;
    let index = 0;
    while (keepGoing) {
      let next = currentIterator.next();
      while (next.done) {
        iterableIndex++;
        if (iterableIndex === this._wrappedIterables.length) {
          return index;
        }
        currentIterator = this._wrappedIterables[iterableIndex]!.__iterator(
          iteratorType,
          reverse
        );
        next = currentIterator.next();
      }
      const fnResult = useKeys
        ? // `iteratorType` is ITERATE_ENTRIES here, so each step value is an entry.
          fn(
            (next.value as [unknown, unknown])[1],
            (next.value as [unknown, unknown])[0],
            this
          )
        : fn(next.value, index, this);
      keepGoing = fnResult !== false;
      index++;
    }
    return index;
  };

  override __iteratorUncached = (
    type: IteratorType,
    reverse?: boolean
  ): IterableIterator<unknown> => {
    if (this._wrappedIterables.length === 0) {
      return new Iterator<unknown>(iteratorDone);
    }

    if (reverse) {
      return this.cacheResult().__iterator(type, reverse);
    }

    let iterableIndex = 0;
    let currentIterator = this._wrappedIterables[iterableIndex]!.__iterator(
      type,
      reverse
    );
    return new Iterator<unknown>(() => {
      let next = currentIterator.next();
      while (next.done) {
        iterableIndex++;
        if (iterableIndex === this._wrappedIterables.length) {
          return next;
        }
        currentIterator = this._wrappedIterables[iterableIndex]!.__iterator(
          type,
          reverse
        );
        next = currentIterator.next();
      }
      return next;
    });
  };
}

export function concatFactory(
  collection: CollectionImpl<unknown, unknown>,
  values: Array<unknown>
): CollectionImpl<unknown, unknown> {
  const isKeyedCollection = isKeyed(collection);
  const iters = ([collection] as Array<unknown>)
    .concat(values)
    .map((v): CollectionImpl<unknown, unknown> => {
      if (!isCollection(v)) {
        return isKeyedCollection
          ? keyedSeqFromValue(v)
          : indexedSeqFromValue(Array.isArray(v) ? v : [v]);
      }
      if (isKeyedCollection) {
        // TODO [TS-MIGRATION] the base collection type is not statically
        // iterable yet ([Symbol.iterator] still lives in the mixin), while
        // `KeyedCollection` only accepts iterables of entries.
        return KeyedCollection(v as unknown as Iterable<[unknown, unknown]>);
      }
      return v;
    })
    .filter((v) => v.size !== 0);

  if (iters.length === 0) {
    return collection;
  }

  if (iters.length === 1) {
    const singleton = iters[0]!;
    if (
      singleton === collection ||
      (isKeyedCollection && isKeyed(singleton)) ||
      (isIndexed(collection) && isIndexed(singleton))
    ) {
      return singleton;
    }
  }

  return new ConcatSeq(iters);
}

function validateEntry(entry: unknown): void {
  if (entry !== Object(entry)) {
    throw new TypeError('Expected [K, V] tuple: ' + entry);
  }
}
