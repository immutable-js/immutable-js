import type { CollectionImpl } from '../Collection';
import assertNotInfinite from '../utils/assertNotInfinite';

export function toObject<K, V>(
  this: CollectionImpl<K, V>
): Record<PropertyKey, V> {
  assertNotInfinite(this.size);
  const object: Record<PropertyKey, V> = {};
  this.__iterate((v, k) => {
    // @ts-expect-error object key are converted to string if not Symbol / number
    object[k] = v;
  });
  return object;
}
