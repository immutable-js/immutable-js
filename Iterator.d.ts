declare class Iterator<K, V, C> {
    public collection: C;
    constructor(collection: C);
    public iterate(fn: (value: V, key: K, collection: C) => any, thisArg?: any): boolean;
    public toArray(): V[];
    public forEach(fn: (value: V, key: K, collection: C) => any, thisArg?: any): void;
    public find(fn: (value: V, key: K, collection: C) => boolean, thisArg?: any): K;
    public map<V2>(fn: (value: V, key: K, collection: C) => V2, thisArg?: any): Iterator<K, V2, C>;
    public filter(fn: (value: V, key: K, collection: C) => boolean, thisArg?: any): Iterator<K, V, C>;
}
export = Iterator;
