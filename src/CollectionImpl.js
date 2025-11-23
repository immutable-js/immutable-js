import {
  Collection,
  CollectionPrototype,
  IndexedCollectionPrototype,
  KeyedCollectionPrototype,
  SetCollectionPrototype,
} from './Collection';
import {
  IndexedSeqImpl,
  KeyedSeqImpl,
  SetSeqImpl,
} from './Seq';
import mixin from './utils/mixin';

export { Collection, CollectionPrototype, IndexedCollectionPrototype };

// Mixin subclasses - apply Collection prototypes to Seq implementations
mixin(KeyedSeqImpl, KeyedCollectionPrototype);
mixin(IndexedSeqImpl, IndexedCollectionPrototype);
mixin(SetSeqImpl, SetCollectionPrototype);
