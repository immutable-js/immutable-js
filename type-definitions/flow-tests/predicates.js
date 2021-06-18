// @flow
import { List } from '../../';

declare var mystery: mixed;

// $ExpectError
maybe.push('3');

if (mystery instanceof List) {
  maybe.push('3');
}

// Note: Flow's support for %checks is still experimental.
// Support this in the future.
// if (List.isList(mystery)) {
//   mystery.push('3');
// }
