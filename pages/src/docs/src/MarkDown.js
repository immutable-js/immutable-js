/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class MarkDown extends Component {
  static propTypes = {
    contents: PropTypes.oneOfType([PropTypes.string, PropTypes.node])
      .isRequired,
    className: PropTypes.string,
  };

  shouldComponentUpdate() {
    return false;
  }

  render() {
    const html = this.props.contents;
    return (
      <div
        className={this.props.className}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }
}
