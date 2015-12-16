var TypeScript = require('./typescript-services');
var TypeKind = require('./TypeKind');
var { Seq } = require('../../');

class DocVisitor extends TypeScript.SyntaxWalker {

  constructor(text) {
    this.text = text;
    this.stack = [];
    this.data = {};
    this.typeParams = [];
    this.aliases = [];
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

  getDoc(node) {
    return parseComment(
      last(
        TypeScript.ASTHelpers.docComments(node, this.text)
      )
    );
  }

  isTypeParam(name) {
    return this.typeParams.some(set => !!set[name]);
  }

  isAliased(name) {
    return !!Seq(this.aliases).last()[name];
  }

  addAliases(comment, name) {
    Seq(comment && comment.notes).filter(
      note => note.name === 'alias'
    ).map(
      node => node.body
    ).forEach(alias => {
      Seq(this.aliases).last()[alias] = name;
    });
  }

  visitModuleDeclaration(node) {
    var moduleObj = {};

    var comment = this.getDoc(node);
    if (!shouldIgnore(comment)) {
      var name =
        node.name ? node.name.text() :
        node.stringLiteral ? node.stringLiteral.text() :
        '';

      if (comment) {
        setIn(this.data, [name, 'doc'], comment);
      }

      setIn(this.data, [name, 'module'], moduleObj);
    }

    this.push(moduleObj);
    this.aliases.push({});

    super.visitModuleDeclaration(node);

    this.aliases.pop();
    this.pop();
  }

  visitFunctionDeclaration(node) {
    var comment = this.getDoc(node);
    var name = node.identifier.text();
    if (!shouldIgnore(comment) && !this.isAliased(name)) {
      this.addAliases(comment, name);

      var comment = this.getDoc(node);
      if (comment) {
        setIn(this.data, [name, 'call', 'doc'], comment);
      }

      var callSignature = this.parseCallSignature(node.callSignature);
      callSignature.line = this.getLineNum(node);
      pushIn(this.data, [name, 'call', 'signatures'], callSignature);
    }
    super.visitFunctionDeclaration(node);
  }

  visitInterfaceDeclaration(node) {
    var interfaceObj = {};

    var comment = this.getDoc(node);
    var ignore = shouldIgnore(comment);
    if (!ignore) {
      var name = node.identifier.text();

      interfaceObj.line = this.getLineNum(node)

      if (comment) {
        interfaceObj.doc = comment;
      }
      if (node.typeParameterList) {
        interfaceObj.typeParams = node.typeParameterList.typeParameters.map(tp => {
          if (tp.constraint) {
            throw new Error('Not yet implemented: type constraint');
          }
          return tp.identifier.text();
        });
      }

      this.typeParams.push(
        Seq(interfaceObj.typeParams).toSetSeq().toObject()
      );

      if (node.heritageClauses) {
        node.heritageClauses.forEach(hc => {
          var kind;
          if (hc.extendsOrImplementsKeyword.kind() === TypeScript.SyntaxKind.ExtendsKeyword) {
            kind = 'extends';
          } else if (hc.extendsOrImplementsKeyword.kind() === TypeScript.SyntaxKind.ImplementsKeyword) {
            kind = 'implements';
          } else {
            throw new Error('Unknown heritageClause');
          }
          interfaceObj[kind] = hc.typeNames.map(c => this.parseType(c));
        });
      }
      setIn(this.data, [name, 'interface'], interfaceObj);
    }

    this.push(interfaceObj);
    this.aliases.push({});

    super.visitInterfaceDeclaration(node);

    if (!ignore) {
      this.typeParams.pop();
    }

    this.aliases.pop();
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
    var comment = this.getDoc(node);
    var name = node.propertyName.text();
    if (!shouldIgnore(comment) && !this.isAliased(name)) {
      this.addAliases(comment, name);

      this.ensureGroup(node);

      var propertyObj = {
        line: this.getLineNum(node),
        // name: name // redundant
      };

      var comment = this.getDoc(node);
      if (comment) {
        setIn(last(this.data.groups), ['members', '#'+name, 'doc'], comment);
      }

      setIn(last(this.data.groups), ['members', '#'+name], propertyObj);

      if (node.questionToken) {
        throw new Error('NYI: questionToken');
      }

      if (node.typeAnnotation) {
        propertyObj.type = this.parseType(node.typeAnnotation.type);
      }
    }
    super.visitPropertySignature(node);
  }

  visitMethodSignature(node) {
    var comment = this.getDoc(node);
    var name = node.propertyName.text();
    if (!shouldIgnore(comment) && !this.isAliased(name)) {
      this.addAliases(comment, name);

      this.ensureGroup(node);

      var comment = this.getDoc(node);
      if (comment) {
        setIn(last(this.data.groups), ['members', '#'+name, 'doc'], comment);
      }

      var callSignature = this.parseCallSignature(node.callSignature);
      callSignature.line = this.getLineNum(node);
      pushIn(last(this.data.groups), ['members', '#'+name, 'signatures'], callSignature);

      if (node.questionToken) {
        throw new Error('NYI: questionToken');
      }
    }
    super.visitMethodSignature(node);
  }

  parseCallSignature(node) {
    var callSignature = {};

    if (node.typeParameterList &&
        node.typeParameterList.typeParameters.length) {
      callSignature.typeParams = node.typeParameterList.typeParameters.map(tp => {
        if (tp.constraint) {
          throw new Error('Not yet implemented: type constraint');
        }
        return tp.identifier.text();
      });
    }

    this.typeParams.push(
      Seq(callSignature.typeParams).toSetSeq().toObject()
    );

    if (node.parameterList.parameters.length) {
      callSignature.params =
        node.parameterList.parameters.map(p => this.parseParam(p));
    }

    if (node.typeAnnotation) {
      callSignature.type = this.parseType(node.typeAnnotation.type);
    }

    this.typeParams.pop();

    return callSignature;
  }

  parseType(node) {
    switch (node.kind()) {
      case TypeScript.SyntaxKind.AnyKeyword:
        return {
          k: TypeKind.Any
        };
      case TypeScript.SyntaxKind.BooleanKeyword:
        return {
          k: TypeKind.Boolean
        };
      case TypeScript.SyntaxKind.NumberKeyword:
        return {
          k: TypeKind.Number
        };
      case TypeScript.SyntaxKind.StringKeyword:
        return {
          k: TypeKind.String
        };
      case TypeScript.SyntaxKind.ObjectType:
        return {
          k: TypeKind.Object,
          members: node.typeMembers.map(m => {
            switch (m.kind()) {
              case TypeScript.SyntaxKind.IndexSignature:
                return {
                  index: true,
                  params: m.parameters.map(p => this.parseParam(p)),
                  type: this.parseType(m.typeAnnotation.type)
                }
              case TypeScript.SyntaxKind.PropertySignature:
                return {
                  name: m.propertyName.text(),
                  type: this.parseType(m.typeAnnotation.type)
                }
            }
            throw new Error('Unknown member kind: ' + m.kind());
          })
        };
      case TypeScript.SyntaxKind.ArrayType:
        return {
          k: TypeKind.Array,
          type: this.parseType(node.type)
        }
      case TypeScript.SyntaxKind.FunctionType:
        return {
          k: TypeKind.Function,
          params: node.parameterList.parameters.map(p => this.parseParam(p)),
          type: this.parseType(node.type)
        };
      case TypeScript.SyntaxKind.IdentifierName:
        var text = node.text();
        if (this.isTypeParam(text)) {
          return {
            k: TypeKind.Param,
            param: node.text()
          };
        } else {
          return {
            k: TypeKind.Type,
            name: node.text()
          };
        }
      case TypeScript.SyntaxKind.GenericType:
        var t = {
          k: TypeKind.Type,
          name: getText(node.name)
        };
        if (node.typeArgumentList) {
          t.args = node.typeArgumentList.typeArguments.map(
            ta => this.parseType(ta)
          );
        }
        return t;
      case TypeScript.SyntaxKind.QualifiedName:
        var type = this.parseType(node.right);
        type.qualifier = [node.left.text()].concat(type.qualifier || []);
        return type;
    }
    throw new Error('Unknown type kind: ' + node.kind());
  }

  parseParam(node) {
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
      p.type = this.parseType(node.typeAnnotation.type);
    }
    return p;
  }
}

