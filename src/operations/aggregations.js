import { Map } from '../Map';
import { OrderedMap } from '../OrderedMap';
import { isKeyed } from '../predicates/isKeyed';
import { isOrdered } from '../predicates/isOrdered';
import { collectionClass, reify } from './helpers';

export function countByFactory(collection, grouper, context) {
  const groups = Map().asMutable();
  collection.__iterate((v, k) => {
    groups.update(grouper.call(context, v, k, collection), 0, (a) => a + 1);
  });
  return groups.asImmutable();
}

export function groupByFactory(collection, grouper, context) {
  const isKeyedIter = isKeyed(collection);
  const groups = (isOrdered(collection) ? OrderedMap() : Map()).asMutable();
  collection.__iterate((v, k) => {
    groups.update(
      grouper.call(context, v, k, collection),
      (a) => ((a = a || []), a.push(isKeyedIter ? [k, v] : v), a)
    );
  });
  const coerce = collectionClass(collection);
  return groups.map((arr) => reify(collection, coerce(arr))).asImmutable();
}
