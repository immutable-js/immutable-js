/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var markdown = require('./markdown');
var defs = require('./getTypeDefs');

function genMarkdownDoc(typeDefSource) {
  return markdown(
    typeDefSource.replace(/\n[^\n]+?travis-ci.org[^\n]+?\n/, '\n'),
    {
      defs,
      typePath: ['Immutable'],
      relPath: 'docs/',
    }
  );
}

module.exports = genMarkdownDoc;
