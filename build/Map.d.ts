import Iterable = require('./Iterable');
import IMap = require('./IMap');
declare class Map<K, V> extends Iterable<K, V, Map<K, V>> implements IMap<K, V> {
    constructor(obj?: {
        [key: string]: V;
    });
    static empty(): Map<any, any>;
    static fromObj<V>(obj: {
        [key: string]: V;
    }): Map<string, V>;
    public length: number;
    public has(k: K): boolean;
    public get(k: K): V;
    public empty(): Map<K, V>;
    public set(k: K, v: V): Map<K, V>;
    public delete(k: K): Map<K, V>;
    public merge(seq: Iterable<K, V, any>): Map<K, V>;
    public isTransient(): boolean;
    public asTransient(): Map<K, V>;
    public asPersistent(): Map<K, V>;
    public clone(): Map<K, V>;
    public iterate(fn: (value?: V, key?: K, collection?: Map<K, V>) => any, thisArg?: any): boolean;
    private _root;
    private _ownerID;
    private static _make<K, V>(length, root, ownerID?);
}
export = Map;
