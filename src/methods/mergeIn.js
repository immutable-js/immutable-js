import { emptyMap } from '../Map';
import { mergeWithSources } from '../functional/merge';
import { updateIn } from '../functional/updateIn';

export function mergeIn(keyPath, ...iters) {
  return updateIn(this, keyPath, emptyMap(), (m) => mergeWithSources(m, iters));
}
