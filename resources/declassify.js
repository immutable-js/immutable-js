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
 */
function declassify(source) {
  if (!/\bclass\b/.test(source)) {
    return source;
  }

  var body = new MagicString(source);

  body.prepend('import createClass from "./utils/createClass"');

  var ast = acorn.parse(source, {
    ecmaVersion: 6,
    locations: true
  });

  var classInfo;

  estraverse.traverse(ast, {
    enter: function (node) {
      switch (node.type) {
        case 'ClassExpression':
        case 'ClassDeclaration':
          var className = node.id.name;

          classInfo = {
            name: className,
            prev: classInfo,
          };

          var constructor = node.body.body.filter(function (method) {
            return method.type === 'MethodDefinition' &&
              method.key.name === 'constructor';
          })[0];

          var constructorBody =
            constructor ?
              body.slice(constructor.value.start, constructor.value.end) :
              '() {}';

          var constructorSrc = 'function ' + className + constructorBody;

          var superClassExpr = node.superClass &&
            body.slice(node.superClass.start, node.superClass.end);

          var classSrc = 'createClass('+className+ (
            superClassExpr ? ', ' + superClassExpr : ''
          ) + ');';

          body.replace(
            node.start,
            node.body.start,
            constructorSrc + '\n' + classSrc
          );
          body.remove(node.body.start, node.body.start + 1);
          body.remove(node.body.end - 1, node.body.end);
          break;

        case 'MethodDefinition':
          if (node.key.name === 'constructor') {
            body.remove(node.start, node.end);
          } else {
            var methodName = node.key.name;
            body.replace(node.start, node.key.end,
              classInfo.name +
                (node.static ? '.' : '.prototype.') + methodName + ' = function'
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

  return body.toString();
}

module.exports = declassify;
