import {
  CollectionImpl,
  IndexedCollectionImpl,
  KeyedCollectionImpl,
  SetCollectionImpl,
} from './Collection';
import {
  getIterator,
  hasIterator,
  isEntriesIterable,
  isIterator,
  isKeysIterable,
  ITERATE_ENTRIES,
  ITERATE_KEYS,
  ITERATE_VALUES,
  Iterator,
  iteratorDone,
  iteratorValue,
  type IteratorType,
} from './Iterator';
import { wrapIndex } from './TrieUtils';
import { isAssociative } from './predicates/isAssociative';
import { isCollection } from './predicates/isCollection';
import { isImmutable } from './predicates/isImmutable';
import { isKeyed } from './predicates/isKeyed';
import { IS_ORDERED_SYMBOL } from './predicates/isOrdered';
import { isRecord } from './predicates/isRecord';
import { IS_SEQ_SYMBOL, isSeq } from './predicates/isSeq';
import hasOwnProperty from './utils/hasOwnProperty';
import isArrayLike from './utils/isArrayLike';

// Materialize a lazy sequence's entries into `_cache` (and fix its `size`) so
// the base `__iterate`/`__iterator` can iterate the cache. A no-op for
// sequences without an `__iterateUncached` hook (ArraySeq/ObjectSeq).
function cacheResultOf<S extends CollectionImpl<unknown, unknown>>(seq: S): S {
  if (!seq._cache && seq.__iterateUncached) {
    seq._cache = seq.entrySeq().toArray();
    seq.size = seq._cache.length;
  }
  return seq;
}

export function Seq<S extends SeqImpl<unknown, unknown>>(seq: S): S;
export function Seq<K, V>(
  collection: KeyedCollectionImpl<K, V>
): KeyedSeqImpl<K, V>;
export function Seq<T>(collection: SetCollectionImpl<T>): SetSeqImpl<T>;
export function Seq<T>(
  collection: IndexedCollectionImpl<T> | Iterable<T> | ArrayLike<T>
): IndexedSeqImpl<T>;
export function Seq<V>(obj: { [key: string]: V }): KeyedSeqImpl<string, V>;
export function Seq<K = unknown, V = unknown>(): SeqImpl<K, V>;
export function Seq(value: unknown): SeqImpl<unknown, unknown>;
export function Seq(value?: unknown): SeqImpl<unknown, unknown> {
  return value === undefined || value === null
    ? emptySequence()
    : isImmutable(value)
      ? // TODO [TS-MIGRATION] `value` may be a Record, still typed via the d.ts;
        // its `toSeq()` returns the public Seq type rather than the impl.
        (value.toSeq() as unknown as SeqImpl<unknown, unknown>)
      : seqFromValue(value);
}

export class SeqImpl<K, V> extends CollectionImpl<K, V> {
  declare [IS_SEQ_SYMBOL]: true;

  override toSeq(): this {
    return this;
  }

  override toString(): string {
    return this.__toString('Seq {', '}');
  }

  cacheResult(): this {
    return cacheResultOf(this);
  }

  override partition<F extends V, C>(
    predicate: (this: C, value: V, key: K, iter: this) => value is F,
    context?: C
  ): [SeqImpl<K, V>, SeqImpl<K, F>];
  override partition<C>(
    predicate: (this: C, value: V, key: K, iter: this) => unknown,
    context?: C
  ): [this, this];
  override partition(
    predicate: (value: V, key: K, iter: this) => unknown,
    context?: unknown
  ): unknown {
    return super.partition(predicate, context);
  }
}

export function KeyedSeq<K, V>(
  collection?: Iterable<[K, V]>
): KeyedSeqImpl<K, V>;
export function KeyedSeq<V>(obj: { [key: string]: V }): KeyedSeqImpl<string, V>;
export function KeyedSeq(value?: unknown): KeyedSeqImpl<unknown, unknown>;
export function KeyedSeq(value?: unknown): KeyedSeqImpl<unknown, unknown> {
  return value === undefined || value === null
    ? emptySequence().toKeyedSeq()
    : isCollection(value)
      ? isKeyed(value)
        ? value.toSeq()
        : value.fromEntrySeq()
      : isRecord(value)
        ? // TODO [TS-MIGRATION] Record is still typed via the d.ts
          (value.toSeq() as unknown as KeyedSeqImpl<unknown, unknown>)
        : keyedSeqFromValue(value);
}

