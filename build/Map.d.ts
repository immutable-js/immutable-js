import Iterable = require('./Iterable');
export declare class Map<K, V> extends Iterable<K, V, Map<K, V>> {
    constructor(obj: {
        [key: string]: V;
    });
    static fromObj<V>(obj: {
        [key: string]: V;
    }): Map<string, V>;
    static empty(): Map<any, any>;
    public length: number;
    public has(k: K): boolean;
    public get(k: K): V;
    public set(k: K, v: V): Map<K, V>;
    public delete(k: K): Map<K, V>;
    public merge(map: Map<K, V>): Map<K, V>;
    public isTransient(): boolean;
    public asTransient(): Map<K, V>;
    public asPersistent(): Map<K, V>;
    public iterate(fn: (value: V, key: K, collection: Map<K, V>) => any, thisArg?: any): boolean;
    private _root;
    private _editRef;
    private static _make<K, V>(length, root?, editRef?);
}
