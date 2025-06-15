import { Iterator, iteratorValue, iteratorDone } from './Iterator';

import { collectionKeyedSeqPropertiesCreate } from './collection/collectionKeyedSeq.js';

import { IS_ORDERED_SYMBOL } from './const';
import { probeIsImmutable } from './probe';
import transformToMethods from './transformToMethods';
import { hasOwnProperty } from './utils';

const seqObjectOpHas = (cx, key) => {
  return hasOwnProperty.call(cx._object, key);
};

const seqObjectOpGet = (cx, key, notSetValue) => {
  if (notSetValue !== undefined && !seqObjectOpHas(key)) {
    return notSetValue;
  }

  return cx._object[key];
};

const seqObjectOpIterate = (cx, fn, reverse) => {
  const object = cx._object;
  const keys = cx._keys;
  const size = keys.length;
  let i = 0;
  while (i !== size) {
    const key = keys[reverse ? size - ++i : i++];
    if (fn(object[key], key, cx) === false) {
      break;
    }
  }
  return i;
};

const seqObjectOpIterator = (cx, type, reverse) => {
  const object = cx._object;
  const keys = cx._keys;
  const size = keys.length;
  let i = 0;
  return new Iterator(() => {
    if (i === size) {
      return iteratorDone();
    }
    const key = keys[reverse ? size - ++i : i++];
    return iteratorValue(type, key, object[key]);
  });
};

const seqObjectPropertiesCreate = ((cache) => () => {
  return (
    cache ||
    (cache = Object.assign(
      {},
      collectionKeyedSeqPropertiesCreate(),
      transformToMethods({
        [IS_ORDERED_SYMBOL]: true,
        toKeyedSeq: (cx) => cx,
        get: seqObjectOpGet,
        has: seqObjectOpHas,
        __iterate: seqObjectOpIterate,
        __iterator: seqObjectOpIterator,
      })
    ))
  );
})();

const seqObjectCreate = (object) => {
  const seqObject = Object.create(seqObjectPropertiesCreate());
  const keys = Object.keys(object).concat(
    Object.getOwnPropertySymbols ? Object.getOwnPropertySymbols(object) : []
  );
  seqObject._shape = 'seqobject';
  seqObject._object = object;
  seqObject._keys = keys;
  seqObject.size = keys.length;

  return seqObject;
};

const seqObjectCreateEmpty = ((cache) => () => {
  return cache || (cache = seqObjectCreate({}));
})();

const SeqObject = (value) =>
  value === undefined || value === null
    ? seqObjectCreateEmpty({})
    : probeIsImmutable(value)
      ? value.toSeq()
      : seqObjectCreate(value);

export {
  SeqObject as default,
  seqObjectPropertiesCreate,
  seqObjectCreate,
  SeqObject,
};
