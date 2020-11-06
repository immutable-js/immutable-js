/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var React = require('react');
var Header = require('./Header');
var readme = require('../../generated/readme.json');

require('../../lib/runkit-embed');

var Index = React.createClass({
  render: function () {
    return (
      <div>
        <Header />
        <div className="pageBody" id="body">
          <div className="contents">
            <div dangerouslySetInnerHTML={{ __html: readme }} />
          </div>
        </div>
      </div>
    );
  },
});

module.exports = Index;
