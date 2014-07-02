import LazyIterable = require('./LazyIterable');
import OrderedLazyIterable = require('./OrderedLazyIterable');
import IList = require('./IList');
import IMap = require('./IMap');

declare class Vector<T> extends OrderedLazyIterable<T, Vector<T>>
  implements IList<T>, IMap<number, T> {

  /**
   *
   */
  (...values: T[]): Vector<T>;

  static empty(): Vector<any>;
  static fromArray<T>(values: T[]): Vector<T>;
  public toString(): void;
  public length: number;
  public has(index: number): boolean;
  public get(index: number, undefinedValue?: T): T;
  public getIn(indexPath: any[], pathOffset?: number): any;
  public first(): T;
  public last(): T;
  public equals(other: Vector<T>): boolean;
  public empty(): Vector<T>;
  public set(index: number, value: T): Vector<T>;
  public setIn(keyPath: any[], v: any, pathOffset?: number): Vector<T>;
  public push(...values: T[]): Vector<T>;
  public pop(): Vector<T>;
  public delete(index: number): Vector<T>;
  public deleteIn(keyPath: any[], pathOffset?: number): Vector<T>;
  public unshift(...values: T[]): Vector<T>;
  public shift(): Vector<T>;
  public merge(seq: LazyIterable<number, T, any>): Vector<T>;
  public concat(...vectors: Vector<T>[]): Vector<T>;
  public slice(begin: number, end?: number): Vector<T>;
  public splice(index: number, removeNum: number, ...values: T[]): Vector<T>;
  public isTransient(): boolean;
  public asTransient(): Vector<T>;
  public asPersistent(): Vector<T>;
  public clone(): Vector<T>;
  public __iterator__(): {next(): /*(number, T)*/Array<any>}
}

export = Vector;
