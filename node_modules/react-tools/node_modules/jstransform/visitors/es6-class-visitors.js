/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*jslint node:true*/

/**
 * @typechecks
 */
'use strict';

var base62 = require('base62');
var Syntax = require('esprima-fb').Syntax;
var utils = require('../src/utils');

var SUPER_PROTO_IDENT_PREFIX = '____SuperProtoOf';

var _anonClassUUIDCounter = 0;
var _mungedSymbolMaps = {};

/**
 * Used to generate a unique class for use with code-gens for anonymous class
 * expressions.
 *
 * @param {object} state
 * @return {string}
 */
function _generateAnonymousClassName(state) {
  var mungeNamespace = state.mungeNamespace || '';
  return '____Class' + mungeNamespace + base62.encode(_anonClassUUIDCounter++);
}

/**
 * Given an identifier name, munge it using the current state's mungeNamespace.
 *
 * @param {string} identName
 * @param {object} state
 * @return {string}
 */
function _getMungedName(identName, state) {
  var mungeNamespace = state.mungeNamespace;
  var shouldMinify = state.g.opts.minify;

  if (shouldMinify) {
    if (!_mungedSymbolMaps[mungeNamespace]) {
      _mungedSymbolMaps[mungeNamespace] = {
        symbolMap: {},
        identUUIDCounter: 0
      };
    }

    var symbolMap = _mungedSymbolMaps[mungeNamespace].symbolMap;
    if (!symbolMap[identName]) {
      symbolMap[identName] =
        base62.encode(_mungedSymbolMaps[mungeNamespace].identUUIDCounter++);
    }
    identName = symbolMap[identName];
  }
  return '$' + mungeNamespace + identName;
}

/**
 * Extracts super class information from a class node.
 *
 * Information includes name of the super class and/or the expression string
 * (if extending from an expression)
 *
 * @param {object} node
 * @param {object} state
 * @return {object}
 */
function _getSuperClassInfo(node, state) {
  var ret = {
    name: null,
    expression: null
  };
  if (node.superClass) {
    if (node.superClass.type === Syntax.Identifier) {
      ret.name = node.superClass.name;
    } else {
      // Extension from an expression
      ret.name = _generateAnonymousClassName(state);
      ret.expression = state.g.source.substring(
        node.superClass.range[0],
        node.superClass.range[1]
      );
    }
  }
  return ret;
}

/**
 * Used with .filter() to find the constructor method in a list of
 * MethodDefinition nodes.
 *
 * @param {object} classElement
 * @return {boolean}
 */
function _isConstructorMethod(classElement) {
  return classElement.type === Syntax.MethodDefinition &&
         classElement.key.type === Syntax.Identifier &&
         classElement.key.name === 'constructor';
}

/**
 * @param {object} node
 * @param {object} state
 * @return {boolean}
 */
function _shouldMungeIdentifier(node, state) {
  return (
    !!state.methodFuncNode &&
    !utils.getDocblock(state).hasOwnProperty('preventMunge') &&
    /^_(?!_)/.test(node.name)
  );
}

/**
 * @param {function} traverse
 * @param {object} node
 * @param {array} path
 * @param {object} state
 */
function visitClassMethod(traverse, node, path, state) {
  utils.catchup(node.range[0], state);
  path.unshift(node);
  traverse(node.value, path, state);
  path.shift();
  return false;
}
visitClassMethod.test = function(node, path, state) {
  return node.type === Syntax.MethodDefinition;
};

/**
 * @param {function} traverse
 * @param {object} node
 * @param {array} path
 * @param {object} state
 */
