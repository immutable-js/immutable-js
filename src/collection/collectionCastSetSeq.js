import {
  Iterator,
  iteratorValue,
} from '../Iterator';
import { ITERATE_VALUES } from '../const';
import transformToMethods from '../transformToMethods';



import {
  collectionSeqPropertiesCreate,
} from './collectionSeq';

const collectionCastSetSeqOpHas = (cx, key) => {
  return cx._iter.includes(key);
};

const collectionCastSetSeqOpIterate = (cx, fn, reverse) => {
  return cx._iter.__iterate((v) => fn(v, v, cx), reverse);
};

const collectionCastSetSeqOpIterator = (cx, type, reverse) => {
  const iterator = cx._iter.__iterator(ITERATE_VALUES, reverse);
  return new Iterator(() => {
    const step = iterator.next();
    return step.done ? step : iteratorValue(type, step.value, step.value, step);
  });
};

const collectionCastSetSeqCreate = ((cache) => (iter) => {
  const ssq = Object.create(
    cache ||
      (cache = Object.assign(
        {},
        collectionSeqPropertiesCreate(),
        transformToMethods({
          has: collectionCastSetSeqOpHas,
          __iterate: collectionCastSetSeqOpIterate,
          __iterator: collectionCastSetSeqOpIterator,
        })
      ))
  );

  ssq._iter = iter;
  ssq.size = iter.size;

  return ssq;
})();

export { collectionCastSetSeqCreate };
