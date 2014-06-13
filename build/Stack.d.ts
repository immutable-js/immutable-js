import OrderedIterable = require('./OrderedIterable');
import IList = require('./IList');
/**
* A Stack allows us to push and pop to the first position in the list as well as walk this list.
*/
declare class Stack<T> extends OrderedIterable<T, Stack<T>> implements IList<T> {
    constructor(...values: T[]);
    static empty(): Stack<any>;
    static fromArray<T>(values: T[]): Stack<T>;
    public length: number;
    public get(index: number): T;
    public first(): T;
    public last(): T;
    public push(value: T): Stack<T>;
    public pop(): Stack<T>;
    public iterate(fn: (value?: T, index?: number, queue?: Stack<T>) => any, thisArg?: any): boolean;
    private _value;
    private _next;
    private static _make<T>(value, next);
}
export = Stack;