function visitClassFunctionExpression(traverse, node, path, state) {
  var methodNode = path[0];

  state = utils.updateState(state, {
    methodFuncNode: node
  });

  if (methodNode.key.name === 'constructor') {
    utils.append('function ' + state.className, state);
  } else {
    var methodName = methodNode.key.name;
    if (_shouldMungeIdentifier(methodNode.key, state)) {
      methodName = _getMungedName(methodName, state);
    }

    var prototypeOrStatic = methodNode.static ? '' : 'prototype.';
    utils.append(
      state.className + '.' + prototypeOrStatic + methodName + '=function',
      state
    );
  }
  utils.move(methodNode.key.range[1], state);

  var params = node.params;
  var paramName;
  if (params.length > 0) {
    for (var i = 0; i < params.length; i++) {
      utils.catchup(node.params[i].range[0], state);
      paramName = params[i].name;
      if (_shouldMungeIdentifier(params[i], state)) {
        paramName = _getMungedName(params[i].name, state);
      }
      utils.append(paramName, state);
      utils.move(params[i].range[1], state);
    }
  } else {
    utils.append('(', state);
  }
  utils.append(')', state);
  utils.catchupWhiteSpace(node.body.range[0], state);
  utils.append('{', state);
  if (!state.scopeIsStrict) {
    utils.append('"use strict";', state);
  }
  utils.move(node.body.range[0] + '{'.length, state);

  path.unshift(node);
  traverse(node.body, path, state);
  path.shift();
  utils.catchup(node.body.range[1], state);

  if (methodNode.key.name !== 'constructor') {
    utils.append(';', state);
  }
  return false;
}
visitClassFunctionExpression.test = function(node, path, state) {
  return node.type === Syntax.FunctionExpression
         && path[0].type === Syntax.MethodDefinition;
};

/**
 * @param {function} traverse
 * @param {object} node
 * @param {array} path
 * @param {object} state
 */
function _renderClassBody(traverse, node, path, state) {
  var className = state.className;
  var superClass = state.superClass;

  // Set up prototype of constructor on same line as `extends` for line-number
  // preservation. This relies on function-hoisting if a constructor function is
  // defined in the class body.
  if (superClass.name) {
    // If the super class is an expression, we need to memoize the output of the
    // expression into the generated class name variable and use that to refer
    // to the super class going forward. Example:
    //
    //   class Foo extends mixin(Bar, Baz) {}
    //     --transforms to--
    //   function Foo() {} var ____Class0Blah = mixin(Bar, Baz);
    if (superClass.expression !== null) {
      utils.append(
        'var ' + superClass.name + '=' + superClass.expression + ';',
        state
      );
    }

    var keyName = superClass.name + '____Key';
    var keyNameDeclarator = '';
    if (!utils.identWithinLexicalScope(keyName, state)) {
      keyNameDeclarator = 'var ';
      utils.declareIdentInLocalScope(keyName, state);
    }
    utils.append(
      'for(' + keyNameDeclarator + keyName + ' in ' + superClass.name + '){' +
        'if(' + superClass.name + '.hasOwnProperty(' + keyName + ')){' +
          className + '[' + keyName + ']=' +
            superClass.name + '[' + keyName + '];' +
        '}' +
      '}',
      state
    );

    var superProtoIdentStr = SUPER_PROTO_IDENT_PREFIX + superClass.name;
    if (!utils.identWithinLexicalScope(superProtoIdentStr, state)) {
      utils.append(
        'var ' + superProtoIdentStr + '=' + superClass.name + '===null?' +
        'null:' + superClass.name + '.prototype;',
        state
      );
      utils.declareIdentInLocalScope(superProtoIdentStr, state);
    }

    utils.append(
      className + '.prototype=Object.create(' + superProtoIdentStr + ');',
      state
    );
    utils.append(
      className + '.prototype.constructor=' + className + ';',
      state
    );
    utils.append(
      className + '.__superConstructor__=' + superClass.name + ';',
      state
    );
  }

  // If there's no constructor method specified in the class body, create an
  // empty constructor function at the top (same line as the class keyword)
  if (!node.body.body.filter(_isConstructorMethod).pop()) {
    utils.append('function ' + className + '(){', state);
    if (!state.scopeIsStrict) {
      utils.append('"use strict";', state);
    }
    if (superClass.name) {
      utils.append(
        'if(' + superClass.name + '!==null){' +
        superClass.name + '.apply(this,arguments);}',
        state
      );
    }
    utils.append('}', state);
  }

  utils.move(node.body.range[0] + '{'.length, state);
  traverse(node.body, path, state);
  utils.catchupWhiteSpace(node.range[1], state);
}

/**
 * @param {function} traverse
 * @param {object} node
 * @param {array} path
 * @param {object} state
 */
function visitClassDeclaration(traverse, node, path, state) {
  var className = node.id.name;
  var superClass = _getSuperClassInfo(node, state);

  state = utils.updateState(state, {
    mungeNamespace: className,
    className: className,
    superClass: superClass
  });

  _renderClassBody(traverse, node, path, state);

  return false;
}
visitClassDeclaration.test = function(node, path, state) {
  return node.type === Syntax.ClassDeclaration;
};

