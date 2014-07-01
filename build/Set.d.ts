import LazyIterable = require('./LazyIterable');
declare class Set<T> extends LazyIterable<T, T, Set<T>> {
    constructor(...values: T[]);
    static empty(): Set<any>;
    static fromArray<T>(values: T[]): Set<T>;
    public length: number;
    public has(value: T): boolean;
    public empty(): Set<T>;
    public add(value: T): Set<T>;
    public delete(value: T): Set<T>;
    public merge(seq: LazyIterable<any, T, any>): Set<T>;
    public isTransient(): boolean;
    public asTransient(): Set<T>;
    public asPersistent(): Set<T>;
    public clone(): Set<T>;
    public iterate(fn: (value?: T, key?: T, collection?: Set<T>) => any, thisArg?: any): boolean;
    private _map;
    private _ownerID;
    private static _make<T>(map, ownerID?);
}
export = Set;
