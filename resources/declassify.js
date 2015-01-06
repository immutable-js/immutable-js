/**
 *  Copyright (c) 2014, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

var acorn = require('acorn');
var estraverse = require('estraverse');
var MagicString = require('magic-string');

/**
 * ES6 Class transpiler woefully lacking in features. Overwhelming priority to
 * produce the smallest reasonable source code.
 *
 * Clowntown:
 *
 *   * Members are assigned directly to prototype instead of defined as
 *     properties.
 *
 *   * Class Expressions only work when prefixed by an export declaration
 *
 */
function declassify(source) {
  if (!/\bclass\b/.test(source)) {
    return source;
  }

  var body = new MagicString(source);

  var ast = acorn.parse(source, {
    ecmaVersion: 6,
    locations: true
  });

  var needsCreateClass;
  var classInfo;

  estraverse.traverse(ast, {
    enter: function (node) {
      switch (node.type) {
        case 'ExportDeclaration':
          var declaration = node.declaration;
          if (declaration.type === 'ClassExpression' ||
              declaration.type === 'ClassDeclaration') {
            body.insert(
              declaration.start,
              node.default ?
                declaration.id.name + ';' :
              '{' + declaration.id.name + '};'
            );
          }
          break;

        case 'ClassExpression':
        case 'ClassDeclaration':
          var className = node.id.name;

          classInfo = {
            name: className,
            prev: classInfo,
          };

          var classExpr = '';

          var hasSuper = !!node.superClass;
          if (hasSuper) {
            needsCreateClass = true;
            var superExpr = body.slice(node.superClass.start, node.superClass.end);
            classExpr += 'createClass(' + className + ', ' + superExpr + ');';
          }

          var hasConstructor = node.body.body.some(function (method) {
            return method.type === 'MethodDefinition' &&
              method.key.name === 'constructor';
          });
          if (!hasConstructor) {
            classExpr += 'function ' + className + '() {}';
          }

          body.replace(node.start, node.body.start, classExpr);

          // remove { } around class body
          body.remove(node.body.start, node.body.start + 1);
          body.remove(node.body.end - 1, node.body.end);
          break;

        case 'MethodDefinition':
          if (node.key.name === 'constructor') {
            body.replace(
              node.key.start,
              node.key.end,
              'function ' + classInfo.name
            );
          } else {
            var methodName = node.key.name;
            body.replace(
              node.start,
              node.key.end,
              classInfo.name + (node.static ? '.' : '.prototype.') +
                methodName + ' = function'
            );
            body.insert(node.end, ';');
          }
          break;

        case 'CallExpression':
          if (
            (node.callee.type === 'Identifier' && node.callee.name === 'super') ||
            (node.callee.type === 'MemberExpression' && node.callee.object.name === 'super')
          ) {
            throw new Error('super not supported');
          }
          break;
      }
    },
    leave: function(node) {
      switch (node.type) {
        case 'ClassExpression':
        case 'ClassDeclaration':
          classInfo = classInfo.prev;
          break;
      }
    }
  });

  if (needsCreateClass) {
    body.prepend('import createClass from "./utils/createClass"');
  }

  return body.toString();
}

module.exports = declassify;
