import IMap = require('./IMap');

import LazyIterable = require('./LazyIterable');
export import ArrayIterator = require('./ArrayIterator');
export import ObjectIterator = require('./ObjectIterator');
export import Map = require('./Map');
export import Vector = require('./Vector');
export import Set = require('./Set');

export function isPersistent(value: any): boolean {
  return value instanceof Map || value instanceof Vector || value instanceof Set;
}

export function isLazy(value: any): boolean {
  return value instanceof LazyIterable;
}

export function lazy(value: any): any {
  if (isLazy(value)) {
    return value;
  }
  if (Array.isArray(value)) {
    return new ArrayIterator(value);
  }
  if (typeof value === 'object') {
    return new ObjectIterator(value);
  }
  return null;
}

export function fromJS(json: any): any {
  if (Array.isArray(json)) {
    var vect = Vector.empty();
    json.forEach((v: any, k: any) => {
      vect.set(k, fromJS(v));
    });
    return vect;
  }
  if (typeof json === 'object') {
    var map = Map.empty();
    for (var k in json) {
      if (json.hasOwnProperty(k)) {
        map.set(k, fromJS(json[k]));
      }
    }
    return map;
  }
  return json;
}

export function toJS(value: any): any {
  if (value instanceof Vector) {
    var array = value.map(toJS).toArray();
    array.length = value.length;
    return array;
  }
  if (value instanceof Map) {
    return value.map(toJS).toObject();
  }
  if (value instanceof Set) {
    return value.map(toJS).toArray();
  }
  return value;
}
