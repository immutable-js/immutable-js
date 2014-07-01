/// <reference path="../src/node.d.ts" />
import LazyIterable = require('./LazyIterable');
import Vector = require('./Vector');
declare class OrderedLazyIterable<V, C> extends LazyIterable<number, V, C> {
    /**
    * Note: the default implementation of this needs to make an intermediate
    * representation which may be inefficent. Concrete data structures should
    * do better if possible.
    */
    public reverseIterate(fn: (value?: V, index?: number, collection?: C) => any, thisArg?: any): boolean;
    public toArray(): V[];
    public toVector(): Vector<V>;
    public reverse(): OrderedLazyIterable<V, C>;
    public keys(): OrderedLazyIterable<number, C>;
    public map<V2>(fn: (value?: V, index?: number, collection?: C) => V2, thisArg?: any): OrderedLazyIterable<V2, C>;
    public filter(fn: (value?: V, index?: number, collection?: C) => boolean, thisArg?: any): OrderedLazyIterable<V, C>;
    public indexOf(searchValue: V): number;
    public findIndex(fn: (value?: V, index?: number, collection?: C) => boolean, thisArg?: any): number;
    public take(amount: number): OrderedLazyIterable<V, C>;
    public skip(amount: number): OrderedLazyIterable<V, C>;
    public takeWhile(fn: (value?: V, index?: number, collection?: C) => boolean, thisArg?: any): OrderedLazyIterable<V, C>;
    public skipWhile(fn: (value?: V, index?: number, collection?: C) => boolean, thisArg?: any): OrderedLazyIterable<V, C>;
}
export = OrderedLazyIterable;
