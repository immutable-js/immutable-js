import OrderedLazyIterable = require('./OrderedLazyIterable');
declare class ArrayIterator<T> extends OrderedLazyIterable<T, ArrayIterator<T>> {
    public _array: T[];
    constructor(_array: T[]);
    public iterate(fn: (value?: T, key?: number, collection?: ArrayIterator<T>) => any, thisArg?: any): boolean;
    public reverseIterate(fn: (value?: T, key?: number, collection?: ArrayIterator<T>) => any, thisArg?: any): boolean;
}
export = ArrayIterator;
