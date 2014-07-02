import Vector = require('./Vector');
import Map = require('./Map');
import Set = require('./Set');

declare class LazyIterable<K, V, C> {

  /**
   *
   */
  public toArray(): V[];
  public toObject(): Object;
  public toVector(): Vector<V>;
  public toMap(): Map<K, V>;
  public toSet(): Set<V>;
  public keys(): LazyIterable<number, K, C>;
  public values(): LazyIterable<number, V, C>;
  public entries(): LazyIterable<number, any[], C>; // LazyIterable<number, <K,V>, C>
  public forEach(fn: (value?: V, key?: K, collection?: C) => any, thisArg?: any): void;
  public find(fn: (value?: V, key?: K, collection?: C) => boolean, thisArg?: any): V;
  public findKey(fn: (value?: V, key?: K, collection?: C) => boolean, thisArg?: any): K;
  public reduce<R>(fn: (prevReduction?: R, value?: V, key?: K, collection?: C) => R, initialReduction?: R, thisArg?: any): R;
  public flip(): LazyIterable<V, K, C>;
  public map<V2>(fn: (value?: V, key?: K, collection?: C) => V2, thisArg?: any): LazyIterable<K, V2, C>;
  public filter(fn: (value?: V, key?: K, collection?: C) => boolean, thisArg?: any): LazyIterable<K, V, C>;
  public every(fn: (value?: V, key?: K, collection?: C) => boolean, thisArg?: any): boolean;
  public some(fn: (value?: V, key?: K, collection?: C) => boolean, thisArg?: any): boolean;
}

export = LazyIterable;
