/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var React = require('react');

var MarkDown = React.createClass({
  shouldComponentUpdate() {
    return false;
  },

  render() {
    var html = this.props.contents;
    return (
      <div
        className={this.props.className}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  },
});

module.exports = MarkDown;
