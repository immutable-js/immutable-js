import LazyIterable = require('./LazyIterable');

interface IMap<K, V> extends LazyIterable<K, V, IMap<K, V>> {

  // @pragma Access

  length: number;
  has(k: K): boolean;
  get(k: K): V;
  getIn(keyPath: Array<any>): any;

  // @pragma Modification

  empty(): IMap<K, V>;
  set(k: K, v: V): IMap<K, V>;
  setIn(keyPath: Array<any>, v: any, pathOffset?: number): IMap<K, V>;
  delete(k: K): IMap<K, V>;
  deleteIn(keyPath: Array<any>, pathOffset?: number): IMap<K, V>;

  // @pragma Composition

  merge(seq: LazyIterable<K, V, any>): IMap<K, V>;

  // @pragma Mutability

  isTransient(): boolean;
  asTransient(): IMap<K, V>;
  asPersistent(): IMap<K, V>;
  clone(): IMap<K, V>;

}

export = IMap;
