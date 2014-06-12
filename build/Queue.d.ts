import OrderedIterable = require('./OrderedIterable');
/**
* A Queue allows us to push and pop to the first position in the list as well as walk this list.
*/
export declare class Queue<T> extends OrderedIterable<T, Queue<T>> {
    constructor(...values: T[]);
    static empty(): Queue<any>;
    static fromArray<T>(values: T[]): Queue<T>;
    public length: number;
    public get(index: number): T;
    public first(): T;
    public push(value: T): Queue<T>;
    public pop(): Queue<T>;
    public iterate(fn: (value: T, index: number, queue: Queue<T>) => any, thisArg?: any): boolean;
    private _value;
    private _next;
    private static _make<T>(value, next);
}
