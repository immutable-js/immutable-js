/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { Route, Switch } from 'react-router-dom';
import DocHeader from './DocHeader';
import DocSearch from './DocSearch';
import TypeDocumentation from './TypeDocumentation';

import '../../../lib/runkit-embed';

function App() {
  return (
    <div>
      <DocHeader />
      <div className="pageBody" id="body">
        <div className="contents">
          <DocSearch />
          <Switch>
            <Route exact path="/" component={TypeDocumentation} />
            <Route path="/:name/:memberName" component={TypeDocumentation} />
            <Route path="/:name" component={TypeDocumentation} />
          </Switch>
        </div>
      </div>
    </div>
  );
}

export default App;
