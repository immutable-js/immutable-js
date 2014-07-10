import SequenceModule = require('./Sequence');
import Sequence = SequenceModule.Sequence;

declare function Set<T>(): Set<T>;
declare function Set<T>(...values: T[]): Set<T>;

declare module Set {
  function empty(): Set<any>;
  function fromArray<T>(values: T[]): Set<T>;
}

interface Set<T> extends Sequence<T, T, Set<T>> {
  length: number;
  has(value: T): boolean;
  clear(): Set<T>;
  add(value: T): Set<T>;
  delete(value: T): Set<T>;
  merge(seq: Sequence<any, T, any>): Set<T>;
  merge(seq: Array<T>): Set<T>;
  asMutable(): Set<T>;
  asImmutable(): Set<T>;
  clone(): Set<T>;
}

export = Set;
