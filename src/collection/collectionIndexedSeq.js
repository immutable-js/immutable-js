import { IS_SEQ_SYMBOL, IS_INDEXED_SYMBOL } from '../const';
import transformToMethods from '../transformToMethods';

import { collectionIndexedPropertiesCreate } from './collectionIndexed';

import {
  collectionSeqOpCacheResult,
  collectionSeqOpIterateUncached,
  collectionSeqOpIteratorUncached,
  collectionSeqOpIterate,
  collectionSeqOpIterator,
} from './collectionSeq';

const collectionIndexedSeqPropertiesCreate = ((cache) => () => {
  return (
    cache ||
    (cache = Object.assign(
      {},
      collectionIndexedPropertiesCreate(),
      transformToMethods({
        [IS_SEQ_SYMBOL]: true,
        [IS_INDEXED_SYMBOL]: true,
        toString: (cx) => cx.__toString('Seq [', ']'),
        toIndexedSeq: (cx) => cx,
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

const collectionIndexedSeqCreate = () => {
  const setseqidx = Object.create(collectionIndexedSeqPropertiesCreate());
  setseqidx._shape = 'indexedseq';
  return setseqidx;
};

export { collectionIndexedSeqCreate, collectionIndexedSeqPropertiesCreate };
