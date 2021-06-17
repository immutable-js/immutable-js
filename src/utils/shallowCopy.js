import arrCopy from './arrCopy';
import hasOwnProperty from './hasOwnProperty';

export default function shallowCopy(from) {
  if (Array.isArray(from)) {
    return arrCopy(from);
  }
  const to = {};
  for (const key in from) {
    if (hasOwnProperty.call(from, key)) {
      to[key] = from[key];
    }
  }
  return to;
}
