/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const ts = require('typescript');

const TypeKind = require('./TypeKind');

function genTypeDefData(typeDefPath, typeDefSource) {
  const sourceFile = ts.createSourceFile(
    typeDefPath,
    typeDefSource,
    ts.ScriptTarget.ES2015,
    /* parentReferences */ true
  );
  return DocVisitor(sourceFile);
}

module.exports = genTypeDefData;

function DocVisitor(source) {
  const stack = [];
  let data = {};
  const typeParams = [];
  const aliases = [];

  visit(source);
  return pop();

  function visit(node) {
    switch (node.kind) {
      case ts.SyntaxKind.ModuleDeclaration:
        return visitModuleDeclaration(node);
      case ts.SyntaxKind.FunctionDeclaration:
        return visitFunctionDeclaration(node);
      case ts.SyntaxKind.InterfaceDeclaration:
        return visitInterfaceDeclaration(node);
      case ts.SyntaxKind.TypeAnnotation:
        return; // do not visit type annotations.
      case ts.SyntaxKind.PropertySignature:
        return visitPropertySignature(node);
      case ts.SyntaxKind.MethodSignature:
        return visitMethodSignature(node);
      default:
        return ts.forEachChild(node, visit);
    }
  }

  function push(newData) {
    stack.push(data);
    data = newData;
  }

  function pop() {
    const prevData = data;
    data = stack.pop();
    return prevData;
  }

  function isTypeParam(name) {
    return typeParams.some((set) => set && set.indexOf(name) !== -1);
  }

  function isAliased(name) {
    return !!last(aliases)[name];
  }

  function addAliases(comment, name) {
    comment &&
      comment.notes &&
      comment.notes
        .filter((note) => note.name === 'alias')
        .map((node) => node.body)
        .forEach((alias) => {
          last(aliases)[alias] = name;
        });
  }

  function visitModuleDeclaration(node) {
    const moduleObj = {};

    const comment = getDoc(node);
    if (!shouldIgnore(comment)) {
      const name = node.name
        ? node.name.text
        : node.stringLiteral
        ? node.stringLiteral.text
        : '';

      if (comment) {
        setIn(data, [name, 'doc'], comment);
      }

      setIn(data, [name, 'module'], moduleObj);
    }

    push(moduleObj);
    aliases.push({});

    ts.forEachChild(node, visit);

    aliases.pop();
    pop();
  }

  function visitFunctionDeclaration(node) {
    const comment = getDoc(node);
    const name = node.name.text;
    if (!shouldIgnore(comment) && !isAliased(name)) {
      addAliases(comment, name);

      if (comment) {
        setIn(data, [name, 'call', 'doc'], comment);
      }

      const callSignature = parseCallSignature(node);
      callSignature.line = getLineNum(node);
      pushIn(data, [name, 'call', 'signatures'], callSignature);
    }

    ts.forEachChild(node, visit);
  }

  function visitInterfaceDeclaration(node) {
    const interfaceObj = {};

    const comment = getDoc(node);
    const ignore = shouldIgnore(comment);
    if (!ignore) {
      const name = node.name.text;

      interfaceObj.line = getLineNum(node);

      if (comment) {
        interfaceObj.doc = comment;
      }
      if (node.typeParameters) {
        interfaceObj.typeParams = node.typeParameters.map((tp) => tp.name.text);
      }

      typeParams.push(interfaceObj.typeParams);

      if (node.heritageClauses) {
        node.heritageClauses.forEach((hc) => {
          let kind;
          if (hc.token === ts.SyntaxKind.ExtendsKeyword) {
            kind = 'extends';
          } else if (hc.token === ts.SyntaxKind.ImplementsKeyword) {
            kind = 'implements';
          } else {
            throw new Error('Unknown heritageClause');
          }
          interfaceObj[kind] = hc.types.map((c) => parseType(c));
        });
      }
      setIn(data, [name, 'interface'], interfaceObj);
    }

    push(interfaceObj);
    aliases.push({});

    ts.forEachChild(node, visit);

    if (!ignore) {
      typeParams.pop();
    }

    aliases.pop();
    pop();
  }

  function ensureGroup(node) {
    const trivia = ts.getLeadingCommentRangesOfNode(node, source);
    if (trivia && trivia.length) {
      trivia.forEach((range) => {
        if (range.kind === ts.SyntaxKind.SingleLineCommentTrivia) {
          pushIn(data, ['groups'], {
            title: source.text.substring(range.pos + 3, range.end),
          });
        }
      });
    }
    if (!data.groups || data.groups.length === 0) {
      pushIn(data, ['groups'], {});
    }
  }

  function visitPropertySignature(node) {
    const comment = getDoc(node);
    const name = ts.getTextOfNode(node.name);
    if (!shouldIgnore(comment) && !isAliased(name)) {
      addAliases(comment, name);

      ensureGroup(node);

      const propertyObj = {
        line: getLineNum(node),
        // name: name // redundant
      };

      if (comment) {
        setIn(last(data.groups), ['members', '#' + name, 'doc'], comment);
      }

      setIn(last(data.groups), ['members', '#' + name], propertyObj);

      if (node.questionToken) {
        throw new Error('NYI: questionToken');
      }

      if (node.typeAnnotation) {
        propertyObj.type = parseType(node.typeAnnotation.type);
      }
    }

    ts.forEachChild(node, visit);
  }

  function visitMethodSignature(node) {
    const comment = getDoc(node);
    const name = ts.getTextOfNode(node.name);
    if (!shouldIgnore(comment) && !isAliased(name)) {
      addAliases(comment, name);

      ensureGroup(node);

      if (comment) {
        setIn(last(data.groups), ['members', '#' + name, 'doc'], comment);
      }

      const callSignature = parseCallSignature(node);
      callSignature.line = getLineNum(node);
      pushIn(
        last(data.groups),
        ['members', '#' + name, 'signatures'],
        callSignature
      );

      if (node.questionToken) {
        throw new Error('NYI: questionToken');
      }
    }

    ts.forEachChild(node, visit);
  }

  function parseCallSignature(node) {
    const callSignature = {};

    if (node.typeParameters) {
      callSignature.typeParams = node.typeParameters.map((tp) => tp.name.text);
    }

    typeParams.push(callSignature.typeParams);

    if (node.parameters.length) {
      callSignature.params = node.parameters.map((p) => parseParam(p));
    }

    if (node.type) {
      callSignature.type = parseType(node.type);
    }

    typeParams.pop();

    return callSignature;
  }

  function parseType(node) {
    switch (node.kind) {
      case ts.SyntaxKind.NeverKeyword:
        return {
          k: TypeKind.Never,
        };
      case ts.SyntaxKind.AnyKeyword:
        return {
          k: TypeKind.Any,
        };
      case ts.SyntaxKind.UnknownKeyword:
        return {
          k: TypeKind.Unknown,
        };
      case ts.SyntaxKind.NullKeyword:
        return {
          k: TypeKind.Null,
        };
      case ts.SyntaxKind.ThisType:
        return {
          k: TypeKind.This,
        };
      case ts.SyntaxKind.UndefinedKeyword:
        return {
          k: TypeKind.Undefined,
        };
      case ts.SyntaxKind.BooleanKeyword:
        return {
          k: TypeKind.Boolean,
        };
      case ts.SyntaxKind.NumberKeyword:
        return {
          k: TypeKind.Number,
        };
      case ts.SyntaxKind.StringKeyword:
        return {
          k: TypeKind.String,
        };
      case ts.SyntaxKind.UnionType:
        return {
          k: TypeKind.Union,
          types: node.types.map(parseType),
        };
      case ts.SyntaxKind.IntersectionType:
        return {
          k: TypeKind.Intersection,
          types: node.types.map(parseType),
        };
      case ts.SyntaxKind.TupleType:
        return {
          k: TypeKind.Tuple,
          types: node.elementTypes.map(parseType),
        };
      case ts.SyntaxKind.IndexedAccessType:
        return {
          k: TypeKind.Indexed,
          type: parseType(node.objectType),
          index: parseType(node.indexType),
        };
      case ts.SyntaxKind.TypeOperator: {
        const operator =
          node.operator === ts.SyntaxKind.KeyOfKeyword
            ? 'keyof'
            : node.operator === ts.SyntaxKind.ReadonlyKeyword
            ? 'readonly'
            : undefined;
        if (!operator) {
          throw new Error(
            'Unknown operator kind: ' + ts.SyntaxKind[node.operator]
          );
        }
        return {
          k: TypeKind.Operator,
          operator,
          type: parseType(node.type),
        };
      }
      case ts.SyntaxKind.TypeLiteral:
        return {
          k: TypeKind.Object,
          members: node.members.map((m) => {
            switch (m.kind) {
              case ts.SyntaxKind.IndexSignature:
                return {
                  index: true,
                  params: m.parameters.map((p) => parseParam(p)),
                  type: parseType(m.type),
                };
              case ts.SyntaxKind.PropertySignature:
                return {
                  name: m.name.text,
                  type: m.type && parseType(m.type),
                };
            }
            throw new Error('Unknown member kind: ' + ts.SyntaxKind[m.kind]);
          }),
        };
      case ts.SyntaxKind.ArrayType:
        return {
          k: TypeKind.Array,
          type: parseType(node.elementType),
        };
      case ts.SyntaxKind.FunctionType:
        return {
          k: TypeKind.Function,
          typeParams: node.typeParameters && node.typeParameters.map(parseType),
          params: node.parameters.map((p) => parseParam(p)),
          type: parseType(node.type),
        };
      case ts.SyntaxKind.TypeReference: {
        const name = getNameText(node.typeName);
        if (isTypeParam(name)) {
          return {
            k: TypeKind.Param,
            param: name,
          };
        }
        return {
          k: TypeKind.Type,
          name: getNameText(node.typeName),
          args: node.typeArguments && node.typeArguments.map(parseType),
        };
      }
      case ts.SyntaxKind.ExpressionWithTypeArguments:
        return {
          k: TypeKind.Type,
          name: getNameText(node.expression),
          args: node.typeArguments && node.typeArguments.map(parseType),
        };
      case ts.SyntaxKind.QualifiedName: {
        const type = parseType(node.right);
        type.qualifier = [node.left.text].concat(type.qualifier || []);
        return type;
      }
      case ts.SyntaxKind.TypePredicate:
        return {
          k: TypeKind.Boolean,
        };
      case ts.SyntaxKind.MappedType:
        // Simplification of MappedType to typical Object type.
        return {
          k: TypeKind.Object,
          members: [
            {
              index: true,
              params: [
                {
                  name: 'key',
                  type: { k: TypeKind.String },
                },
              ],
              type: parseType(node.type),
            },
          ],
        };
    }
    throw new Error('Unknown type kind: ' + ts.SyntaxKind[node.kind]);
  }

  function parseParam(node) {
    const p = {
      name: node.name.text,
      type: parseType(node.type),
    };
    if (node.dotDotDotToken) {
      p.varArgs = true;
    }
    if (node.questionToken) {
      p.optional = true;
    }
    if (node.initializer) {
      throw new Error('NYI: equalsValueClause');
    }
    return p;
  }
}