/**
 * @param {function} traverse
 * @param {object} node
 * @param {array} path
 * @param {object} state
 */
function visitClassExpression(traverse, node, path, state) {
  var className = node.id && node.id.name || _generateAnonymousClassName(state);
  var superClass = _getSuperClassInfo(node, state);

  utils.append('(function(){', state);

  state = utils.updateState(state, {
    mungeNamespace: className,
    className: className,
    superClass: superClass
  });

  _renderClassBody(traverse, node, path, state);

  utils.append('return ' + className + ';})()', state);
  return false;
}
visitClassExpression.test = function(node, path, state) {
  return node.type === Syntax.ClassExpression;
};

/**
 * @param {function} traverse
 * @param {object} node
 * @param {array} path
 * @param {object} state
 */
function visitPrivateIdentifier(traverse, node, path, state) {
  utils.append(_getMungedName(node.name, state), state);
  utils.move(node.range[1], state);
}
visitPrivateIdentifier.test = function(node, path, state) {
  if (node.type === Syntax.Identifier && _shouldMungeIdentifier(node, state)) {
    // Always munge non-computed properties of MemberExpressions
    // (a la preventing access of properties of unowned objects)
    if (path[0].type === Syntax.MemberExpression && path[0].object !== node
        && path[0].computed === false) {
      return true;
    }

    // Always munge identifiers that were declared within the method function
    // scope
    if (utils.identWithinLexicalScope(node.name, state, state.methodFuncNode)) {
      return true;
    }

    // Always munge private keys on object literals defined within a method's
    // scope.
    if (path[0].type === Syntax.Property
        && path[1].type === Syntax.ObjectExpression) {
      return true;
    }

    // Always munge function parameters
    if (path[0].type === Syntax.FunctionExpression
        || path[0].type === Syntax.FunctionDeclaration) {
      for (var i = 0; i < path[0].params.length; i++) {
        if (path[0].params[i] === node) {
          return true;
        }
      }
    }
  }
  return false;
};

/**
 * @param {function} traverse
 * @param {object} node
 * @param {array} path
 * @param {object} state
 */
function visitSuperCallExpression(traverse, node, path, state) {
  var superClassName = state.superClass.name;

  if (node.callee.type === Syntax.Identifier) {
    utils.append(superClassName + '.call(', state);
    utils.move(node.callee.range[1], state);
  } else if (node.callee.type === Syntax.MemberExpression) {
    utils.append(SUPER_PROTO_IDENT_PREFIX + superClassName, state);
    utils.move(node.callee.object.range[1], state);

    if (node.callee.computed) {
      // ["a" + "b"]
      utils.catchup(node.callee.property.range[1] + ']'.length, state);
    } else {
      // .ab
      utils.append('.' + node.callee.property.name, state);
    }

    utils.append('.call(', state);
    utils.move(node.callee.range[1], state);
  }

  utils.append('this', state);
  if (node.arguments.length > 0) {
    utils.append(',', state);
    utils.catchupWhiteSpace(node.arguments[0].range[0], state);
    traverse(node.arguments, path, state);
  }

  utils.catchupWhiteSpace(node.range[1], state);
  utils.append(')', state);
  return false;
}
visitSuperCallExpression.test = function(node, path, state) {
  if (state.superClass && node.type === Syntax.CallExpression) {
    var callee = node.callee;
    if (callee.type === Syntax.Identifier && callee.name === 'super'
        || callee.type == Syntax.MemberExpression
           && callee.object.name === 'super') {
      return true;
    }
  }
  return false;
};

/**
 * @param {function} traverse
 * @param {object} node
 * @param {array} path
 * @param {object} state
 */
function visitSuperMemberExpression(traverse, node, path, state) {
  var superClassName = state.superClass.name;

  utils.append(SUPER_PROTO_IDENT_PREFIX + superClassName, state);
  utils.move(node.object.range[1], state);
}
visitSuperMemberExpression.test = function(node, path, state) {
  return state.superClass
         && node.type === Syntax.MemberExpression
         && node.object.type === Syntax.Identifier
         && node.object.name === 'super';
};

exports.visitorList = [
  visitClassDeclaration,
  visitClassExpression,
  visitClassFunctionExpression,
  visitClassMethod,
  visitPrivateIdentifier,
  visitSuperCallExpression,
  visitSuperMemberExpression
];
