import { collectionConcatCreate } from '../collection/collectionConcat';
import { probeIsIndexed, probeIsCollection, probeIsKeyed } from '../probe';


const factoryConcat = (
  collection,
  SeqKeyed,
  keyedseqfromval,
  indexedseqfromval,
  values
) => {
  const isKeyedCollection = probeIsKeyed(collection);
  const iters = [collection]
    .concat(values)
    .map((v) => {
      if (!probeIsCollection(v)) {
        v = isKeyedCollection
          ? keyedseqfromval(v)
          : indexedseqfromval(Array.isArray(v) ? v : [v]);
      } else if (isKeyedCollection) {
        v = SeqKeyed(v);
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
      (isKeyedCollection && probeIsKeyed(singleton)) ||
      (probeIsIndexed(collection) && probeIsIndexed(singleton))
    ) {
      return singleton;
    }
  }

  return collectionConcatCreate(iters);
};

export { factoryConcat };
