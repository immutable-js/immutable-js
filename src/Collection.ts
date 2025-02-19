import { Seq, KeyedSeq, IndexedSeq, SetSeq } from './Seq';
import { isCollection } from './predicates/isCollection';
import { isKeyed } from './predicates/isKeyed';
import { isIndexed } from './predicates/isIndexed';
import { isAssociative } from './predicates/isAssociative';
import type { Collection as CollectionType } from '../type-definitions/immutable.d.ts';

export abstract class Collection<K, V> implements CollectionType<K, V> {
  static Keyed: typeof KeyedCollection;
  static Indexed: typeof IndexedCollection;
  static Set: typeof SetCollection;

  constructor<I extends Collection<unknown, unknown>>(collection: I): I;
  constructor<T>(collection: Iterable<T> | ArrayLike<T>): IndexedCollection<T>;
  constructor<V>(obj: { [key: string]: V }): KeyedCollection<string, V>;
  constructor<K = unknown, V = unknown>(): Collection<K, V>;
  constructor(value: unknown) {
    // eslint-disable-next-line no-constructor-return
    return isCollection(value) ? value : Seq(value);
  }

  abstract equals: CollectionType<K, V>['equals'];
  abstract hashCode: CollectionType<K, V>['hashCode'];
  abstract get: CollectionType<K, V>['get'];
  abstract has: CollectionType<K, V>['has'];
  abstract includes: CollectionType<K, V>['includes'];
  abstract contains: CollectionType<K, V>['contains'];
  abstract first: CollectionType<K, V>['first'];
  abstract last: CollectionType<K, V>['last'];
  abstract getIn: CollectionType<K, V>['getIn'];
  abstract hasIn: CollectionType<K, V>['hasIn'];
  abstract update: CollectionType<K, V>['update'];
  abstract toJS: CollectionType<K, V>['toJS'];
  abstract toJSON: CollectionType<K, V>['toJSON'];
  abstract toArray: CollectionType<K, V>['toArray'];
  abstract toObject: CollectionType<K, V>['toObject'];
  abstract toMap: CollectionType<K, V>['toMap'];
  abstract toOrderedMap: CollectionType<K, V>['toOrderedMap'];
  abstract toSet: CollectionType<K, V>['toSet'];
  abstract toOrderedSet: CollectionType<K, V>['toOrderedSet'];
  abstract toList: CollectionType<K, V>['toList'];
  abstract toStack: CollectionType<K, V>['toStack'];
  abstract toSeq: CollectionType<K, V>['toSeq'];
  abstract toKeyedSeq: CollectionType<K, V>['toKeyedSeq'];
  abstract toIndexedSeq: CollectionType<K, V>['toIndexedSeq'];
  abstract toSetSeq: CollectionType<K, V>['toSetSeq'];
  abstract keys: CollectionType<K, V>['keys'];
  abstract values: CollectionType<K, V>['values'];
  abstract entries: CollectionType<K, V>['entries'];

  abstract [Symbol.iterator](): IterableIterator<unknown>;

  abstract keySeq: CollectionType<K, V>['keySeq'];
  abstract valueSeq: CollectionType<K, V>['valueSeq'];
  abstract entrySeq: CollectionType<K, V>['entrySeq'];
  abstract map: CollectionType<K, V>['map'];
  abstract filter: CollectionType<K, V>['filter'];
  abstract filterNot: CollectionType<K, V>['filterNot'];
  abstract partition: CollectionType<K, V>['partition'];
  abstract reverse: CollectionType<K, V>['reverse'];
  abstract sort: CollectionType<K, V>['sort'];
  abstract sortBy: CollectionType<K, V>['sortBy'];
  abstract groupBy: CollectionType<K, V>['groupBy'];
  abstract forEach: CollectionType<K, V>['forEach'];
  abstract slice: CollectionType<K, V>['slice'];
  abstract rest: CollectionType<K, V>['rest'];
  abstract butLast: CollectionType<K, V>['butLast'];
  abstract skip: CollectionType<K, V>['skip'];
  abstract skipLast: CollectionType<K, V>['skipLast'];
  abstract skipWhile: CollectionType<K, V>['skipWhile'];
  abstract skipUntil: CollectionType<K, V>['skipUntil'];
  abstract take: CollectionType<K, V>['take'];
  abstract takeLast: CollectionType<K, V>['takeLast'];
  abstract takeWhile: CollectionType<K, V>['takeWhile'];
  abstract takeUntil: CollectionType<K, V>['takeUntil'];
  abstract concat: CollectionType<K, V>['concat'];
  abstract flatten: CollectionType<K, V>['flatten'];
  abstract flatMap: CollectionType<K, V>['flatMap'];
  abstract reduce: CollectionType<K, V>['reduce'];
  abstract reduceRight: CollectionType<K, V>['reduceRight'];
  abstract every: CollectionType<K, V>['every'];
  abstract some: CollectionType<K, V>['some'];
  abstract join: CollectionType<K, V>['join'];
  abstract isEmpty: CollectionType<K, V>['isEmpty'];
  abstract count: CollectionType<K, V>['count'];
  abstract countBy: CollectionType<K, V>['countBy'];
  abstract find: CollectionType<K, V>['find'];
  abstract findLast: CollectionType<K, V>['findLast'];
  abstract findEntry: CollectionType<K, V>['findEntry'];
  abstract findLastEntry: CollectionType<K, V>['findLastEntry'];
  abstract findKey: CollectionType<K, V>['findKey'];
  abstract findLastKey: CollectionType<K, V>['findLastKey'];
  abstract keyOf: CollectionType<K, V>['keyOf'];
  abstract lastKeyOf: CollectionType<K, V>['lastKeyOf'];
  abstract max: CollectionType<K, V>['max'];
  abstract maxBy: CollectionType<K, V>['maxBy'];
  abstract min: CollectionType<K, V>['min'];
  abstract minBy: CollectionType<K, V>['minBy'];
  abstract isSubset: CollectionType<K, V>['isSubset'];
  abstract isSuperset: CollectionType<K, V>['isSuperset'];
}

export class KeyedCollection<K, V>
  extends Collection<K, V>
  implements CollectionType.Keyed<K, V>
{
  constructor(value) {
    // eslint-disable-next-line no-constructor-return
    return isKeyed(value) ? value : KeyedSeq(value);
  }
}

export class IndexedCollection<T>
  extends Collection<number, T>
  implements CollectionType.Indexed<T>
{
  constructor(value) {
    // eslint-disable-next-line no-constructor-return
    return isIndexed(value) ? value : IndexedSeq(value);
  }
}

export class SetCollection<T>
  extends Collection<T, T>
  implements CollectionType.Set<T>
{
  constructor(value) {
    // eslint-disable-next-line no-constructor-return
    return isCollection(value) && !isAssociative(value) ? value : SetSeq(value);
  }
}

Collection.Keyed = KeyedCollection;
Collection.Indexed = IndexedCollection;
Collection.Set = SetCollection;
