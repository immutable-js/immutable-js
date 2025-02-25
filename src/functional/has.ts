import { isImmutable } from '../predicates/isImmutable';
import hasOwnProperty from '../utils/hasOwnProperty';
import isDataStructure from '../utils/isDataStructure';

export function has(collection: object, key: PropertyKey): boolean {
  return isImmutable(collection)
    ? // @ts-expect-error key might be a number or symbol, which is not handled be Record key type
      collection.has(key)
    : isDataStructure(collection) && hasOwnProperty.call(collection, key);
}
