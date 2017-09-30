/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var TypeScript = require('./typescript-services');
require('node-jsx').install({harmony: true});
var DocVisitor = require('./DocVisitor');


function genTypeDefData(typeDefPath, typeDefSource) {
  var typeDefText = TypeScript.SimpleText.fromString(typeDefSource);
  var typeDefAST = TypeScript.Parser.parse(typeDefPath, typeDefText, 1, true);

  var visitor = new DocVisitor(typeDefText);
  TypeScript.visitNodeOrToken(visitor, typeDefAST.sourceUnit());
  var typeDefData = visitor.pop();
  return typeDefData;
}

module.exports = genTypeDefData;
