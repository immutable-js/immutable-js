import {
  IS_KEYED_SYMBOL,
} from '../const';
import transformToMethods from '../transformToMethods';


import { collectionPropertiesCreate } from './collection';

const collectionSetSeqKeyedOpToString = (cx) => {
  return cx.__toString('Seq {', '}');
};

const collectionKeyedPropertiesCreate = ((cache) => () => {
  return (
    cache ||
    (cache = Object.assign(
      {},
      collectionPropertiesCreate(),
      transformToMethods({
        [IS_KEYED_SYMBOL]: true,
        toString: collectionSetSeqKeyedOpToString,
        valueSeq: (cx) => {
          return cx.toIndexedSeq();
        }
      })
    ))
  );
})();

const collectionKeyedCreate = () => {
  const setseqkeyed = Object.create(collectionKeyedPropertiesCreate());

  return setseqkeyed;
};

export { collectionKeyedPropertiesCreate, collectionKeyedCreate };
