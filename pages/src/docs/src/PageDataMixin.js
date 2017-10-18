/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var React = require('react');

module.exports = {
  contextTypes: {
    getPageData: React.PropTypes.func.isRequired,
  },

  /**
   * Returns the most recent change event.
   */
  getPageData() {
    return this.context.getPageData();
  },
};
