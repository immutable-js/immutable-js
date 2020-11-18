/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import Header from './Header';
import readme from '../../generated/readme.json';
import '../../lib/runkit-embed';

function Index() {
  return (
    <div>
      <Header package={readme.package} />
      <div className="pageBody" id="body">
        <div className="contents">
          <div dangerouslySetInnerHTML={{ __html: readme.content }} />
        </div>
      </div>
    </div>
  );
}

export default Index;