export class KeyedSeqImpl<K, V> extends KeyedCollectionImpl<K, V> {
  declare [IS_SEQ_SYMBOL]: true;

  /**
   * Returns a new Seq with other collections concatenated to this one.
   *
   * All entries will be present in the resulting Seq, even if they
   * have the same key.
   *
   * Provided by the mixin (CollectionImpl.js); typed per the public contract.
   * Not declared on `SeqImpl`: a `declare` property is checked with strict
   * parameter contravariance, and a base-level `concat` would break the
   * structural `*SeqImpl` → `SeqImpl` assignability `toSeq` relies on. The
   * base-level `concat` arrives with the mixin migration, as a real (bivariant)
   * method.
   */
  declare concat: {
    <KC, VC>(
      ...collections: Array<Iterable<[KC, VC]>>
    ): KeyedSeqImpl<K | KC, V | VC>;
    <C>(
      ...collections: Array<{ [key: string]: C }>
    ): KeyedSeqImpl<K | string, V | C>;
  };

  override toSeq(): this {
    return this;
  }

  override toKeyedSeq(): this {
    return this;
  }

  override toString(): string {
    return this.__toString('Seq {', '}');
  }

  cacheResult(): this {
    return cacheResultOf(this);
  }

  override partition<F extends V, C>(
    predicate: (this: C, value: V, key: K, iter: this) => value is F,
    context?: C
  ): [KeyedSeqImpl<K, V>, KeyedSeqImpl<K, F>];
  override partition<C>(
    predicate: (this: C, value: V, key: K, iter: this) => unknown,
    context?: C
  ): [this, this];
  override partition(
    predicate: (value: V, key: K, iter: this) => unknown,
    context?: unknown
  ): unknown {
    return super.partition(predicate, context);
  }
}

export function IndexedSeq<T>(
  value?: Iterable<T> | ArrayLike<T>
): IndexedSeqImpl<T>;
export function IndexedSeq(value: unknown): IndexedSeqImpl<unknown>;
export function IndexedSeq(value?: unknown): IndexedSeqImpl<unknown> {
  return value === undefined || value === null
    ? emptySequence()
    : isCollection(value)
      ? isKeyed(value)
        ? value.entrySeq()
        : value.toIndexedSeq()
      : isRecord(value)
        ? // TODO [TS-MIGRATION] Record is still typed via the d.ts
          (value.toSeq().entrySeq() as unknown as IndexedSeqImpl<unknown>)
        : indexedSeqFromValue(value);
}

IndexedSeq.of = function <T>(...values: Array<T>): IndexedSeqImpl<T> {
  return IndexedSeq(values);
};

export class IndexedSeqImpl<T> extends IndexedCollectionImpl<T> {
  declare [IS_SEQ_SYMBOL]: true;

  /**
   * Returns a new Seq with other collections concatenated to this one.
   *
   * Provided by the mixin (CollectionImpl.js); typed per the public contract
   * (see `KeyedSeqImpl.concat` for why it is not on `SeqImpl`).
   */
  declare concat: <C>(
    ...valuesOrCollections: Array<Iterable<C> | C>
  ) => IndexedSeqImpl<T | C>;

  override toSeq(): this {
    return this;
  }

  override toIndexedSeq(): this {
    return this;
  }

  override toString(): string {
    return this.__toString('Seq [', ']');
  }

  cacheResult(): this {
    return cacheResultOf(this);
  }

  override partition<F extends T, C>(
    predicate: (this: C, value: T, index: number, iter: this) => value is F,
    context?: C
  ): [IndexedSeqImpl<T>, IndexedSeqImpl<F>];
  override partition<C>(
    predicate: (this: C, value: T, index: number, iter: this) => unknown,
    context?: C
  ): [this, this];
  override partition(
    predicate: (value: T, index: number, iter: this) => unknown,
    context?: unknown
  ): unknown {
    return super.partition(predicate, context);
  }
}

export function SetSeq<T>(value?: Iterable<T> | ArrayLike<T>): SetSeqImpl<T>;
export function SetSeq(value?: unknown): SetSeqImpl<unknown> {
  return (
    isCollection(value) && !isAssociative(value) ? value : IndexedSeq(value)
  ).toSetSeq();
}

SetSeq.of = function <T>(...values: Array<T>): SetSeqImpl<T> {
  return SetSeq(values);
};

export class SetSeqImpl<T> extends SetCollectionImpl<T> {
  declare [IS_SEQ_SYMBOL]: true;

