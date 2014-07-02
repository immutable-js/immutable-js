import LazyIterable = require('./LazyIterable');

declare class Set<T> extends LazyIterable<T, T, Set<T>> {

  /**
   *
   */
  (...values: T[]): Set<T>;

  static empty(): Set<any>;
  static fromArray<T>(values: T[]): Set<T>;
  public length: number;
  public has(value: T): boolean;
  public empty(): Set<T>;
  public add(value: T): Set<T>;
  public delete(value: T): Set<T>;
  public equals(other: Set<T>): boolean;
  public merge(seq: LazyIterable<any, T, any>): Set<T>;
  public isTransient(): boolean;
  public asTransient(): Set<T>;
  public asPersistent(): Set<T>;
  public clone(): Set<T>;
}

export = Set;
