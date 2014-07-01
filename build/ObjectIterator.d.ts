import LazyIterable = require('./LazyIterable');
declare class ObjectIterator<T> extends LazyIterable<string, T, ObjectIterator<T>> {
    public _object: {
        [key: string]: T;
    };
    constructor(_object: {
        [key: string]: T;
    });
    public iterate(fn: (value?: T, key?: string, collection?: ObjectIterator<T>) => any, thisArg?: any): boolean;
}
export = ObjectIterator;
