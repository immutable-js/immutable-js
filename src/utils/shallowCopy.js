import arrCopy from './arrCopy';
import hasOwnProperty from './hasOwnProperty';
import { isProtoKey } from './protoInjection';

export default function shallowCopy(from) {
  if (Array.isArray(from)) {
    return arrCopy(from);
  }
  const to = {};
  for (const key in from) {
    if (isProtoKey(key)) {
      continue;
    }

    if (hasOwnProperty.call(from, key)) {
      to[key] = from[key];
    }
  }
  return to;
}
