export declare class Iterable<K, V, C> {
    public collection: C;
    constructor(collection: C);
    public iterate(fn: (value: V, key: K, collection: C) => any, thisArg?: any): boolean;
    public toArray(): V[];
    public keys(): Iterable<K, K, C>;
    public forEach(fn: (value: V, key: K, collection: C) => any, thisArg?: any): void;
    public find(fn: (value: V, key: K, collection: C) => boolean, thisArg?: any): K;
    public reduce<R>(fn: (prevReduction: R, value: V, key: K, collection: C) => R, initialReduction?: R, thisArg?: any): R;
    public map<V2>(fn: (value: V, key: K, collection: C) => V2, thisArg?: any): Iterable<K, V2, C>;
    public filter(fn: (value: V, key: K, collection: C) => boolean, thisArg?: any): Iterable<K, V, C>;
    public every(fn: (value: V, key: K, collection: C) => boolean, thisArg?: any): boolean;
    public some(fn: (value: V, key: K, collection: C) => boolean, thisArg?: any): boolean;
}
export declare class OrderedIterable<V, C> extends Iterable<number, V, C> {
    public toArray(): V[];
    public keys(): OrderedIterable<number, C>;
    public map<V2>(fn: (value: V, index: number, collection: C) => V2, thisArg?: any): OrderedIterable<V2, C>;
    public filter(fn: (value: V, index: number, collection: C) => boolean, thisArg?: any): OrderedIterable<V, C>;
    public indexOf(searchValue: V): number;
    public findIndex(fn: (value: V, index: number, collection: C) => boolean, thisArg?: any): number;
    public take(amount: number): OrderedIterable<V, C>;
    public skip(amount: number): OrderedIterable<V, C>;
    public takeWhile(fn: (value: V, index: number, collection: C) => boolean, thisArg?: any): OrderedIterable<V, C>;
    public skipWhile(fn: (value: V, index: number, collection: C) => boolean, thisArg?: any): OrderedIterable<V, C>;
}
