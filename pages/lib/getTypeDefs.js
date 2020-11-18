/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const markdownDocs = require('./markdownDocs');
const defs = require('../generated/immutable.d.json');

markdownDocs(defs);

module.exports = defs;
