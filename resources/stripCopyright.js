/**
 *  Copyright (c) 2014-2015, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

var fs = require('fs');

function stripCopyright(source) {
  var copyright = getCopyright();
  var position = source.indexOf(copyright);
  if (position === -1) {
    return source;
  }
  return source.slice(0, position) + source.slice(position + copyright.length);
}

var _copyright;
function getCopyright() {
  return _copyright || (_copyright = fs.readFileSync('resources/COPYRIGHT'));
}

module.exports = stripCopyright;
