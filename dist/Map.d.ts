import SequenceModule = require('./Sequence');
import Sequence = SequenceModule.Sequence;

declare module Map {

  /**
   * Map.empty() creates a new immutable map of length 0.
   */
  function empty(): Map<any, any>;

  /**
   * Creates a new immutable map with the same
   * key value pairs as the provided object.
   *
   *   var newMap = Map.fromObject({key: "value"});
   *
   */
  function fromObject<V>(object: {[key: string]: V;}): Map<string, V>;
}

/**
 * Creates a new empty map with specific key and value type.
 *
 *   var stringToNumberMap = Map<string, number>();
 *
 */
declare function Map<K, V>(): Map<K, V>;

/**
 * Alias for Map.fromObject().
 */
declare function Map<V>(object: {[key: string]: V;}): Map<string, V>;

/**
 * An immutable Map with lazy iteration.
 */
interface Map<K, V> extends Sequence<K, V, Map<K, V>> {

  /**
   * The number of key-value pairs contained by this Map.
   */
  length: number;

  /**
   * True if a key exists within this Map.
   */
  has(k: K): boolean;

  /**
   * Returns the value associated with the provided key, or undefinedValue if
   * the Map does not have this key.
   *
   * Note: it is possible to store `undefined` as a value for a key, so if
   *`undefinedValue` is not provided and this method returns `undefined`, that
   * does not guarantee the key was not set.
   */
  get(k: K, undefinedValue?: V): V;
  getIn(keyPath: any[], pathOffset?: number): any;
  clear(): Map<K, V>;
  set(k: K, v: V): Map<K, V>;
  setIn(keyPath: any[], v: any, pathOffset?: number): Map<K, V>;
  delete(k: K): Map<K, V>;
  deleteIn(keyPath: any[], pathOffset?: number): Map<K, V>;
  merge(seq: Sequence<K, V, any>): Map<K, V>;
  isTransient(): boolean;
  asTransient(): Map<K, V>;
  asPersistent(): Map<K, V>;
  clone(): Map<K, V>;
}

export = Map;
