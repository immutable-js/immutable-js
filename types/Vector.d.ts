import LazyIndexedSequence = require('./LazyIndexedSequence');
import LazySequence = require('./LazySequence');

declare function Vector<T>(): Vector<T>;
declare function Vector<T>(...values: T[]): Vector<T>;

declare module Vector {
  function empty(): Vector<any>;
  function fromArray<T>(values: T[]): Vector<T>;
}

interface Vector<T> extends LazyIndexedSequence<T, Vector<T>> {
  length: number;
  has(index: number): boolean;
  get(index: number, undefinedValue?: T): T;
  getIn(indexPath: any[], pathOffset?: number): any;
  first(): T;
  last(): T;
  equals(other: Vector<T>): boolean;
  empty(): Vector<T>;
  set(index: number, value: T): Vector<T>;
  setIn(keyPath: any[], v: any, pathOffset?: number): Vector<T>;
  push(...values: T[]): Vector<T>;
  pop(): Vector<T>;
  delete(index: number): Vector<T>;
  deleteIn(keyPath: any[], pathOffset?: number): Vector<T>;
  unshift(...values: T[]): Vector<T>;
  shift(): Vector<T>;
  merge(seq: LazySequence<number, T, any>): Vector<T>;
  concat(...valuesOrSequences: Array<any>): Vector<T>;
  slice(begin: number, end?: number): Vector<T>;
  splice(index: number, removeNum: number, ...values: T[]): Vector<T>;
  isTransient(): boolean;
  asTransient(): Vector<T>;
  asPersistent(): Vector<T>;
  clone(): Vector<T>;
  __iterator__(): {next(): /*(number, T)*/Array<any>}
}

export = Vector;
