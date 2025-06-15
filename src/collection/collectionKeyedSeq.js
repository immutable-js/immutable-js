import { IS_SEQ_SYMBOL, IS_KEYED_SYMBOL } from '../const';
import transformToMethods from '../transformToMethods';


import { collectionKeyedPropertiesCreate } from './collectionKeyed';

import {
  collectionSeqOpCacheResult,
  collectionSeqOpIterateUncached,
  collectionSeqOpIteratorUncached,
  collectionSeqOpIterate,
  collectionSeqOpIterator,
} from './collectionSeq';

const collectionKeyedSeqPropertiesCreate = ((cache) => () => {
  return (
    cache ||
    (cache = Object.assign(
      {},
      collectionKeyedPropertiesCreate(),
      transformToMethods({
        [IS_SEQ_SYMBOL]: true,
        [IS_KEYED_SYMBOL]: true,
        toSeq: (cx) => cx,
        cacheResult: collectionSeqOpCacheResult,
        __iterateUncached: collectionSeqOpIterateUncached,
        __iteratorUncached: collectionSeqOpIteratorUncached,
        __iterate: collectionSeqOpIterate,
        __iterator: collectionSeqOpIterator,
      })
    ))
  );
})();

const collectionKeyedSeqCreate = () => {
  const setseqidx = Object.create(collectionKeyedSeqPropertiesCreate());
  setseqidx._shape = 'keyedseq';
  return setseqidx;
};

export { collectionKeyedSeqCreate, collectionKeyedSeqPropertiesCreate };
