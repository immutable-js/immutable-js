import LazyIndexedSequence = require('./LazyIndexedSequence');
import Vector = require('./Vector');
import Map = require('./Map');
import Set = require('./Set');

declare class LazySequence<K, V, C> {

  toString(): string;

  toArray(): Array<V>;

  toObject(): Object;

  toVector(): Vector<V>;

  toMap(): Map<K, V>;

  toSet(): Set<V>;

  join(separator?: string): string;

  reverse(): LazySequence<K, V, C>;

  keys(): LazyIndexedSequence<K, C>;

  values(): LazyIndexedSequence<V, C>;

  entries(): LazyIndexedSequence</*(K, V)*/Array<any>, C>;

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

  flip(): LazySequence<V, K, C>;

  map<M>(
    mapper: (value?: V, key?: K, collection?: C) => M,
    context?: any
  ): LazySequence<K, M, C>;

  filter(
    predicate: (value?: V, key?: K, collection?: C) => boolean,
    context?: any
  ): LazySequence<K, V, C>;

  take(amount: number): LazySequence<K, V, C>;

  takeWhile(
    predicate: (value?: V, key?: K, collection?: C) => boolean,
    context?: any
  ): LazySequence<K, V, C>;

  takeUntil(
    predicate: (value?: V, key?: K, collection?: C) => boolean,
    context?: any
  ): LazySequence<K, V, C>;

  skip(amount: number): LazySequence<K, V, C>;

  skipWhile(
    predicate: (value?: V, key?: K, collection?: C) => boolean,
    context?: any
  ): LazySequence<K, V, C>;

  skipUntil(
    predicate: (value?: V, key?: K, collection?: C) => boolean,
    context?: any
  ): LazySequence<K, V, C>;
}

export = LazySequence;
