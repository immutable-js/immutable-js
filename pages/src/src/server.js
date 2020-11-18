/**
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { StaticRouter as Router } from 'react-router-dom';
import { renderToString } from 'react-dom/server';
import App from './index';

// This is used by the gulp pre-rendering process to generate a static version of the docs, which search engines can crawl.
// global.output is picked up by vm.runInNewContext
const content = renderToString(
  <Router location="/">
    <App />
  </Router>
);
global.output = content;
