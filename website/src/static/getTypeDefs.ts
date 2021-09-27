import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import ts from 'typescript';

import {
  CallParam,
  CallSignature,
  TypeDefinition,
  InterfaceDefinition,
  NamedType,
  Type,
  TypeDefs,
  TypeDoc,
  TypeKind,
  MemberDefinition,
} from '../TypeDefs';
import { markdown, MarkdownContext } from './markdown';
import { stripUndefineds } from './stripUndefineds';

import { writeFileSync } from 'fs'

const generatedTypeDefs = new Map<string, TypeDefs>();
export function getTypeDefs(version: string) {
  let typeDefs = generatedTypeDefs.get(version);
  if (typeDefs === undefined) {
    typeDefs = genTypeDefData(version);
    addData(version, typeDefs);
    markdownDocs(typeDefs);
    stripUndefineds(typeDefs);
    generatedTypeDefs.set(version, typeDefs);
  }

  // HACK: sort and output to diff later
  typeDefs.types = sortedObj(typeDefs.types)
  for (const type of Object.values(typeDefs.types)) {
    if (type.functions) {
      type.functions = sortedObj(type.functions)
    }
    if (type.interface) {
      type.interface.members = sortedObj(type.interface.members)
    }
  }
  writeFileSync(`immutable-api-${version}.json`, JSON.stringify(typeDefs, null, 2))

  return typeDefs;
}

function sortedObj(obj:any) {
  const sortedObj:any = {}
  for (const key of Object.keys(obj).sort()) {
    sortedObj[key] = obj[key]
  }
  return sortedObj
}

function addData(version: string, defs: TypeDefs) {
  // Add module labels and links
  const baseUrl = `/docs/${version}/`;
  for (const typeDef of Object.values(defs.types)) {
    const isFn = isFunction(typeDef);
    const label = typeDef.qualifiedName + (isFn ? '()' : '');
    const url = baseUrl + typeDef.qualifiedName + (isFn ? '()' : '');
    typeDef.label = label;
    typeDef.url = url;
    if (typeDef.call) {
      typeDef.call.url = isFn ? url : url + '#' + typeDef.call.id;
    }
    if (typeDef.functions) {
      for (const fn of Object.values(typeDef.functions)) {
        fn.url = url + '#' + fn.id;
      }
    }
    if (typeDef.interface) {
      for (const member of Object.values(typeDef.interface.members)) {
        member.url = url + '#' + member.id;
      }
    }
  }

  // Add links to named types
  for (const typeDef of Object.values(defs.types)) {
    typeDef.call?.signatures?.forEach(addSignatureLink);
    if (typeDef.functions) {
      for (const fn of Object.values(typeDef.functions)) {
        fn.signatures?.forEach(addSignatureLink);
      }
    }
    if (typeDef.interface) {
      typeDef.interface.extends?.forEach(addTypeLink);
      typeDef.interface.implements?.forEach(addTypeLink);
      for (const member of Object.values(typeDef.interface.members)) {
        addTypeLink(member.type);
        member.signatures?.forEach(addSignatureLink);
      }
    }
  }

  function addSignatureLink(sig: CallSignature) {
    sig.params?.forEach(p => addTypeLink(p.type));
    addTypeLink(sig.type);
  }
  function addTypeLink(type: Type | undefined) {
    if (type?.k === TypeKind.Type) {
      const def = defs.types[type.name];
      if (def?.url) {
        type.url = def.url;
      }
    }
  }

  // Add heritage info
  const hasVisitedHeritage = new Set();
  Object.values(defs.types).forEach(addInherited);

  function addInherited(def: TypeDefinition) {
    if (!def.interface) {
      return;
    }
    if (hasVisitedHeritage.has(def)) {
      return;
    }
    hasVisitedHeritage.add(def);
    const interfaceDef = def.interface;
    for (const extended of interfaceDef.extends || []) {
      const extendedDef = defs.types[extended.name];
      if (extendedDef?.interface) {
        addInherited(extendedDef);
        for (const extendedMember of Object.values(
          extendedDef.interface.members
        )) {
          const inherited = extendedMember.inherited || {
            interface: extendedDef.qualifiedName,
            label: extendedMember.label,
            url: extendedMember.url,
          };
          const member = interfaceDef.members[extendedMember.name];
          if (!member) {
            const url = def.url + '#' + extendedMember.id;
            // Build inherited member
            const inheritedMember = updateInheritedTypeParams(
              { ...extendedMember, url, inherited, overrides: undefined },
              extendedDef.interface.typeParams,
              extended.args
            );
            setIn(
              interfaceDef,
              ['members', inheritedMember.name],
              inheritedMember
            );
          } else if (!member.inherited) {
            if (!member.overrides) {
              member.overrides = inherited;
            }
            if (!member.group && extendedMember.group) {
              member.group = extendedMember.group;
            }
          }
        }
      }
    }
  }
}

