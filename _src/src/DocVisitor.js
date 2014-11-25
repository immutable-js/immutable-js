var TypeScript = require('./typescript-services');
var TypeKind = require('./TypeKind');

class DocVisitor extends TypeScript.SyntaxWalker {

  constructor(text) {
    this.text = text;
    this.stack = [];
    this.data = {};
  }

  push(newData) {
    this.stack.push(this.data);
    this.data = newData;
  }

  pop() {
    var prevData = this.data;
    this.data = this.stack.pop();
    return prevData;
  }

  getLineNum(node) {
    return this.text.lineMap().getLineNumberFromPosition(
      TypeScript.firstToken(node).fullStart()
    );
  }

  visitModuleDeclaration(node) {
    var moduleObj = {
      line: this.getLineNum(node.moduleKeyword),
    };

    if (node.name) {
      var name = node.name.text();
      // moduleObj.name = name; // redundant
      setIn(this.data, ['types', name, 'module'], moduleObj);
    } else {
      if (node.stringLiteral) {
        moduleObj.literalName = node.stringLiteral.text();
      }
      this.data.module = moduleObj;
    }

    this.push(moduleObj);

    var comment = parseComment(last(TypeScript.ASTHelpers.docComments(node, this.text)));
    if (comment) {
      pushIn(this.data, ['doc'], comment);
    }

    super.visitModuleDeclaration(node);

    this.pop();
  }

  visitFunctionDeclaration(node) {
    var name = node.identifier.text();
    var functionObj = {
      line: this.getLineNum(node),
    };

    pushIn(this.data, ['types', name, 'call', 'impl'], functionObj);

    var comment = parseComment(last(TypeScript.ASTHelpers.docComments(node, this.text)));
    if (comment) {
      pushIn(this.data, ['types', name, 'call', 'doc'], comment);
    }

    if (node.callSignature.typeParameterList &&
        node.callSignature.typeParameterList.typeParameters.length) {
      functionObj.typeParams = node.callSignature.typeParameterList.typeParameters.map(function (tp) {
        if (tp.constraint) {
          throw new Error('Not yet implemented: type constraint');
        }
        return tp.identifier.text();
      });
    }

    if (node.callSignature.parameterList.parameters.length) {
      functionObj.params = node.callSignature.parameterList.parameters.map(function (p) {
        return parseParam(p);
      });
    }

    if (node.callSignature.typeAnnotation) {
      functionObj.type = parseType(node.callSignature.typeAnnotation.type);
    }

    super.visitFunctionDeclaration(node);
  }

  visitInterfaceDeclaration(node) {
    var name = node.identifier.text();
    var interfaceObj = {
      line: this.getLineNum(node),
      // name: name // redundant
    };

    setIn(this.data, ['types', name, 'interface'], interfaceObj);
    this.push(interfaceObj);

    var comment = parseComment(last(TypeScript.ASTHelpers.docComments(node, this.text)));
    if (comment) {
      pushIn(this.data, ['doc'], comment);
    }

    if (node.typeParameterList) {
      interfaceObj.typeParams = node.typeParameterList.typeParameters.map(function (tp) {
        if (tp.constraint) {
          throw new Error('Not yet implemented: type constraint');
        }
        return tp.identifier.text();
      });
    }
    if (node.heritageClauses) {
      node.heritageClauses.forEach(function (hc) {
        var type;
        if (hc.extendsOrImplementsKeyword.kind() === TypeScript.SyntaxKind.ExtendsKeyword) {
          type = 'extends';
        } else if (hc.extendsOrImplementsKeyword.kind() === TypeScript.SyntaxKind.ImplementsKeyword) {
          type = 'implements';
        } else {
          throw new Error('Unknown type');
        }
        hc.typeNames.forEach(function (tn) {
          var heritageObj = {
            name: tn.name.text(),
          };
          pushIn(this.data, [type], heritageObj);
          if (tn.typeArgumentList) {
            heritageObj.args = tn.typeArgumentList.typeArguments.map(function (ta) {
              return parseType(ta);
            });
          }
        }, this);
      }, this);
    }

    super.visitInterfaceDeclaration(node);

    this.pop();
  }

  visitTypeAnnotation(node) {
    // do not visit type annotations.
    return;
  }

  ensureGroup(node) {
    var trivia = TypeScript.firstToken(node).leadingTrivia();
    if (trivia && trivia.trivia) {
      trivia.trivia.forEach(tv => {
        if (tv.kind() === TypeScript.SyntaxKind.SingleLineCommentTrivia) {
          pushIn(this.data, ['groups'], {
            title: tv.fullText().substr(3)
          });
        }
      })
    }
    if (!this.data.groups || this.data.groups.length === 0) {
      pushIn(this.data, ['groups'], {});
    }
  }