  /**
   * Returns a new Seq with other collections concatenated to this one.
   *
   * All entries will be present in the resulting Seq, even if they
   * are duplicates.
   *
   * Provided by the mixin (CollectionImpl.js); typed per the public contract
   * (see `KeyedSeqImpl.concat` for why it is not on `SeqImpl`).
   */
  declare concat: <U>(...collections: Array<Iterable<U>>) => SetSeqImpl<T | U>;

  override toSeq(): this {
    return this;
  }

  override toSetSeq(): this {
    return this;
  }

  override toString(): string {
    return this.__toString('Seq {', '}');
  }

  cacheResult(): this {
    return cacheResultOf(this);
  }

  override partition<F extends T, C>(
    predicate: (this: C, value: T, key: T, iter: this) => value is F,
    context?: C
  ): [SetSeqImpl<T>, SetSeqImpl<F>];
  override partition<C>(
    predicate: (this: C, value: T, key: T, iter: this) => unknown,
    context?: C
  ): [this, this];
  override partition(
    predicate: (value: T, key: T, iter: this) => unknown,
    context?: unknown
  ): unknown {
    return super.partition(predicate, context);
  }
}

Seq.isSeq = isSeq;
Seq.Keyed = KeyedSeq;
Seq.Set = SetSeq;
Seq.Indexed = IndexedSeq;

SeqImpl.prototype[IS_SEQ_SYMBOL] = true;
KeyedSeqImpl.prototype[IS_SEQ_SYMBOL] = true;
IndexedSeqImpl.prototype[IS_SEQ_SYMBOL] = true;
SetSeqImpl.prototype[IS_SEQ_SYMBOL] = true;

// #pragma Root Sequences

export class ArraySeq<T> extends IndexedSeqImpl<T> {
  private _array: ArrayLike<T>;

  constructor(array: ArrayLike<T>) {
    super();
    this._array = array;
    this.size = array.length;
  }

  override get<NSV>(index: number, notSetValue: NSV): T | NSV;
  override get(index: number): T | undefined;
  override get(index: number, notSetValue?: unknown): unknown {
    return this.has(index) ? this._array[wrapIndex(this, index)] : notSetValue;
  }

  override __iterate(
    fn: (value: T, index: number, iter: this) => unknown,
    reverse?: boolean
  ): number {
    const array = this._array;
    const size = array.length;
    let i = 0;
    while (i !== size) {
      const ii = reverse ? size - ++i : i++;
      if (fn(array[ii]!, ii, this) === false) {
        break;
      }
    }
    return i;
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
    const array = this._array;
    const size = array.length;
    let i = 0;
    return new Iterator<number | T | [number, T]>(() => {
      if (i === size) {
        return iteratorDone();
      }
      const ii = reverse ? size - ++i : i++;
      return iteratorValue(type, ii, array[ii]!);
    });
  }
}

class ObjectSeq<V> extends KeyedSeqImpl<string, V> {
  declare [IS_ORDERED_SYMBOL]: true;
  private _object: { [key: string]: V };
  private _keys: Array<string>;

  constructor(object: { [key: string]: V }) {
    super();
    const keys = Object.keys(object).concat(
      // Symbol keys are iterated too at runtime; the index signature only models
      // string keys, so treat the symbols as string keys at this boundary.
      Object.getOwnPropertySymbols
        ? (Object.getOwnPropertySymbols(object) as unknown as Array<string>)
        : []
    );
    this._object = object;
    this._keys = keys;
    this.size = keys.length;
  }

  override get<NSV>(key: string, notSetValue: NSV): V | NSV;
  override get(key: string): V | undefined;
  override get(key: string, notSetValue?: unknown): unknown {
    if (notSetValue !== undefined && !this.has(key)) {
      return notSetValue;
    }
    return this._object[key];
  }

  override has(key: string): boolean {
    return hasOwnProperty.call(this._object, key);
  }

  override __iterate(
    fn: (value: V, key: string, iter: this) => unknown,
    reverse?: boolean
  ): number {
    const object = this._object;
    const keys = this._keys;
    const size = keys.length;
    let i = 0;
    while (i !== size) {
      const key = keys[reverse ? size - ++i : i++]!;
      if (fn(object[key]!, key, this) === false) {
        break;
      }
    }
    return i;
  }

