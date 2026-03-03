import assertNotInfinite from '../utils/assertNotInfinite';
import { isProtoKey } from '../utils/protoInjection';

export function toObject() {
  assertNotInfinite(this.size);
  const object = {};
  this.__iterate((v, k) => {
    if (isProtoKey(k)) {
      return;
    }

    object[k] = v;
  });
  return object;
}
