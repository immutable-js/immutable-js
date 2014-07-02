import IndexedLazyIterable = require('./IndexedLazyIterable');
import Vector = require('./Vector');
import Map = require('./Map');
import Set = require('./Set');

declare class OrderedLazyIterable<K, V, C> {

  toArray(): Array<V>;

  toObject(): Object;

  toVector(): Vector<V>;

  toMap(): Map<K, V>;

  toSet(): Set<V>;

  reverse(): OrderedLazyIterable<K, V, C>;

  keys(): IndexedLazyIterable<K, C>;

  values(): IndexedLazyIterable<V, C>;

  entries(): IndexedLazyIterable</*(K, V)*/Array<any>, C>;

  forEach(
    fn: (value?: V, key?: K, collection?: C) => any,
    context?: any
  ): void;

  first(
    predicate?: (value?: V, index?: number, collection?: C) => boolean,
    context?: any
  ): V;

  last(
    predicate?: (value?: V, index?: number, collection?: C) => boolean,
    context?: any
  ): V;

  reduce<R>(
    reducer: (reduction?: R, value?: V, key?: K, collection?: C) => R,
    initialReduction?: R,
    context?: any
  ): R;

  reduceRight<R>(
    reducer: (reduction?: R, value?: V, key?: K, collection?: C) => R,
    initialReduction: R,
    context?: any
  ): R;

  every(
    predicate: (value?: V, key?: K, collection?: C) => boolean,
    context?: any
  ): boolean;

  some(
    predicate: (value?: V, key?: K, collection?: C) => boolean,
    context?: any
  ): boolean;

  find(
    predicate: (value?: V, key?: K, collection?: C) => boolean,
    context?: any
  ): V;

  findKey(
    predicate: (value?: V, key?: K, collection?: C) => boolean,
    context?: any
  ): K;

  findLast(
    predicate: (value?: V, key?: K, collection?: C) => boolean,
    context?: any
  ): V;

  findLastKey(
    predicate: (value?: V, key?: K, collection?: C) => boolean,
    context?: any
  ): K;

  flip(): OrderedLazyIterable<V, K, C>;

  map<M>(
    mapper: (value?: V, key?: K, collection?: C) => M,
    context?: any
  ): OrderedLazyIterable<K, M, C>;

  filter(
    predicate: (value?: V, key?: K, collection?: C) => boolean,
    context?: any
  ): OrderedLazyIterable<K, V, C>;

  take(amount: number): OrderedLazyIterable<K, V, C>;

  takeWhile(
    predicate: (value?: V, key?: K, collection?: C) => boolean,
    context?: any
  ): OrderedLazyIterable<K, V, C>;

  takeUntil(
    predicate: (value?: V, key?: K, collection?: C) => boolean,
    context?: any
  ): OrderedLazyIterable<K, V, C>;

  skip(amount: number): OrderedLazyIterable<K, V, C>;

  skipWhile(
    predicate: (value?: V, key?: K, collection?: C) => boolean,
    context?: any
  ): OrderedLazyIterable<K, V, C>;

  skipUntil(
    predicate: (value?: V, key?: K, collection?: C) => boolean,
    context?: any
  ): OrderedLazyIterable<K, V, C>;
}

export = OrderedLazyIterable;
