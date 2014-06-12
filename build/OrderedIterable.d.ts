import Iterable = require('./Iterable');
import Vector = require('./Vector');
declare class OrderedIterable<V, C> extends Iterable<number, V, C> {
    public toArray(): V[];
    public toVector(): Vector<V>;
    public keys(): OrderedIterable<number, C>;
    public map<V2>(fn: (value?: V, index?: number, collection?: C) => V2, thisArg?: any): OrderedIterable<V2, C>;
    public filter(fn: (value?: V, index?: number, collection?: C) => boolean, thisArg?: any): OrderedIterable<V, C>;
    public indexOf(searchValue: V): number;
    public findIndex(fn: (value?: V, index?: number, collection?: C) => boolean, thisArg?: any): number;
    public take(amount: number): OrderedIterable<V, C>;
    public skip(amount: number): OrderedIterable<V, C>;
    public takeWhile(fn: (value?: V, index?: number, collection?: C) => boolean, thisArg?: any): OrderedIterable<V, C>;
    public skipWhile(fn: (value?: V, index?: number, collection?: C) => boolean, thisArg?: any): OrderedIterable<V, C>;
}
export = OrderedIterable;
