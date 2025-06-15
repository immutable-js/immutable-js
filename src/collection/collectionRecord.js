import { SeqKeyedFromValue } from '../Seq';
import {
  ITERATOR_SYMBOL,
  IS_COLLECTION_SYMBOL,
  IS_RECORD_SYMBOL,
  DELETE,
} from '../const';
import { isImmutable } from '../predicates/isImmutable';
import { isRecord } from '../predicates/isRecord';
import transformToMethods from '../transformToMethods';

import { quoteString } from '../utils';

import {
  collectionPropertiesCreate,
  collectionOrAnyOpGetIn,
  collectionOrAnyOpHasIn,
} from './collection';

const collectionRecordAssertValidDefaultValues = (defaultValues) => {
  if (isRecord(defaultValues)) {
    throw new Error(
      'Can not call `Record` with an immutable Record as default values. Use a plain javascript object instead.'
    );
  }

  if (isImmutable(defaultValues)) {
    throw new Error(
      'Can not call `Record` with an immutable Collection as default values. Use a plain javascript object instead.'
    );
  }

  if (defaultValues === null || typeof defaultValues !== 'object') {
    throw new Error(
      'Can not call `Record` with a non-object as default values. Use a plain javascript object instead.'
    );
  }
};

const recordOpCreateLike = (likeRecord, values, ownerID) => {
  const record = Object.create(Object.getPrototypeOf(likeRecord));
  record._values = values;
  record.__ownerID = ownerID;
  return record;
};

const recordOpGetName = (record) => {
  return record.constructor.displayName || record.constructor.name || 'Record';
};

const recordOpEnsureOwner = (cx, ownerID) => {
  if (ownerID === cx.__ownerID) {
    return cx;
  }
  const newValues = cx._values.__ensureOwner(ownerID);
  if (!ownerID) {
    cx.__ownerID = ownerID;
    cx._values = newValues;
    return cx;
  }
  return recordOpCreateLike(cx, newValues, ownerID);
};

const recordOpIterator = (cx, type, reverse) => {
  return recordOpToSeq(cx).__iterator(type, reverse);
};

const recordOpIterate = (cx, fn, reverse) => {
  return recordOpToSeq(cx).__iterate(fn, reverse);
};

const recordOpHas = (cx, k) => {
  return cx._indices.hasOwnProperty(k);
};

const recordOpSet = (cx, k, v) => {
  if (cx.has(k)) {
    const newValues = cx._values.set(
      cx._indices[k],
      v === cx._defaultValues[k] ? undefined : v
    );
    if (newValues !== cx._values && !cx.__ownerID) {
      return recordOpCreateLike(cx, newValues);
    }
  }
  return cx;
};

const recordOpRemove = (cx, k) => {
  return cx.set(k);
};

const recordOpClear = (cx) => {
  const newValues = cx._values.clear().setSize(cx._keys.length);

  return cx.__ownerID ? cx : recordOpCreateLike(cx, newValues);
};

const recordOpWasAltered = (cx) => {
  return cx._values.wasAltered();
};

const recordOpGet = (cx, k, notSetValue) => {
  if (!cx.has(k)) {
    return notSetValue;
  }
  const index = cx._indices[k];
  const value = cx._values.get(index);

  return value === undefined ? cx._defaultValues[k] : value;
};

const recordOpToString = (cx) => {
  let str = recordOpGetName(cx) + ' { ';
  const keys = cx._keys;
  let k;
  for (let i = 0, l = keys.length; i !== l; i++) {
    k = keys[i];
    str += (i ? ', ' : '') + k + ': ' + quoteString(cx.get(k));
  }
  return str + ' }';
};

const recordOpEquals = (cx, other) => {
  return (
    cx === other ||
    (isRecord(other) && recordOpToSeq(cx).equals(recordOpToSeq(other)))
  );
};

const recordOpHashCode = (cx) => {
  return recordOpToSeq(cx).hashCode();
};

const recordOpToSeq = (record) => {
  return SeqKeyedFromValue(record._keys.map((k) => [k, record.get(k)]));
};

const collectionRecordPropertiesCreate = ((cache) => () => {
  cache =
    cache ||
    (cache = Object.assign(
      {},
      collectionPropertiesCreate(),
      transformToMethods({
        [IS_COLLECTION_SYMBOL]: false,
        [IS_RECORD_SYMBOL]: true,
        toString: recordOpToString,
        inspect: recordOpToString,
        toSource: recordOpToString,
        equals: recordOpEquals,
        hashCode: recordOpHashCode,
        has: recordOpHas,
        get: recordOpGet,
        set: recordOpSet,
        remove: recordOpRemove,
        [DELETE]: recordOpRemove,
        clear: recordOpClear,
        wasAltered: recordOpWasAltered,
        toSeq: recordOpToSeq,
        getIn: collectionOrAnyOpGetIn,
        hasIn: collectionOrAnyOpHasIn,
        __iterator: recordOpIterator,
        __iterate: recordOpIterate,
        __ensureOwner: recordOpEnsureOwner,
      })
    ));

  cache[ITERATOR_SYMBOL] = cache.entries;

  return cache;
})();

export {
  collectionRecordAssertValidDefaultValues,
  collectionRecordPropertiesCreate,
};
