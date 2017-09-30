/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var React = require('react');
var SVGSet = require('../../src/SVGSet');
var Logo = require('../../src/Logo');

var DocHeader = React.createClass({

  render() {
    return (
      <div className="header">
        <div className="miniHeader">
          <div className="miniHeaderContents">
            <a href="../" target="_self" className="miniLogo">
              <SVGSet>
                <Logo color="#FC4349" />
                <Logo color="#2C3E50" inline={true} />
              </SVGSet>
            </a>
            <a href="./" target="_self">Docs</a>
            <a href="http://stackoverflow.com/questions/tagged/immutable.js?sort=votes">Questions</a>
            <a href="https://github.com/facebook/immutable-js/">Github</a>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = DocHeader;
