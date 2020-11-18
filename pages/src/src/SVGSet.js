/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';

function SVGSet(props) {
  return (
    <svg className="svg" style={props.style} viewBox="0 0 300 42.2">
      {props.children}
    </svg>
  );
}

SVGSet.propTypes = {
  style: PropTypes.object,
};

export default SVGSet;
