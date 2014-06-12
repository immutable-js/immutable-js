import OrderedIterable = require('./OrderedIterable');
/**
* Returns a lazy seq of nums from start (inclusive) to end
* (exclusive), by step, where start defaults to 0, step to 1, and end to
* infinity. When step is equal to 0, returns an infinite sequence of
* start. When start is equal to end, returns empty list.
*/
export declare class Range extends OrderedIterable<number, Range> {
    public start: number;
    public end: number;
    public step: number;
    constructor(start?: number, end?: number, step?: number);
    public length: number;
    public has(index: number): boolean;
    public get(index: number): number;
    public first(): number;
    public last(): number;
    public slice(begin: number, end?: number): Range;
    public iterate(fn: (value: number, index: number, range: Range) => any, thisArg?: any): boolean;
    public indexOf(searchValue: number): number;
    public toArray(): number[];
}
