import IMap = require('./IMap');

export import ArrayIterator = require('./ArrayIterator');
export import ObjectIterator = require('./ObjectIterator');
export import Map = require('./Map');
export import Vector = require('./Vector');
export import Stack = require('./Stack');
export import Range = require('./Range');

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
  return value;
}