function isFunction(typeDef: TypeDefinition) {
  return !typeDef.interface && !typeDef.functions && typeDef.call != null;
}

/**
 * An inherited member may reference the type parameters of the parent type.
 * This updates all type parameters to the correct types.
 *
 * eg:
 *
 * interface A<T> {
 *   member(arg: T)
 * }
 *
 * interface B extends A<number> {}
 *
 * when building the member `B.member`, it will produce `member(arg: number)`
 */
function updateInheritedTypeParams(
  member: MemberDefinition,
  params: Array<string> = [],
  args: Array<Type> = []
): MemberDefinition {
  if (params.length !== args.length) {
    throw new Error(
      'Unexpected difference between number of type params and type args'
    );
  }

  // If there are no params to replace, no copy is necessary
  if (params.length === 0) return member;

  return {
    ...member,
    type: updateType(member.type),
    signatures: member.signatures?.map(updateSignature),
  };

  function updateType(type: Type): Type;
  function updateType(type: Type | undefined): Type | undefined;
  function updateType(type: Type | undefined): Type | undefined {
    switch (type?.k) {
      case TypeKind.Param:
        // A parameter reference is replaced with the implementing type argument
        const paramIndex = params.indexOf(type.param);
        return paramIndex >= 0 ? args[paramIndex] : type;
      case TypeKind.Array:
      case TypeKind.Indexed:
      case TypeKind.Operator:
        return { ...type, type: updateType(type.type) };
      case TypeKind.Union:
      case TypeKind.Intersection:
      case TypeKind.Tuple:
        return { ...type, types: type.types.map<Type>(updateType) };
      case TypeKind.Type:
        return { ...type, args: type.args?.map<Type>(updateType) };
      case TypeKind.Function:
        return updateSignature(type);
      case TypeKind.Object:
        return { ...type, members: type.members?.map(updateSignature) };
    }
    return type;
  }

  function updateSignature<S extends CallSignature>(signature: S): S {
    return {
      ...signature,
      params: signature.params?.map(p => ({ ...p, type: updateType(p.type) })),
      type: updateType(signature.type),
    };
  }
}

function markdownDocs(defs: TypeDefs) {
  markdownDoc(defs.doc, { defs });
  for (const typeDef of Object.values(defs.types)) {
    markdownDoc(typeDef.doc, { defs, typeDef });
    if (typeDef.call) {
      markdownDoc(typeDef.call.doc, {
        defs,
        typeDef,
        signatures: typeDef.call.signatures,
      });
    }
    if (typeDef.functions) {
      for (const fn of Object.values(typeDef.functions)) {
        markdownDoc(fn.doc, {
          defs,
          typeDef,
          signatures: fn.signatures,
        });
      }
    }
    if (typeDef.interface) {
      markdownDoc(typeDef.interface.doc, { defs, typeDef });
      for (const member of Object.values(typeDef.interface.members)) {
        markdownDoc(member.doc, {
          defs,
          typeDef,
          signatures: member.signatures,
        });
      }
    }
  }
}

function markdownDoc(doc: TypeDoc | undefined, context: MarkdownContext) {
  if (!doc) {
    return;
  }
  if (doc.synopsis) {
    doc.synopsis = markdown(doc.synopsis, context);
  }
  if (doc.description) {
    doc.description = markdown(doc.description, context);
  }
  if (doc.notes) {
    for (const note of doc.notes) {
      if (note.name !== 'alias') {
        note.body = markdown(note.body, context);
      }
    }
  }
}

const typeDefPath = '../type-definitions/immutable.d.ts';
const typeDefPathOld = '../type-definitions/Immutable.d.ts';

function genTypeDefData(version: string): TypeDefs {
  const typeDefSource = getTypeDefSource(version);
  const sourceFile = ts.createSourceFile(
    typeDefPath,
    typeDefSource,
    ts.ScriptTarget.ES2015,
    /* parentReferences */ true
  );

  const types = typesVisitor(sourceFile);
  const doc = types.Immutable.doc;
  delete types.Immutable;
  delete types.immutable;
  return { version, doc, types };
}

