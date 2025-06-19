import type { CollectionImpl } from './Collection';
import type { RecordImpl } from './Record';
import { Seq } from './Seq';
import { isCollection } from './predicates/isCollection';
import { isKeyed } from './predicates/isKeyed';
import isDataStructure from './utils/isDataStructure';

export function toJS(
  value: CollectionImpl<unknown, unknown> | RecordImpl
): Array<unknown> | { [key: string]: unknown };
export function toJS(value: unknown): unknown;
export function toJS(
  value: unknown
): Array<unknown> | { [key: string]: unknown } | unknown {
  if (!value || typeof value !== 'object') {
    return value;
  }
  if (!isCollection(value)) {
    if (!isDataStructure(value)) {
      return value;
    }
    value = Seq(value);
  }
  if (isKeyed(value)) {
    const result: { [key: string]: unknown } = {};
    // @ts-expect-error `__iterate` exists on all Keyed collections but method is not defined in the type
    value.__iterate((v, k) => {
      result[k] = toJS(v);
    });
    return result;
  }
  const result: Array<unknown> = [];
  // @ts-expect-error value "should" be a non-keyed collection, but we may need to assert for stricter types
  value.__iterate((v: unknown) => {
    result.push(toJS(v));
  });
  return result;
}
