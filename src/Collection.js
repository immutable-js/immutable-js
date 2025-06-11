import { IndexedSeq, KeyedSeq, Seq, SetSeq } from './Seq';
import { isAssociative } from './predicates/isAssociative';
import { isCollection } from './predicates/isCollection';
import { isIndexed } from './predicates/isIndexed';
import { isKeyed } from './predicates/isKeyed';

export const Collection = (value) => (isCollection(value) ? value : Seq(value));
export class CollectionImpl {}

export const KeyedCollection = (value) =>
  isKeyed(value) ? value : KeyedSeq(value);

export class KeyedCollectionImpl extends CollectionImpl {}

export const IndexedCollection = (value) =>
  isIndexed(value) ? value : IndexedSeq(value);

export class IndexedCollectionImpl extends CollectionImpl {}

export const SetCollection = (value) =>
  isCollection(value) && !isAssociative(value) ? value : SetSeq(value);

export class SetCollectionImpl extends CollectionImpl {}

Collection.Keyed = KeyedCollectionImpl;
Collection.Indexed = IndexedCollectionImpl;
Collection.Set = SetCollectionImpl;
