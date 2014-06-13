import Iterable = require('./Iterable');

interface IMap<K, V> extends Iterable<K, V, IMap<K, V>> {

  // @pragma Access

  length: number;
  has(k: K): boolean;
  get(k: K): V;

  // @pragma Modification

  empty(): IMap<K, V>;
  set(k: K, v: V): IMap<K, V>;
  delete(k: K): IMap<K, V>;

  // @pragma Composition

  merge(seq: Iterable<K, V, any>): IMap<K, V>;

  // @pragma Mutability

  isTransient(): boolean;
  asTransient(): IMap<K, V>;
  asPersistent(): IMap<K, V>;
  clone(): IMap<K, V>;

}

export = IMap;
