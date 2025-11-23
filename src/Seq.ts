import {
  CollectionImpl,
  IndexedCollectionImpl,
  KeyedCollectionImpl,
  SetCollectionImpl,
} from './Collection';
import {
  Iterator,
  iteratorValue,
  iteratorDone,
  hasIterator,
  isIterator,
  getIterator,
  isEntriesIterable,
  isKeysIterable,
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
export function Seq(value?: unknown) {
  return value === undefined || value === null
    ? emptySequence()
    : isImmutable(value)
      ? value.toSeq()
      : seqFromValue(value);
}

type IterateFunction<K, V, thisType> = (
  value: V,
  index: K,
  iter: thisType
) => boolean | void;

export abstract class SeqImpl<K, V> extends CollectionImpl<K, V> {
  private _cache: Array<[K, V]> | undefined;

  private __iteratorUncached:
    | undefined
    | ((fn: IteratorType, reverse: boolean | undefined) => Iterator<V>);

  override toSeq(): SeqImpl<K, V> {
    return this;
  }

  override toString() {
    return this.__toString('Seq {', '}');
  }

  cacheResult(): this {
    if (!this._cache /* && this.__iterateUncached */) {
      this._cache = this.entrySeq().toArray();
      this.size = this._cache.length;
    }
    return this;
  }

  override __iterate(
    fn: IterateFunction<K, V, typeof this>,
    reverse?: boolean
  ): number {
    const cache = this._cache;
    if (cache) {
      const size = cache.length;
      let i = 0;
      while (i !== size) {
        const entry = cache[reverse ? size - ++i : i++];
        if (!entry) {
          throw new Error('Unexpected undefined entry in cache');
        }

        if (fn(entry[1], entry[0], this) === false) {
          break;
        }
      }
      return i;
    }
    return this.__iterateUncached(fn, reverse);
  }

  // abstract __iteratorUncached(type, reverse)

  override __iterator(
    type: IteratorType,
    reverse: boolean = false
  ): Iterator<V> {
    const cache = this._cache;
    if (cache) {
      const size = cache.length;
      let i = 0;
      return new Iterator(() => {
        if (i === size) {
          return iteratorDone();
        }
        const entry = cache[reverse ? size - ++i : i++];

        if (!entry) {
          throw new Error('Unexpected undefined entry in cache');
        }

        return iteratorValue(type, entry[0], entry[1]);
      });
    }
    return this.__iteratorUncached(type, reverse);
  }

  abstract __iterateUncached(
    fn: IterateFunction<K, V, typeof this>,
    reverse?: boolean
  ): number;
}

export function KeyedSeq<K, V>(
  collection?: Iterable<[K, V]>
): KeyedSeqImpl<K, V>;
export function KeyedSeq<V>(obj: { [key: string]: V }): KeyedSeqImpl<string, V>;
export function KeyedSeq(value: unknown) {
  return value === undefined || value === null
    ? emptySequence().toKeyedSeq()
    : isCollection(value)
      ? isKeyed(value)
        ? value.toSeq()
        : value.fromEntrySeq()
      : isRecord(value)
        ? value.toSeq()
        : keyedSeqFromValue(value);
}

export abstract class KeyedSeqImpl<K, V> extends SeqImpl<K, V> {
  toKeyedSeq() {
    return this;
  }
}

export function IndexedSeq<T>(
  collection?: Iterable<T> | ArrayLike<T>
): IndexedSeqImpl<T>;
export function IndexedSeq<T>(
  value?: Iterable<T> | ArrayLike<T>
): IndexedSeqImpl<T> {
  return value === undefined || value === null
    ? emptySequence()
    : isCollection(value)
      ? isKeyed(value)
        ? value.entrySeq()
        : value.toIndexedSeq()
      : isRecord(value)
        ? value.toSeq().entrySeq()
        : indexedSeqFromValue(value);
}

IndexedSeq.of = function <T>(...values: Array<T>): IndexedSeqImpl<T> {
  return IndexedSeq(values);
};

export class IndexedSeqImpl<T> extends SeqImpl<number, T> {
  toIndexedSeq() {
    return this;
  }

  override toString() {
    return this.__toString('Seq [', ']');
  }
}
export function SetSeq<T>(
  collection?: Iterable<T> | ArrayLike<T>
): SetSeqImpl<T>;

export function SetSeq<T>(value?: Iterable<T> | ArrayLike<T>): SetSeqImpl<T> {
  return (
    isCollection(value) && !isAssociative(value) ? value : IndexedSeq(value)
  ).toSetSeq();
}

SetSeq.of = function <T>(...values: Array<T>): SetSeqImpl<T> {
  return SetSeq(values);
};

export class SetSeqImpl<T> extends SeqImpl<T, T> {
  toSetSeq() {
    return this;
  }
}

Seq.isSeq = isSeq;
Seq.Keyed = KeyedSeq;
Seq.Set = SetSeq;
Seq.Indexed = IndexedSeq;

SeqImpl.prototype[IS_SEQ_SYMBOL] = true;

// #pragma Root Sequences

export class ArraySeq<T> extends IndexedSeqImpl<T> {
  private _array: ArrayLike<T>;

  constructor(array: ArrayLike<T>) {
    super();
    this._array = array;
    this.size = array.length;
  }

  get(index: number, notSetValue?: T): T | undefined {
    return this.has(index) ? this._array[wrapIndex(this, index)] : notSetValue;
  }

  override __iterate(
    fn: (value: T, index: number, iter: this) => boolean,
    reverse?: boolean
  ): number {
    const array = this._array;
    const size = array.length;
    let i = 0;
    while (i !== size) {
      const ii = reverse ? size - ++i : i++;
      if (fn(array[ii], ii, this) === false) {
        break;
      }
    }
    return i;
  }

  override __iterator(type: IteratorType, reverse?: boolean): Iterator<T> {
    const array = this._array;
    const size = array.length;
    let i = 0;
    return new Iterator((): IteratorResult<T> => {
      if (i === size) {
        return iteratorDone();
      }
      const ii = reverse ? size - ++i : i++;

      return iteratorValue(type, ii, array[ii]);
    });
  }
}

class ObjectSeq<K extends string, V> extends KeyedSeqImpl<K, V> {
  private _object: { [key: string]: V };

  private _keys: string[];

  constructor(object: { [key: string]: V }) {
    super();
    const keys = Object.keys(object).concat(
      Object.getOwnPropertySymbols ? Object.getOwnPropertySymbols(object) : []
    );
    this._object = object;
    this._keys = keys;
    this.size = keys.length;
  }

  get(key: K, notSetValue?: V): V | undefined {
    if (notSetValue !== undefined && !this.has(key)) {
      return notSetValue;
    }
    return this._object[key];
  }

  has(key: K): boolean {
    return hasOwnProperty.call(this._object, key);
  }

  override __iterate(
    fn: (value: V, key: K, iter: this) => boolean,
    reverse?: boolean
  ): number {
    const object = this._object;
    const keys = this._keys;
    const size = keys.length;
    let i = 0;
    while (i !== size) {
      const key = keys[reverse ? size - ++i : i++];
      if (fn(object[key], key, this) === false) {
        break;
      }
    }
    return i;
  }

  override __iterator(type: IteratorType, reverse?: boolean): Iterator<V> {
    const object = this._object;
    const keys = this._keys;
    const size = keys.length;
    let i = 0;
    return new Iterator(() => {
      if (i === size) {
        return iteratorDone();
      }
      const key = keys[reverse ? size - ++i : i++];
      return iteratorValue(type, key, object[key]);
    });
  }
}
ObjectSeq.prototype[IS_ORDERED_SYMBOL] = true;

class CollectionSeq<T> extends IndexedSeqImpl<T> {
  private _collection: CollectionImpl<T, T> | ArrayLike<T>;

  constructor(collection: CollectionImpl<T, T> | ArrayLike<T>) {
    super();
    this._collection = collection;
    this.size = collection.length || collection.size;
  }

  __iterateUncached(fn, reverse) {
    if (reverse) {
      return this.cacheResult().__iterate(fn, reverse);
    }
    const collection = this._collection;
    const iterator = getIterator(collection);
    let iterations = 0;
    if (isIterator(iterator)) {
      let step;
      while (!(step = iterator.next()).done) {
        if (fn(step.value, iterations++, this) === false) {
          break;
        }
      }
    }
    return iterations;
  }

  __iteratorUncached(type, reverse) {
    if (reverse) {
      return this.cacheResult().__iterator(type, reverse);
    }
    const collection = this._collection;
    const iterator = getIterator(collection);
    if (!isIterator(iterator)) {
      return new Iterator(iteratorDone);
    }
    let iterations = 0;
    return new Iterator(() => {
      const step = iterator.next();
      return step.done ? step : iteratorValue(type, iterations++, step.value);
    });
  }
}

// # pragma Helper functions
function emptySequence(): ArraySeq<never> {
  return new ArraySeq([]);
}

export function keyedSeqFromValue(value) {
  const seq = maybeIndexedSeqFromValue(value);
  if (seq) {
    return seq.fromEntrySeq();
  }
  if (typeof value === 'object') {
    return new ObjectSeq(value);
  }
  throw new TypeError(
    'Expected Array or collection object of [k, v] entries, or keyed object: ' +
      value
  );
}

export function indexedSeqFromValue(value) {
  const seq = maybeIndexedSeqFromValue(value);
  if (seq) {
    return seq;
  }
  throw new TypeError(
    'Expected Array or collection object of values: ' + value
  );
}

function seqFromValue(value) {
  const seq = maybeIndexedSeqFromValue(value);
  if (seq) {
    return isEntriesIterable(value)
      ? seq.fromEntrySeq()
      : isKeysIterable(value)
        ? seq.toSetSeq()
        : seq;
  }
  if (typeof value === 'object') {
    return new ObjectSeq(value);
  }
  throw new TypeError(
    'Expected Array or collection object of values, or keyed object: ' + value
  );
}

function maybeIndexedSeqFromValue<V>(
  value: unknown
): IndexedSeqImpl<V> | undefined {
  return isArrayLike<V>(value)
    ? new ArraySeq(value)
    : hasIterator<V>(value)
      ? new CollectionSeq(value)
      : undefined;
}