function getLineNum(node) {
  const source = ts.getSourceFileOfNode(node);
  return source.getLineAndCharacterOfPosition(node.getStart(source)).line;
}

const COMMENT_NOTE_RX = /^@(\w+)\s*(.*)$/;

const NOTE_BLACKLIST = {
  override: true,
};

function getDoc(node) {
  const source = ts.getSourceFileOfNode(node);
  const trivia = last(ts.getLeadingCommentRangesOfNode(node, source));
  if (!trivia || trivia.kind !== ts.SyntaxKind.MultiLineCommentTrivia) {
    return;
  }

  const lines = source.text
    .substring(trivia.pos, trivia.end)
    .split('\n')
    .slice(1, -1)
    .map((l) => l.trim().substr(2));

  const paragraphs = lines
    .filter((l) => l[0] !== '@')
    .join('\n')
    .split('\n\n');

  const synopsis = paragraphs && paragraphs.shift();
  const description = paragraphs && paragraphs.join('\n\n');
  const notes = lines
    .filter((l) => l[0] === '@')
    .map((l) => l.match(COMMENT_NOTE_RX))
    .map((n) => ({ name: n[1], body: n[2] }))
    .filter((note) => !NOTE_BLACKLIST[note.name]);

  return {
    synopsis,
    description,
    notes,
  };
}

function getNameText(node) {
  return ts.entityNameToString(node);
}

function last(list) {
  return list && list[list.length - 1];
}

function pushIn(obj, path, value) {
  for (let ii = 0; ii < path.length; ii++) {
    obj = obj[path[ii]] || (obj[path[ii]] = ii === path.length - 1 ? [] : {});
  }
  obj.push(value);
}

function setIn(obj, path, value) {
  for (let ii = 0; ii < path.length - 1; ii++) {
    obj = obj[path[ii]] || (obj[path[ii]] = {});
  }
  obj[path[path.length - 1]] = value;
}

function shouldIgnore(comment) {
  return Boolean(
    comment &&
      comment.notes &&
      comment.notes.find(
        (note) => note.name === 'ignore' || note.name === 'deprecated'
      )
  );
}
