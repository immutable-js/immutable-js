import OrderedIterable = require('./OrderedIterable');
/**
*
* A Queue allows us to push and pop to the first position in the list as well as walk this list.
*
*   class Queue {
*     static new(...values: T[]): PList;
*     static empty(): PList;
*     static fromArray(values: T[]): PList;
*     toArray(): T[];
*     push(value: T): PList;
*     peek(): T;
*     pop(): PList;
*     length: number;
*   }
*
*/
export interface Queue<T> extends OrderedIterable<T, Queue<T>> {
    length: number;
    first(): T;
    push(value: T): Queue<T>;
    pop(): Queue<T>;
}
export declare class PQueue<T> extends OrderedIterable<T, PQueue<T>> implements Queue<T> {
    constructor(...values: T[]);
    static empty(): PQueue<any>;
    static fromArray<T>(values: T[]): PQueue<T>;
    public length: number;
    public first(): T;
    public push(value: T): PQueue<T>;
    public pop(): PQueue<T>;
    public iterate(fn: (value: T, index: number, queue: Queue<T>) => any, thisArg?: any): boolean;
    private _value;
    private _next;
    private static _make<T>(value, next);
}
