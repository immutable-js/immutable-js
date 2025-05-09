import { Seq } from './Seq';

import { probeIsKeyed, probeIsCollection, probeIsDataStructure } from './probe';

export function toJS(value) {
  if (!value || typeof value !== 'object') {
    return value;
  }
  if (!probeIsCollection(value)) {
    if (!probeIsDataStructure(value)) {
      return value;
    }
    value = Seq(value);
  }
  if (probeIsKeyed(value)) {
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
