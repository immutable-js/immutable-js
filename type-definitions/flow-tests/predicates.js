// @flow
import { List } from 'immutable';

declare var mystery: mixed;

// $FlowExpectedError[cannot-resolve-name]
maybe.push('3');

if (mystery instanceof List) {
  maybe.push('3');
}

// Note: Flow's support for %checks is still experimental.
// Support this in the future.
// if (List.isList(mystery)) {
//   mystery.push('3');
// }