function getTypeDefSource(version: string): string {
  if (version === 'latest@main') {
    return readFileSync(typeDefPath, { encoding: 'utf8' });
  } else {
    // Previous versions used a different name for the type definitions file.
    // If the expected file isn't found for this version, try the older name.
    try {
      return execSync(`git show ${version}:${typeDefPath} 2>/dev/null`, {
        encoding: 'utf8',
      });
    } catch {
      return execSync(`git show ${version}:${typeDefPathOld}`, {
        encoding: 'utf8',
      });
    }
  }
}

function typesVisitor(source: ts.SourceFile) {
  const types: { [qualifiedName: string]: TypeDefinition } = {};
  const interfaces: Array<InterfaceDefinition> = [];
  const typeParamsScope: Array<Array<string> | undefined> = [];
  const aliases: Array<{ [alias: string]: string }> = [];
  const qualifiers: Array<string> = [];
  let currentGroup: string | undefined;

  visit(source);
  return types;

  function visit(node: ts.Node) {
    switch (node.kind) {
      case ts.SyntaxKind.ModuleDeclaration:
        visitModuleDeclaration(node as ts.ModuleDeclaration);
        return;
      case ts.SyntaxKind.FunctionDeclaration:
        visitFunctionDeclaration(node as ts.FunctionDeclaration);
        return;
      case ts.SyntaxKind.InterfaceDeclaration:
        visitInterfaceDeclaration(node as ts.InterfaceDeclaration);
        return;
      case ts.SyntaxKind.PropertySignature:
        visitPropertySignature(node as ts.PropertySignature);
        return;
      case ts.SyntaxKind.MethodSignature:
        visitMethodSignature(node as ts.MethodSignature);
        return;
      default:
        ts.forEachChild(node, visit);
        return;
    }
  }

  function isTypeParam(name: string) {
    return typeParamsScope.some(set => set && set.indexOf(name) !== -1);
  }

  function isAliased(name: string) {
    return !!last(aliases)[name];
  }

  function addAliases(comment: TypeDoc | undefined, name: string) {
    if (comment?.notes) {
      comment.notes
        .filter(note => note.name === 'alias')
        .map(node => node.body)
        .forEach(alias => {
          last(aliases)[alias] = name;
        });
    }
  }

  function visitModuleDeclaration(node: ts.ModuleDeclaration) {
    const comment = getDoc(node);
    if (shouldIgnore(comment)) {
      return;
    }

    const name = node.name.text;
    const qualifiedName = qualifiers.concat([name]).join('.');

    setIn(types, [qualifiedName, 'qualifiedName'], qualifiedName);
    setIn(types, [qualifiedName, 'doc'], comment);

    if (name !== 'Immutable') {
      qualifiers.push(name);
    }
    aliases.push({});

    ts.forEachChild(node, visit);

    if (name !== 'Immutable') {
      qualifiers.pop();
    }
    aliases.pop();
  }

  function visitFunctionDeclaration(node: ts.FunctionDeclaration) {
    const comment = getDoc(node);
    const name = node.name!.text;
    if (shouldIgnore(comment) || isAliased(name)) {
      return;
    }
    addAliases(comment, name);

    const callSignature = parseCallSignature(node);

    const parent = qualifiers.join('.');
    const qualifiedName = qualifiers.concat([name]).join('.');

    if (!parent || types[qualifiedName]) {
      // Top level function
      setIn(types, [qualifiedName, 'qualifiedName'], qualifiedName);
      setIn(types, [qualifiedName, 'call', 'name'], qualifiedName);
      setIn(types, [qualifiedName, 'call', 'label'], qualifiedName + '()');
      setIn(types, [qualifiedName, 'call', 'id'], qualifiedName + '()');
      setIn(types, [qualifiedName, 'call', 'doc'], comment);
      pushIn(types, [qualifiedName, 'call', 'signatures'], callSignature);
    } else {
      // Static method
      setIn(types, [parent, 'functions', name, 'name'], qualifiedName);
      setIn(types, [parent, 'functions', name, 'label'], qualifiedName + '()');
      setIn(types, [parent, 'functions', name, 'id'], name + '()');
      setIn(types, [parent, 'functions', name, 'isStatic'], true);
      const functions = types[parent].functions;
      pushIn(functions!, [name, 'signatures'], callSignature);
    }
  }

  function visitInterfaceDeclaration(node: ts.InterfaceDeclaration) {
    const interfaceObj: InterfaceDefinition = { members: {} };

    const name = node.name.text;
    const comment = getDoc(node);
    const ignore = shouldIgnore(comment);
    if (!ignore) {
      const qualifiedName = qualifiers.concat([name]).join('.');
      setIn(types, [qualifiedName, 'qualifiedName'], qualifiedName);

      interfaceObj.line = getLineNum(node);
      interfaceObj.doc = comment;
      interfaceObj.typeParams = node.typeParameters?.map(tp => tp.name.text);

      typeParamsScope.push(interfaceObj.typeParams);

      if (node.heritageClauses) {
        for (const hc of node.heritageClauses) {
          const heritageTypes = hc.types.map(parseType) as Array<NamedType>;
          if (hc.token === ts.SyntaxKind.ExtendsKeyword) {
            interfaceObj.extends = heritageTypes;
          } else if (hc.token === ts.SyntaxKind.ImplementsKeyword) {
            interfaceObj.implements = heritageTypes;
          } else {
            throw new Error('Unknown heritageClause');
          }
        }
      }
      setIn(types, [qualifiedName, 'interface'], interfaceObj);
    }

    interfaces.push(interfaceObj);
    qualifiers.push(name);
    aliases.push({});
    currentGroup = undefined;

    ts.forEachChild(node, visit);

    if (!ignore) {
      typeParamsScope.pop();
    }

    interfaces.pop();
    qualifiers.pop();
    aliases.pop();
  }

  function ensureGroup(node: ts.Node) {
    for (const trivia of getTrivia(node)) {
      if (trivia.kind === ts.SyntaxKind.SingleLineCommentTrivia) {
        const unfilteredCurrentGroup = source.text.substring(
          trivia.pos + 3,
          trivia.end
        );

        if (!unfilteredCurrentGroup.startsWith('tslint:')) {
          currentGroup = unfilteredCurrentGroup;
        }
      }
    }
  }

  function visitPropertySignature(node: ts.PropertySignature) {
    if (node.questionToken) {
      throw new Error('NYI: questionToken');
    }

    const comment = getDoc(node);
    const name = node.name.getText();
    if (!shouldIgnore(comment) && !isAliased(name)) {
      addAliases(comment, name);

      ensureGroup(node);

      const interfaceData = last(interfaces);
      setIn(interfaceData, ['members', name, 'name'], name);
      setIn(interfaceData, ['members', name, 'label'], name);
      setIn(interfaceData, ['members', name, 'id'], name);
      setIn(interfaceData, ['members', name, 'line'], getLineNum(node));
      setIn(interfaceData, ['members', name, 'group'], currentGroup);
      setIn(interfaceData, ['members', name, 'doc'], comment);
      setIn(
        interfaceData,
        ['members', name, 'type'],
        node.type && parseType(node.type)
      );
    }

    ts.forEachChild(node, visit);
  }

  function visitMethodSignature(node: ts.MethodSignature) {
    if (node.questionToken) {
      throw new Error('NYI: questionToken');
    }

    const interfaceData = last(interfaces);
    const comment = getDoc(node);
    const name = node.name.getText();
    if (!shouldIgnore(comment) && !isAliased(name)) {
      addAliases(comment, name);

      ensureGroup(node);

      setIn(interfaceData, ['members', name, 'name'], name);
      setIn(interfaceData, ['members', name, 'label'], name + '()');
      setIn(interfaceData, ['members', name, 'id'], name + '()');
      setIn(interfaceData, ['members', name, 'group'], currentGroup);
      setIn(interfaceData, ['members', name, 'doc'], comment);

      const callSignature = parseCallSignature(node);
      pushIn(interfaceData, ['members', name, 'signatures'], callSignature);
    }

    ts.forEachChild(node, visit);
  }

  function parseCallSignature(
    node: ts.SignatureDeclarationBase
  ): CallSignature {
    const typeParams = node.typeParameters?.map(tp => tp.name.text);
    typeParamsScope.push(typeParams);

    const callSignature: CallSignature = {
      line: getLineNum(node),
      typeParams,
      params:
        node.parameters.length > 0
          ? node.parameters.map(parseParam)
          : undefined,
      type: node.type && parseType(node.type),
    };

    typeParamsScope.pop();

    return callSignature;
  }

  function parseType(node: ts.TypeNode): Type {
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
      case ts.SyntaxKind.ObjectKeyword:
        return {
          k: TypeKind.Object,
        };
      case ts.SyntaxKind.UnionType:
        return {
          k: TypeKind.Union,
          types: (node as ts.UnionTypeNode).types.map(parseType),
        };
      case ts.SyntaxKind.IntersectionType:
        return {
          k: TypeKind.Intersection,
          types: (node as ts.IntersectionTypeNode).types.map(parseType),
        };
      case ts.SyntaxKind.TupleType:
        return {
          k: TypeKind.Tuple,
          types: (node as ts.TupleTypeNode).elements.map(parseType),
        };
      case ts.SyntaxKind.IndexedAccessType:
        return {
          k: TypeKind.Indexed,
          type: parseType((node as ts.IndexedAccessTypeNode).objectType),
          index: parseType((node as ts.IndexedAccessTypeNode).indexType),
        };
      case ts.SyntaxKind.TypeOperator: {
        const operatorNode = node as ts.TypeOperatorNode;
        const operator =
          operatorNode.operator === ts.SyntaxKind.KeyOfKeyword
            ? 'keyof'
            : operatorNode.operator === ts.SyntaxKind.ReadonlyKeyword
            ? 'readonly'
            : undefined;
        if (!operator) {
          throw new Error(
            'Unknown operator kind: ' + ts.SyntaxKind[operatorNode.operator]
          );
        }
        return {
          k: TypeKind.Operator,
          operator,
          type: parseType(operatorNode.type),
        };
      }
      case ts.SyntaxKind.TypeLiteral:
        return {
          k: TypeKind.Object,
          members: (node as ts.TypeLiteralNode).members.map(m => {
            switch (m.kind) {
              case ts.SyntaxKind.IndexSignature:
                const indexNode = m as ts.IndexSignatureDeclaration;
                return {
                  index: true,
                  params: indexNode.parameters.map(parseParam),
                  type: parseType(indexNode.type),
                };
              case ts.SyntaxKind.PropertySignature:
                const propNode = m as ts.PropertySignature;
                return {
                  // Note: this will break on computed or other complex props.
                  name: (propNode.name as ts.Identifier).text,
                  type: propNode.type && parseType(propNode.type),
                };
            }
            throw new Error('Unknown member kind: ' + ts.SyntaxKind[m.kind]);
          }),
        };
      case ts.SyntaxKind.ArrayType:
        return {
          k: TypeKind.Array,
          type: parseType((node as ts.ArrayTypeNode).elementType),
        };
      case ts.SyntaxKind.FunctionType: {
        const functionNode = node as ts.FunctionTypeNode;
        return {
          k: TypeKind.Function,
          params: functionNode.parameters.map(parseParam),
          type: parseType(functionNode.type),
          typeParams: functionNode.typeParameters?.map(p => p.name.text),
        };
      }
      case ts.SyntaxKind.TypeReference: {
        const refNode = node as ts.TypeReferenceNode;
        const name = getNameText(refNode.typeName);
        if (isTypeParam(name)) {
          return {
            k: TypeKind.Param,
            param: name,
          };
        }
        return {
          k: TypeKind.Type,
          name: getNameText(refNode.typeName),
          args: refNode.typeArguments?.map(parseType),
        };
      }
      case ts.SyntaxKind.ExpressionWithTypeArguments: {
        const expressionNode = node as ts.ExpressionWithTypeArguments;
        return {
          k: TypeKind.Type,
          name: getNameText(expressionNode.expression),
          args: expressionNode.typeArguments?.map(parseType),
        };
      }
      case ts.SyntaxKind.TypePredicate:
        return {
          k: TypeKind.Boolean,
        };
      case ts.SyntaxKind.MappedType: {
        const mappedNode = node as ts.MappedTypeNode;
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
              type: parseType(mappedNode.type!),
            },
          ],
        };
      }
    }
    throw new Error('Unknown type kind: ' + ts.SyntaxKind[node.kind]);
  }

  function parseParam(node: ts.ParameterDeclaration) {
    if (node.name.kind !== ts.SyntaxKind.Identifier) {
      throw new Error('NYI: Binding patterns');
    }
    if (!node.type) {
      throw new Error(`Expected parameter ${node.name.text} to have a type`);
    }
    const p: CallParam = {
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

function getLineNum(node: ts.Node) {
  const source = node.getSourceFile();
  return source.getLineAndCharacterOfPosition(node.getStart(source)).line;
}

const COMMENT_NOTE_RX = /^@(\w+)\s*(.*)$/;

const NOTE_BLACKLIST: { [key: string]: boolean } = {
  override: true,
};

function getDoc(node: ts.Node): TypeDoc | undefined {
  const trivia = last(getTrivia(node));
  if (!trivia || trivia.kind !== ts.SyntaxKind.MultiLineCommentTrivia) {
    return;
  }

  const lines = node
    .getSourceFile()
    .text.substring(trivia.pos, trivia.end)
    .split('\n')
    .slice(1, -1)
    .map(l => l.trim().substr(2));

  const paragraphs = lines
    .filter(l => l[0] !== '@')
    .join('\n')
    .split('\n\n');

  const synopsis = paragraphs.shift()!;
  const description = paragraphs.join('\n\n');
  const notes = lines
    .filter(l => l[0] === '@')
    .map(l => l.match(COMMENT_NOTE_RX))
    .filter(<T>(n: T): n is NonNullable<T> => n != null)
    .map(n => ({ name: n[1], body: n[2] }))
    .filter(note => !NOTE_BLACKLIST[note.name]);

  return {
    synopsis,
    description,
    notes,
  };
}

function getNameText(node: ts.Node): string {
  // @ts-expect-error Not included in typed API for some reason.
  return ts.entityNameToString(node);
}

function getTrivia(node: ts.Node): Array<ts.CommentRange> {
  const sourceFile = node.getSourceFile();
  return ts.getLeadingCommentRanges(sourceFile.text, node.pos) || [];
}

function last<T>(list: Array<T>): T {
  return list && list[list.length - 1];
}

function pushIn<
  T,
  K1 extends keyof T,
  A extends NonNullable<T[K1]> & Array<unknown>,
  V extends A[number]
>(obj: T, path: readonly [K1], value: V): V;
function pushIn<
  T,
  K1 extends keyof T,
  K2 extends keyof NonNullable<T[K1]>,
  A extends NonNullable<NonNullable<T[K1]>[K2]> & Array<unknown>,
  V extends A[number]
>(obj: T, path: readonly [K1, K2], value: V): V;
function pushIn<
  T,
  K1 extends keyof T,
  K2 extends keyof NonNullable<T[K1]>,
  K3 extends keyof NonNullable<NonNullable<T[K1]>[K2]>,
  A extends NonNullable<NonNullable<NonNullable<T[K1]>[K2]>[K3]> &
    Array<unknown>,
  V extends A[number]
>(obj: T, path: readonly [K1, K2, K3], value: V): V;
function pushIn(obj: any, path: ReadonlyArray<string | number>, value: any) {
  for (let ii = 0; ii < path.length; ii++) {
    obj = obj[path[ii]] || (obj[path[ii]] = ii === path.length - 1 ? [] : {});
  }
  obj.push(value);
  return value;
}

function setIn<T, K1 extends keyof T>(
  obj: T,
  path: readonly [K1],
  value: T[K1]
): void;
function setIn<T, K1 extends keyof T, K2 extends keyof NonNullable<T[K1]>>(
  obj: T,
  path: readonly [K1, K2],
  value: NonNullable<T[K1]>[K2]
): void;
function setIn<
  T,
  K1 extends keyof T,
  K2 extends keyof NonNullable<T[K1]>,
  K3 extends keyof NonNullable<NonNullable<T[K1]>[K2]>
>(
  obj: T,
  path: readonly [K1, K2, K3],
  value: NonNullable<NonNullable<T[K1]>[K2]>[K3]
): void;
function setIn<
  T,
  K1 extends keyof T,
  K2 extends keyof NonNullable<T[K1]>,
  K3 extends keyof NonNullable<NonNullable<T[K1]>[K2]>,
  K4 extends keyof NonNullable<NonNullable<NonNullable<T[K1]>[K2]>[K3]>
>(
  obj: T,
  path: readonly [K1, K2, K3, K4],
  value: NonNullable<NonNullable<NonNullable<T[K1]>[K2]>[K3]>[K4]
): void;
function setIn(obj: any, path: ReadonlyArray<string | number>, value: any) {
  for (let ii = 0; ii < path.length - 1; ii++) {
    obj = obj[path[ii]] || (obj[path[ii]] = {});
  }
  obj[path[path.length - 1]] = value;
}

function shouldIgnore(comment: TypeDoc | undefined) {
  return Boolean(
    comment &&
      comment.notes &&
      comment.notes.find(
        note => note.name === 'ignore' || note.name === 'deprecated'
      )
  );
}
