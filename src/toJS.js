import { Seq } from './Seq';
import { isCollection } from './predicates/isCollection';
import { isKeyed } from './predicates/isKeyed';
import isDataStructure from './utils/isDataStructure';

export function toJS(value) {
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
    const result = {};
    value.__iterate((v, k) => {
      result[k] = toJS(v);
    });
    return result;
  }
  const result = [];
  value.__iterate((v) => {
    result.push(toJS(v));
  });
  return result;
}
