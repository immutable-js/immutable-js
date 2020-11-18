/**
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { hydrate } from 'react-dom';

/*
window.data = {
  Immutable: window.Immutable
};
*/

import App from './index';

hydrate(<App />, document.querySelector('#app'));
