import LazyIterable = require('./LazyIterable');
interface IMap<K, V> extends LazyIterable<K, V, IMap<K, V>> {
    length: number;
    has(k: K): boolean;
    get(k: K): V;
    getIn(keyPath: any[]): any;
    empty(): IMap<K, V>;
    set(k: K, v: V): IMap<K, V>;
    setIn(keyPath: any[], v: any, pathOffset?: number): IMap<K, V>;
    delete(k: K): IMap<K, V>;
    deleteIn(keyPath: any[], pathOffset?: number): IMap<K, V>;
    merge(seq: LazyIterable<K, V, any>): IMap<K, V>;
    isTransient(): boolean;
    asTransient(): IMap<K, V>;
    asPersistent(): IMap<K, V>;
    clone(): IMap<K, V>;
}
export = IMap;