  override __iterator(
    type: typeof ITERATE_ENTRIES,
    reverse?: boolean
  ): IterableIterator<[string, V]>;
  override __iterator(
    type: typeof ITERATE_KEYS,
    reverse?: boolean
  ): IterableIterator<string>;
  override __iterator(
    type: typeof ITERATE_VALUES,
    reverse?: boolean
  ): IterableIterator<V>;
  override __iterator(
    type: IteratorType,
    reverse?: boolean
  ): IterableIterator<string | V | [string, V]>;
  override __iterator(
    type: IteratorType,
    reverse?: boolean
  ): IterableIterator<string | V | [string, V]> {
    const object = this._object;
    const keys = this._keys;
    const size = keys.length;
    let i = 0;
    return new Iterator<string | V | [string, V]>(() => {
      if (i === size) {
        return iteratorDone();
      }
      const key = keys[reverse ? size - ++i : i++]!;
      return iteratorValue(type, key, object[key]!);
    });
  }
}
ObjectSeq.prototype[IS_ORDERED_SYMBOL] = true;

class CollectionSeq<T> extends IndexedSeqImpl<T> {
  private _collection: Iterable<T> | ArrayLike<T>;

  constructor(collection: Iterable<T> | ArrayLike<T>) {
    super();
    this._collection = collection;
    // The wrapped value exposes a length (array-like) or a size (collection).
    const sized = collection as { length?: number; size?: number };
    this.size = sized.length || sized.size;
  }

  // Arrow fields (not methods): the base declares these as optional properties,
  // so the override must also be a property. This matches how the operation
  // factories assign `__iterate*Uncached` as instance properties.
  override __iterateUncached = (
    fn: (value: T, index: number, iter: this) => unknown,
    reverse?: boolean
  ): number => {
    if (reverse) {
      return this.cacheResult().__iterate(fn, reverse);
    }
    const collection = this._collection;
    const iterator = getIterator(collection);
    let iterations = 0;
    if (isIterator(iterator)) {
      let step;
      while (!(step = iterator.next()).done) {
        if (fn(step.value as T, iterations++, this) === false) {
          break;
        }
      }
    }
    return iterations;
  };

  override __iteratorUncached = (
    type: IteratorType,
    reverse?: boolean
  ): IterableIterator<number | T | [number, T]> => {
    if (reverse) {
      return this.cacheResult().__iterator(type, reverse);
    }
    const collection = this._collection;
    const iterator = getIterator(collection);
    if (!isIterator(iterator)) {
      return new Iterator<number | T | [number, T]>(iteratorDone);
    }
    let iterations = 0;
    return new Iterator(() => {
      const step = iterator.next();
      return step.done
        ? step
        : iteratorValue(type, iterations++, step.value as T);
    });
  };
}

// # pragma Helper functions
function emptySequence(): ArraySeq<never> {
  return new ArraySeq([]);
}

export function keyedSeqFromValue(
  value: unknown
): KeyedSeqImpl<unknown, unknown> {
  const seq = maybeIndexedSeqFromValue(value);
  if (seq) {
    return seq.fromEntrySeq();
  }
  if (typeof value === 'object' && value !== null) {
    return new ObjectSeq(value as { [key: string]: unknown });
  }
  throw new TypeError(
    'Expected Array or collection object of [k, v] entries, or keyed object: ' +
      value
  );
}

export function indexedSeqFromValue(value: unknown): IndexedSeqImpl<unknown> {
  const seq = maybeIndexedSeqFromValue(value);
  if (seq) {
    return seq;
  }
  throw new TypeError(
    'Expected Array or collection object of values: ' + value
  );
}

function seqFromValue(value: unknown): SeqImpl<unknown, unknown> {
  const seq = maybeIndexedSeqFromValue(value);
  if (seq) {
    return isEntriesIterable(value)
      ? seq.fromEntrySeq()
      : isKeysIterable(value)
        ? seq.toSetSeq()
        : seq;
  }
  if (typeof value === 'object' && value !== null) {
    return new ObjectSeq(value as { [key: string]: unknown });
  }
  throw new TypeError(
    'Expected Array or collection object of values, or keyed object: ' + value
  );
}

function maybeIndexedSeqFromValue<V>(
  value: unknown
): IndexedSeqImpl<V> | undefined {
  return isArrayLike(value)
    ? new ArraySeq(value as ArrayLike<V>)
    : hasIterator(value)
      ? new CollectionSeq(value as Iterable<V>)
      : undefined;
}
