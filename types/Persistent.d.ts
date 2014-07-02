export import ArrayIterator = require('./ArrayIterator');
export import ObjectIterator = require('./ObjectIterator');
export import Map = require('./Map');
export import Vector = require('./Vector');
export import Set = require('./Set');
/**
* The same semantics as Object.is(), but treats persistent data structures as
* data, equal when the structure contains equivalent data.
*/
export declare function is(first: any, second: any): boolean;
export declare function isPersistent(value: any): boolean;
export declare function isLazy(value: any): boolean;
export declare function lazy(value: any): any;
export declare function fromJS(json: any): any;
export declare function toJS(value: any): any;
