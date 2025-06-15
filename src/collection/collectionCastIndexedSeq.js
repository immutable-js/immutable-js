import { Iterator, iteratorValue } from '../Iterator';
import { ensureSize } from '../TrieUtils';
import { ITERATE_VALUES } from '../const';

import transformToMethods from '../transformToMethods';



import { collectionIndexedSeqPropertiesCreate } from './collectionIndexedSeq.js';

const collectionCastIndexedSeqOpIncludes = (cx, value) => {
  return cx._iter.includes(value);
};

const collectionCastIndexedSeqOpIterate = (cx, fn, reverse) => {
  let i = 0;
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions -- TODO enable eslint here
  reverse && ensureSize(cx);
  return cx._iter.__iterate(
    (v) => fn(v, reverse ? cx.size - ++i : i++, cx),
    reverse
  );
};

const collectionCastIndexedSeqOpIterator = (cx, type, reverse) => {
  const iterator = cx._iter.__iterator(ITERATE_VALUES, reverse);
  let i = 0;
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions -- TODO enable eslint here
  reverse && ensureSize(cx);
  return new Iterator(() => {
    const step = iterator.next();
    return step.done
      ? step
      : iteratorValue(type, reverse ? cx.size - ++i : i++, step.value, step);
  });
};

const collectionCastIndexedSeqCreate = ((cache) => (iter) => {
  const castindexedseq = Object.create(
    cache ||
      (cache = Object.assign(
        {},
        collectionIndexedSeqPropertiesCreate(),
        transformToMethods({
          name: 'castindexedseqcreate',
          includes: collectionCastIndexedSeqOpIncludes,
          __iterate: collectionCastIndexedSeqOpIterate,
          __iterator: collectionCastIndexedSeqOpIterator,
        })
      ))
  );

  castindexedseq._shape = 'castindexedseq';
  castindexedseq._iter = iter;
  castindexedseq.size = iter.size;

  return castindexedseq;
})();

export { collectionCastIndexedSeqCreate };
