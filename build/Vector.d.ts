import OrderedIterable = require('./OrderedIterable');
export interface VectorFactory<T> {
    (...values: T[]): Vector<T>;
    empty(): Vector<T>;
    fromArray(values: T[]): Vector<T>;
}
export interface Vector<T> extends OrderedIterable<T, Vector<T>> {
    length: number;
    has(index: number): boolean;
    get(index: number): T;
    first(): T;
    last(): T;
    set(index: number, value: T): Vector<T>;
    push(...values: T[]): Vector<T>;
    pop(): Vector<T>;
    delete(index: number): Vector<T>;
    unshift(...values: T[]): Vector<T>;
    shift(): Vector<T>;
    reverse(): Vector<T>;
    concat(vec: Vector<T>): Vector<T>;
    slice(begin: number, end?: number): Vector<T>;
    splice(index: number, removeNum: number, ...values: T[]): Vector<T>;
}
export declare class PVector<T> extends OrderedIterable<T, PVector<T>> implements Vector<T> {
    constructor(...values: T[]);
    static empty(): PVector<any>;
    static fromArray<T>(values: T[]): PVector<T>;
    public length: number;
    public has(index: number): boolean;
    public get(index: number): T;
    public first(): T;
    public last(): T;
    public empty(): PVector<T>;
    public set(index: number, value: T): PVector<T>;
    public push(...values: T[]): PVector<T>;
    public pop(): PVector<T>;
    public delete(index: number): PVector<T>;
    public unshift(...values: T[]): PVector<T>;
    public shift(): PVector<T>;
    public reverse(): PVector<T>;
    public concat(...vectors: PVector<T>[]): PVector<T>;
    public slice(begin: number, end?: number): PVector<T>;
    public splice(index: number, removeNum: number, ...values: T[]): PVector<T>;
    public isTransient(): boolean;
    public asTransient(): PVector<T>;
    public asPersistent(): PVector<T>;
    public clone(): PVector<T>;
    public iterate(fn: (value: T, index: number, vector: PVector<T>) => any, thisArg?: any): boolean;
    public toArray(): T[];
    private _origin;
    private _size;
    private _level;
    private _root;
    private _tail;
    private _ownerID;
    private static _make<T>(origin, size, level, root, tail, ownerID?);
    private _nodeFor(rawIndex);
}
