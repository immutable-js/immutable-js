import { collectionIndexedSeqPropertiesCreate } from './collectionIndexedSeq';

const collectionIndexedSeqFromCollectionCreate = (cx) => {
  const idxseqfromcollection = Object.create(
    collectionIndexedSeqPropertiesCreate()
  );

  idxseqfromcollection._collection = cx;
  idxseqfromcollection.size = cx.length || cx.size;

  return idxseqfromcollection;
};

export { collectionIndexedSeqFromCollectionCreate };
