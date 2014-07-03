import IndexedSequence = require('./IndexedSequence');
import ArraySequence = require('./ArraySequence');
import ObjectSequence = require('./ObjectSequence');
import Vector = require('./Vector');
import Map = require('./Map');
import Set = require('./Set');

declare function Sequence<V, C>(seq: IndexedSequence<V, C>): IndexedSequence<V, C>;
declare function Sequence<K, V, C>(seq: Sequence<K, V, C>): Sequence<K, V, C>;
declare function Sequence<T>(array: Array<T>): ArraySequence<T>;
declare function Sequence<T>(obj: {[key: string]: T}): ObjectSequence<T>;

interface Sequence<K, V, C> {

  toString(): string;

  toArray(): Array<V>;

  toObject(): Object;

  toVector(): Vector<V>;

  toMap(): Map<K, V>;

  toSet(): Set<V>;

  join(separator?: string): string;

  reverse(): Sequence<K, V, C>;

  keys(): IndexedSequence<K, C>;

  values(): IndexedSequence<V, C>;

  entries(): IndexedSequence</*(K, V)*/Array<any>, C>;

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

  flip(): Sequence<V, K, C>;

  map<M>(
    mapper: (value?: V, key?: K, collection?: C) => M,
    context?: any
  ): Sequence<K, M, C>;

  filter(
    predicate: (value?: V, key?: K, collection?: C) => boolean,
    context?: any
  ): Sequence<K, V, C>;

  take(amount: number): Sequence<K, V, C>;

  takeWhile(
    predicate: (value?: V, key?: K, collection?: C) => boolean,
    context?: any
  ): Sequence<K, V, C>;

  takeUntil(
    predicate: (value?: V, key?: K, collection?: C) => boolean,
    context?: any
  ): Sequence<K, V, C>;

  skip(amount: number): Sequence<K, V, C>;

  skipWhile(
    predicate: (value?: V, key?: K, collection?: C) => boolean,
    context?: any
  ): Sequence<K, V, C>;

  skipUntil(
    predicate: (value?: V, key?: K, collection?: C) => boolean,
    context?: any
  ): Sequence<K, V, C>;
}

export = Sequence;
