import { mergeWithSources } from '../functional/merge';
import { updateIn } from '../functional/updateIn';
import { emptyMap } from '../Map';

export function mergeIn(keyPath, ...iters) {
  return updateIn(this, keyPath, emptyMap(), m => mergeWithSources(m, iters));
}
