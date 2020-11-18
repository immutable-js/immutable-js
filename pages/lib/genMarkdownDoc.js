/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const markdown = require('./markdown');

function genMarkdownDoc(typeDefSource, defs) {
  return markdown(
    typeDefSource.replace(/\n[^\n]+?travis-ci.org[^\n]+?\n/, '\n'),
    {
      defs,
      typePath: ['Immutable'],
      relPath: 'docs/',
    },
    defs
  );
}

module.exports = genMarkdownDoc;
