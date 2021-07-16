import { mergeDeepWithSources } from '../functional/merge';
import { updateIn } from '../functional/updateIn';
import { emptyMap } from '../Map';

export function mergeDeepIn(keyPath, ...iters) {
  return updateIn(this, keyPath, emptyMap(), m =>
    mergeDeepWithSources(m, iters)
  );
}
