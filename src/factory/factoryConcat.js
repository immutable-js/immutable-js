import { collectionConcatCreate } from '../collection/collectionConcat';
import { isCollection } from '../predicates/isCollection';
import { isIndexed } from '../predicates/isIndexed';
import { isKeyed } from '../predicates/isKeyed';

const factoryConcat = (
  collection,
  KeyedSeq,
  keyedseqfromval,
  indexedseqfromval,
  values
) => {
  const isKeyedCollection = isKeyed(collection);
  const iters = [collection]
    .concat(values)
    .map((v) => {
      if (!isCollection(v)) {
        v = isKeyedCollection
          ? keyedseqfromval(v)
          : indexedseqfromval(Array.isArray(v) ? v : [v]);
      } else if (isKeyedCollection) {
        v = KeyedSeq(v);
      }

      return v;
    })
    .filter((v) => v.size !== 0);

  if (iters.length === 0) {
    return collection;
  }

  if (iters.length === 1) {
    const singleton = iters[0];
    if (
      singleton === collection ||
      (isKeyedCollection && isKeyed(singleton)) ||
      (isIndexed(collection) && isIndexed(singleton))
    ) {
      return singleton;
    }
  }

  return collectionConcatCreate(iters);
};

export { factoryConcat };