function getText(node) {
  if (node.kind() === TypeScript.SyntaxKind.QualifiedName) {
    return getText(node.left) + '.' + getText(node.right);
  }
  return node.text();
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

var COMMENT_NOTE_RX = /@(\w+)(?:\s+(.*))?/;

var NOTE_BLACKLIST = {
  override: true
};

function parseComment(node) {
  if (!node) {
    return node;
  }
  var text = node.fullText();
  var lines;
  if (text.substr(0, 2) === '//') {
    lines = text.substr(2);
  } else {
    lines = text.split('\n').slice(1, -1).map(l => l.trim().substr(2));
  }

  var notes = lines
    .map(l => l.match(COMMENT_NOTE_RX))
    .filter(n => n !== null && !NOTE_BLACKLIST[n[1]])
    .map(n => ({ name: n[1], body: n[2] }));
  var paragraphs =
    lines.filter(l => !COMMENT_NOTE_RX.test(l)).join('\n').split('\n\n');
  var synopsis = paragraphs.shift();
  var description = paragraphs.join('\n\n');

  var comment = { synopsis };
  if (notes.length) {
    comment.notes = notes;
  }
  if (description) {
    comment.description = description;
  }

  return comment;
}


function shouldIgnore(comment) {
  return !!(comment && Seq(comment.notes).find(
    note => note.name === 'ignore'
  ));
}

module.exports = DocVisitor;
