import type { Collection } from '../../type-definitions/immutable';
import { hash } from '../Hash';
import { imul, smi } from '../Math';
import { isKeyed } from '../predicates/isKeyed';
import { isOrdered } from '../predicates/isOrdered';

export function hashCollection<K, V>(collection: Collection<K, V>): number {
  // @ts-expect-error Migrate to CollectionImpl in v6
  if (collection.size === Infinity) {
    return 0;
  }
  const ordered = isOrdered(collection);
  const keyed = isKeyed(collection);
  let h: number = ordered ? 1 : 0;

  // @ts-expect-error Migrate to CollectionImpl in v6
  collection.__iterate(
    keyed
      ? ordered
        ? (v: V, k: K): void => {
            h = (31 * h + hashMerge(hash(v), hash(k))) | 0;
          }
        : (v: V, k: K): void => {
            h = (h + hashMerge(hash(v), hash(k))) | 0;
          }
      : ordered
        ? (v: V): void => {
            h = (31 * h + hash(v)) | 0;
          }
        : (v: V): void => {
            h = (h + hash(v)) | 0;
          }
  );

  // @ts-expect-error Migrate to CollectionImpl in v6
  return murmurHashOfSize(collection.size, h);
}

function murmurHashOfSize(size: number, h: number): number {
  h = imul(h, 0xcc9e2d51);
  h = imul((h << 15) | (h >>> -15), 0x1b873593);
  h = imul((h << 13) | (h >>> -13), 5);
  h = ((h + 0xe6546b64) | 0) ^ size;
  h = imul(h ^ (h >>> 16), 0x85ebca6b);
  h = imul(h ^ (h >>> 13), 0xc2b2ae35);
  h = smi(h ^ (h >>> 16));
  return h;
}

function hashMerge(a: number, b: number): number {
  return (a ^ (b + 0x9e3779b9 + (a << 6) + (a >> 2))) | 0; // int
}
