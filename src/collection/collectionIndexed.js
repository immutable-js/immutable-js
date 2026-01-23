import { IS_ORDERED_SYMBOL, IS_INDEXED_SYMBOL } from '../const';
import transformToMethods from '../transformToMethods';

import {
  collectionOpIndexedFindIndex,
  collectionOpIndexedIndexOf,
  collectionOpIndexedLastIndexOf,
  collectionOpIndexedFindLastIndex,
  collectionOpIndexedFirst,
  collectionOpIndexedGet,
  collectionOpIndexedHas,
  collectionOpIndexedLast,
  collectionPropertiesCreate,
} from './collection';

const collectionIndexedPropertiesCreate = ((cache) => () => {
  return (
    cache ||
    (cache = Object.assign(
      {},
      collectionPropertiesCreate(),
      transformToMethods({
        [IS_INDEXED_SYMBOL]: true,
        [IS_ORDERED_SYMBOL]: true,
        findIndex: collectionOpIndexedFindIndex,
        indexOf: collectionOpIndexedIndexOf,
        lastIndexOf: collectionOpIndexedLastIndexOf,
        findLastIndex: collectionOpIndexedFindLastIndex,
        first: collectionOpIndexedFirst,
        get: collectionOpIndexedGet,
        has: collectionOpIndexedHas,
        last: collectionOpIndexedLast,
      })
    ))
  );
})();

const collectionIndexedCreate = () => {
  const cxindexed = Object.create(collectionIndexedPropertiesCreate());
  return cxindexed;
};

export { collectionIndexedPropertiesCreate, collectionIndexedCreate };
