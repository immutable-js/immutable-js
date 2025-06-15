import { IS_ORDERED_SYMBOL } from '../const';
import transformToMethods from '../transformToMethods';

import { collectionKeyedSeqPropertiesCreate } from './collectionKeyedSeq';

const collectionCastKeyedSequenceOpToKeyedSeq = (cx) => {
  return cx;
};

const collectionCastKeyedSequenceOpGet = (cx, key, notSetValue) => {
  return cx._iter.get(key, notSetValue);
};

const collectionCastKeyedSequenceOpHas = (cx, key) => {
  return cx._iter.has(key);
};

const collectionCastKeyedSequenceOpValueSeq = (cx) => {
  return cx._iter.valueSeq();
};

const collectionCastKeyedSequenceOpIterate = (cx, fn, reverse) => {
  return cx._iter.__iterate((v, k) => fn(v, k, cx), reverse);
};

const collectionCastKeyedSequenceOpIterator = (cx, type, reverse) => {
  return cx._iter.__iterator(type, reverse);
};

const collectionCastKeyedSeqPropertiesCreate = ((cache) => () => {
  return (
    cache ||
    (cache = Object.assign(
      {},
      collectionKeyedSeqPropertiesCreate(),
      transformToMethods({
        [IS_ORDERED_SYMBOL]: true,
        toKeyedSeq: collectionCastKeyedSequenceOpToKeyedSeq,
        get: collectionCastKeyedSequenceOpGet,
        has: collectionCastKeyedSequenceOpHas,
        valueSeq: collectionCastKeyedSequenceOpValueSeq,
        __iterate: collectionCastKeyedSequenceOpIterate,
        __iterator: collectionCastKeyedSequenceOpIterator,
      })
    ))
  );
})();

const collectionCastKeyedSeqCreate = (iter, useKeys) => {
  const ksqh = Object.create(collectionCastKeyedSeqPropertiesCreate());

  ksqh._iter = iter;
  ksqh._useKeys = useKeys;
  ksqh.size = iter.size;

  return ksqh;
};

export { collectionCastKeyedSeqPropertiesCreate, collectionCastKeyedSeqCreate };
