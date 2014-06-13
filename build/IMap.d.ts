import Iterable = require('./Iterable');
interface IMap<K, V> extends Iterable<K, V, IMap<K, V>> {
    length: number;
    has(k: K): boolean;
    get(k: K): V;
    empty(): IMap<K, V>;
    set(k: K, v: V): IMap<K, V>;
    delete(k: K): IMap<K, V>;
    merge(seq: Iterable<K, V, any>): IMap<K, V>;
    isTransient(): boolean;
    asTransient(): IMap<K, V>;
    asPersistent(): IMap<K, V>;
    clone(): IMap<K, V>;
}
export = IMap;
