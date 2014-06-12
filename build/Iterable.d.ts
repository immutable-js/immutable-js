import Vector = require('./Vector');
import Map = require('./Map');
declare class Iterable<K, V, C> {
    public collection: C;
    constructor(collection: C);
    public iterate(fn: (value?: V, key?: K, collection?: C) => any, thisArg?: any): boolean;
    public toArray(): V[];
    public toObject(): Object;
    public toVector(): Vector<V>;
    public toMap(): Map<K, V>;
    public keys(): Iterable<K, K, C>;
    public forEach(fn: (value?: V, key?: K, collection?: C) => any, thisArg?: any): void;
    public find(fn: (value?: V, key?: K, collection?: C) => boolean, thisArg?: any): K;
    public reduce<R>(fn: (prevReduction?: R, value?: V, key?: K, collection?: C) => R, initialReduction?: R, thisArg?: any): R;
    public map<V2>(fn: (value?: V, key?: K, collection?: C) => V2, thisArg?: any): Iterable<K, V2, C>;
    public filter(fn: (value?: V, key?: K, collection?: C) => boolean, thisArg?: any): Iterable<K, V, C>;
    public every(fn: (value?: V, key?: K, collection?: C) => boolean, thisArg?: any): boolean;
    public some(fn: (value?: V, key?: K, collection?: C) => boolean, thisArg?: any): boolean;
}
export = Iterable;