  visitPropertySignature(node) {
    this.ensureGroup(node);

    var name = node.propertyName.text();
    var propertyObj = {
      line: this.getLineNum(node),
      // name: name // redundant
    };

    setIn(last(this.data.groups), ['properties', name], propertyObj);

    var comment = parseComment(last(TypeScript.ASTHelpers.docComments(node, this.text)));
    if (comment) {
      pushIn(last(this.data.groups), ['properties', name, 'doc'], comment);
    }

    if (node.questionToken) {
      throw new Error('NYI: questionToken');
    }

    if (node.typeAnnotation) {
      propertyObj.type = parseType(node.typeAnnotation.type);
    }

    super.visitPropertySignature(node);
  }

  visitMethodSignature(node) {
    this.ensureGroup(node);

    var name = node.propertyName.text();
    var methodObj = {
      line: this.getLineNum(node),
      // name: name // redundant
    };

    setIn(last(this.data.groups), ['methods', name, 'impl'], methodObj);

    var comment = parseComment(last(TypeScript.ASTHelpers.docComments(node, this.text)));
    if (comment) {
      pushIn(last(this.data.groups), ['methods', name, 'doc'], comment);
    }

    if (node.questionToken) {
      throw new Error('NYI: questionToken');
    }

    if (node.callSignature.typeParameterList &&
        node.callSignature.typeParameterList.typeParameters.length) {
      methodObj.typeParams = node.callSignature.typeParameterList.typeParameters.map(function (tp) {
        if (tp.constraint) {
          throw new Error('Not yet implemented: type constraint');
        }
        return tp.identifier.text();
      });
    }

    if (node.callSignature.parameterList.parameters.length) {
      methodObj.params = node.callSignature.parameterList.parameters.map(function (p) {
        return parseParam(p);
      });
    }

    if (node.callSignature.typeAnnotation) {
      methodObj.type = parseType(node.callSignature.typeAnnotation.type);
    }

    super.visitMethodSignature(node);
  }
}

function last(list) {
  return list[list.length - 1];
}

function pushIn(obj, path, value) {
  for (var ii = 0; ii < path.length; ii++) {
    obj = obj[path[ii]] || (obj[path[ii]] = (ii === path.length - 1 ? [] : {}));
  }
  obj.push(value);
}

function setIn(obj, path, value) {
  for (var ii = 0; ii < path.length - 1; ii++) {
    obj = obj[path[ii]] || (obj[path[ii]] = {});
  }
  obj[path[path.length - 1]] = value;
}

function parseComment(node) {
  if (!node) {
    return node;
  }
  node = node.fullText();
  if (node.substr(0, 2) === '//') {
    return node.substr(2);
  }
  var lines = node.split('\n').slice(1, -1).map(l => l.trim().substr(2)).join('\n');
  return lines;
}

function parseParam(node) {
  var p = {
    name: node.identifier.text()
  };
  if (node.dotDotDotToken) {
    p.varArgs = true;
  }
  if (node.questionToken) {
    p.optional = true;
  }
  if (node.equalsValueClause) {
    throw new Error('NYI: equalsValueClause');
  }
  if (node.typeAnnotation) {
    p.type = parseType(node.typeAnnotation.type);
  }
  return p;
}

function parseType(node) {
  switch (node.kind()) {
    case TypeScript.SyntaxKind.IdentifierName:
      return {
        k: TypeKind.Param,
        param: node.text()
      };
    case TypeScript.SyntaxKind.AnyKeyword:
      return {
        k: TypeKind.Any,
        // primitive: 'any' // redundant
      };
    case TypeScript.SyntaxKind.BooleanKeyword:
      return {
        k: TypeKind.Boolean,
        // primitive: 'boolean' // redundant
      };
    case TypeScript.SyntaxKind.NumberKeyword:
      return {
        k: TypeKind.Number,
        // primitive: 'number' // redundant
      };
    case TypeScript.SyntaxKind.StringKeyword:
      return {
        k: TypeKind.String,
        // primitive: 'string' // redundant
      };
    case TypeScript.SyntaxKind.ObjectType:
      return {
        k: TypeKind.Object,
        members: node.typeMembers.map(function (m) {
          switch (m.kind()) {
            case TypeScript.SyntaxKind.IndexSignature:
              return {
                index: true,
                params: m.parameters.map(function (p) { return parseParam(p); }),
                type: parseType(m.typeAnnotation.type)
              }
            case TypeScript.SyntaxKind.PropertySignature:
              return {
                name: m.propertyName.text(),
                type: parseType(m.typeAnnotation.type)
              }
          }
          throw new Error('Unknown member kind: ' + m.kind());
        })
      };
    case TypeScript.SyntaxKind.ArrayType:
      return {
        k: TypeKind.Array,
        type: parseType(node.type)
      }
    case TypeScript.SyntaxKind.FunctionType:
      return {
        k: TypeKind.Function,
        params: node.parameterList.parameters.map(function (p) {
          return parseParam(p);
        }),
        type: parseType(node.type)
      };
    case TypeScript.SyntaxKind.GenericType:
      var t = {
        k: TypeKind.Type,
        name: node.name.text()
      };
      if (node.typeArgumentList) {
        t.args = node.typeArgumentList.typeArguments.map(function (ta) {
          return parseType(ta);
        });
      }
      return t;
  }
  throw new Error('Unknown type kind: ' + node.kind());
}

module.exports = DocVisitor;
