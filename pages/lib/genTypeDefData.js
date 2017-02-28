var TypeScript = require('./typescript-services');
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
