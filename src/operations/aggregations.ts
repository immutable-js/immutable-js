import type { Map as MapType } from '../../type-definitions/immutable';
import { CollectionImpl } from '../Collection';
import { Map } from '../Map';
import { OrderedMap } from '../OrderedMap';
import { isKeyed } from '../predicates/isKeyed';
import { isOrdered } from '../predicates/isOrdered';
import { collectionClass, reify } from './helpers';

// The `Map` runtime factory is still untyped JS; the boundary annotations on
// `groups` below bring its d.ts types back in. TODO [TS-MIGRATION] import the
// types from '../Map' once it is migrated.

function countByFactory<K, V, G>(
  collection: CollectionImpl<K, V>,
  grouper: (value: V, key: K, iter: CollectionImpl<K, V>) => G,
  context?: unknown
): MapType<G, number> {
  const groups: MapType<G, number> = Map().asMutable();
  collection.__iterate((v, k) => {
    groups.update(grouper.call(context, v, k, collection), 0, (a) => a + 1);
  });
  return groups.asImmutable();
}

function groupByFactory<K, V, G>(
  collection: CollectionImpl<K, V>,
  grouper: (value: V, key: K, iter: CollectionImpl<K, V>) => G,
  context?: unknown
): MapType<G, CollectionImpl<K, V>> {
  const isKeyedIter = isKeyed(collection);
  const groups: MapType<G, Array<[K, V] | V>> = (
    isOrdered(collection) ? OrderedMap() : Map()
  ).asMutable();
  collection.__iterate((v, k) => {
    groups.update(grouper.call(context, v, k, collection), (group) => {
      const entries = group ?? [];
      entries.push(isKeyedIter ? [k, v] : v);
      return entries;
    });
  });

  // A group holds entries when the source is keyed and plain values otherwise,
  // and `collectionClass` returns the factory matching that same kind. Both
  // follow the runtime kind of `collection`, which a kind-generic signature
  // cannot express: splitting this factory per kind is the only way to type it,
  // and it does not pay for the duplication. Not lifted by the TS migration.
  const coerce = collectionClass(collection) as (
    values: Array<[K, V] | V>
  ) => CollectionImpl<K, V>;

  return groups
    .map((entries) => reify(collection, coerce(entries)))
    .asImmutable();
}

// Both aggregations build Maps, which Collection.ts cannot import without a
// load-order cycle, so the methods are installed on the prototype from here —
// same pattern as operations/sequences.ts. They overwrite the throwing
// placeholders declared on `CollectionImpl`, which carry the public types.

CollectionImpl.prototype.countBy = function <K, V, G>(
  this: CollectionImpl<K, V>,
  grouper: (value: V, key: K, iter: CollectionImpl<K, V>) => G,
  context?: unknown
): MapType<G, number> {
  return countByFactory(this, grouper, context);
};

CollectionImpl.prototype.groupBy = function <K, V, G>(
  this: CollectionImpl<K, V>,
  grouper: (value: V, key: K, iter: CollectionImpl<K, V>) => G,
  context?: unknown
): MapType<G, CollectionImpl<K, V>> {
  return groupByFactory(this, grouper, context);
};
