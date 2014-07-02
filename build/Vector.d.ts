/// <reference path="../src/node.d.ts" />
import LazyIterable = require('./LazyIterable');
import OrderedLazyIterable = require('./OrderedLazyIterable');
import IList = require('./IList');
import IMap = require('./IMap');
declare class Vector<T> extends OrderedLazyIterable<T, Vector<T>> implements IList<T>, IMap<number, T> {
    constructor(...values: T[]);
    static empty(): Vector<any>;
    static fromArray<T>(values: T[]): Vector<T>;
    public toString(): void;
    public length: number;
    public has(index: number): boolean;
    public get(index: number, undefinedValue?: T): T;
    public getIn(indexPath: any[], pathOffset?: number): any;
    public first(): T;
    public last(): T;
    public equals(other: Vector<T>): boolean;
    public empty(): Vector<T>;
    public set(index: number, value: T): Vector<T>;
    public setIn(keyPath: any[], v: any, pathOffset?: number): Vector<T>;
    public push(...values: T[]): Vector<T>;
    public pop(): Vector<T>;
    public delete(index: number): Vector<T>;
    public deleteIn(keyPath: any[], pathOffset?: number): Vector<T>;
    public unshift(...values: T[]): Vector<T>;
    public shift(): Vector<T>;
    public merge(seq: LazyIterable<number, T, any>): Vector<T>;
    public concat(...vectors: Vector<T>[]): Vector<T>;
    public slice(begin: number, end?: number): Vector<T>;
    public splice(index: number, removeNum: number, ...values: T[]): Vector<T>;
    public isTransient(): boolean;
    public asTransient(): Vector<T>;
    public asPersistent(): Vector<T>;
    public clone(): Vector<T>;
    static Iterator: typeof VectorIterator;
    public iterate(fn: (value?: T, index?: number, vector?: Vector<T>) => any, thisArg?: any): boolean;
    public reverseIterate(fn: (value?: T, index?: number, vector?: Vector<T>) => any, thisArg?: any, maintainIndices?: boolean): boolean;
    public toArray(): T[];
    public _origin: number;
    public _size: number;
    public _level: number;
    private _root;
    private _tail;
    private _ownerID;
    public getRoot(): {
        array: any[];
    };
    public getTail(): {
        array: any[];
    };
    private static _make<T>(origin, size, level, root, tail, ownerID?);
    private _nodeFor(rawIndex);
}
export = Vector;
