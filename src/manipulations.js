import { resolveBegin } from './TrieUtils';
import { reify, zipWithFactory } from './Operations';
import arrCopy from './utils/arrCopy';
import { IndexedSeq } from './Seq';

const collectionSplice = (collection, index, removeNum, args) => {
  const numArgs = typeof index === 'undefined'
    ? 0
    : (args.length ? 3 : (typeof removeNum === 'undefined' ? 1 : 2))  
  removeNum = Math.max(removeNum || 0, 0);
  if (numArgs === 0 || (numArgs === 2 && !removeNum)) {
    return collection;
  }
  // If index is negative, it should resolve relative to the size of the
  // collection. However size may be expensive to compute if not cached, so
  // only call count() if the number is in fact negative.
  index = resolveBegin(index, index < 0 ? collection.count() : collection.size);
  const spliced = collection.slice(0, index);
  return reify(
    collection,
    numArgs === 1
    ? spliced
    : spliced.concat(args, collection.slice(index + removeNum))
  );
}

const collectionInterleave = (collection, collections) => {
  const collectionsJoined = [collection].concat(arrCopy(collections));
  const zipped = zipWithFactory(collection.toSeq(), IndexedSeq.of, collectionsJoined);
  const interleaved = zipped.flatten(true);
  if (zipped.size) {
    interleaved.size = zipped.size * collectionsJoined.length;
  }
  return reify(collection, interleaved);
}

export { collectionSplice, collectionInterleave };
