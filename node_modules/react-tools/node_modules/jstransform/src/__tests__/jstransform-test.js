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
 *
 * @emails jeffmo@fb.com javascript@lists.facebook.com
 */

require('mock-modules').autoMockOff();

describe('jstransform', function() {
  var transformFn;
  var Syntax = require('esprima-fb').Syntax;

  beforeEach(function() {
    require('mock-modules').dumpCache();
    transformFn = require('../jstransform').transform;
  });

  function _runVisitor(source, nodeCount, visitor) {
    var actualVisitationCount = 0;
    function shimVisitor(traverse, node, path, state) {
      actualVisitationCount++;
      return visitor(traverse, node, path, state);
    }
    shimVisitor.test = visitor.test;
    transformFn([shimVisitor], source);
    expect(actualVisitationCount).toBe(nodeCount);
  }

  function testScopeBoundary(source, localIdents, nodeCount, visitorTest) {
    function visitor(traverse, node, path, state) {
      var actualLocalIdents = Object.keys(state.localScope.identifiers);
      expect(actualLocalIdents.sort()).toEqual(localIdents.sort());
    }
    visitor.test = visitorTest;
    _runVisitor(source, nodeCount, visitor);
  }

  function testParentScope(source, parentIdents, nodeCount, visitorTest) {
    function visitor(traverse, node, path, state) {
      parentIdents = parentIdents && parentIdents.sort();
      var parentScope = state.localScope.parentScope;
      var actualParentIdents =
        parentScope && Object.keys(parentScope.identifiers).sort();
      expect(actualParentIdents).toEqual(parentIdents);
    }
    visitor.test = visitorTest;
    _runVisitor(source, nodeCount, visitor);
  }

  describe('closure scope boundaries', function() {
    it('creates a scope boundary around Program scope', function() {
      var source =
        'var foo;' +
        'var bar, baz;' +
        'function blah() {}';
      var idents = ['foo', 'bar', 'baz', 'blah'];

      testScopeBoundary(source, idents, 3, function(node, path, state) {
        return path[0] && path[0].type === Syntax.Program;
      });
    });

    it('creates a scope boundary around FunctionDeclarations', function() {
      var source  =
        'var foo;' +
        'function blah() {' +
        '  var bar;' +
        '  function nested() {' +
        '    var baz;' +
        '  }' +
        '}';
      var programIdents = ['foo', 'blah'];
      var blahIdents = ['arguments', 'bar', 'nested'];
      var nestedIdents = ['arguments', 'baz'];

      testScopeBoundary(source, programIdents, 2, function(node, path, state) {
        return path[0] && path[0].type === Syntax.Program;
      });

      testScopeBoundary(source, blahIdents, 2, function(node, path, state) {
        // All direct children of blah()
        return path[0] && path[0].type === Syntax.BlockStatement &&
               path[1] && path[1].type === Syntax.FunctionDeclaration &&
               path[1].id.name === 'blah';
      });

      testScopeBoundary(source, nestedIdents, 1, function(node, path, state) {
        // All direct children of nested()
        return path[0] && path[0].type === Syntax.BlockStatement &&
               path[1] && path[1].type === Syntax.FunctionDeclaration &&
               path[1].id.name === 'nested';
      });
    });

    it('creates a scope boundary around MethodDefinitions', function() {
      var source =
        'var foo;' +
        'class ClassA {' +
        '  blah() {' +
        '    var bar;' +
        '  }' +
        '  another() {' +
        '    var baz;' +
        '  }' +
        '}';
      var programIdents = ['foo', 'ClassA'];
      var blahIdents = ['arguments', 'bar'];
      var anotherIdents = ['arguments', 'baz'];

      testScopeBoundary(source, programIdents, 2, function(node, path, state) {
        return path[0] && path[0].type === Syntax.Program;
      });

      testScopeBoundary(source, blahIdents, 1, function(node, path, state) {
        // All direct children of blah()
        return path[0] && path[0].type === Syntax.BlockStatement &&
               path[1] && path[1].type === Syntax.FunctionExpression &&
               path[2] && path[2].type === Syntax.MethodDefinition &&
               path[2].key.name === 'blah';
      });

      testScopeBoundary(source, anotherIdents, 1, function(node, path, state) {
        // All direct children of another()
        return path[0] && path[0].type === Syntax.BlockStatement &&
               path[1] && path[1].type === Syntax.FunctionExpression &&
               path[2] && path[2].type === Syntax.MethodDefinition &&
               path[2].key.name === 'another';
      });
    });

    it('uses VariableDeclarations to determine scope boundary', function() {
      var source =
        'var foo = 1;' +
        'function bar() {' +
        '  foo++;' +
        '  function baz() {' +
        '    var foo = 2;' +
        '  }' +
        '}';
      var programIdents = ['foo', 'bar'];
      var barIdents = ['arguments', 'baz'];
      var bazIdents = ['arguments', 'foo'];

      testScopeBoundary(source, programIdents, 2, function(node, path, state) {
        return path[0] && path[0].type === Syntax.Program;
      });

      testScopeBoundary(source, barIdents, 2, function(node, path, state) {
        // All direct children of blah()
        return path[0] && path[0].type === Syntax.BlockStatement &&
               path[1] && path[1].type === Syntax.FunctionDeclaration &&
               path[1].id.name === 'bar';
      });

      testScopeBoundary(source, bazIdents, 1, function(node, path, state) {
        // All direct children of baz()
        return path[0] && path[0].type === Syntax.BlockStatement &&
               path[1] && path[1].type === Syntax.FunctionDeclaration &&
               path[1].id.name === 'baz';
      });
    });

    it('includes function args in functions scope boundary', function() {
      var source =
        'var foo;' +
        'function blah(bar) {' +
        '  var baz;' +
        '}';
      var programIdents = ['foo', 'blah'];
      var blahIdents = ['arguments', 'bar', 'baz'];

      testScopeBoundary(source, programIdents, 2, function(node, path, state) {
        return path[0] && path[0].type === Syntax.Program;
      });

      testScopeBoundary(source, blahIdents, 1, function(node, path, state) {
        // All direct children of blah()
        return path[0] && path[0].type === Syntax.BlockStatement &&
               path[1] && path[1].type === Syntax.FunctionDeclaration &&
               path[1].id.name === 'blah';
      });
    });

    it('puts FunctionExpression names within function scope', function() {
      var source =
        'var foo;' +
        'var bar = function baz() {' +
        '  var blah;' +
        '};';
      var programIdents = ['foo', 'bar'];
      var bazIdents = ['arguments', 'baz', 'blah'];

      testScopeBoundary(source, programIdents, 2, function(node, path, state) {
        return path[0] && path[0].type === Syntax.Program;
      });

      testScopeBoundary(source, bazIdents, 1, function(node, path, state) {
        // All direct children of baz()
        return path[0] && path[0].type === Syntax.BlockStatement &&
               path[1] && path[1].type === Syntax.FunctionExpression &&
               path[1].id.name === 'baz';
      });
    });
  });

  describe('block scope boundaries', function() {
    it('creates a scope boundary around CatchClauses with params', function() {
      var source =
        'var blah = 0;' +
        'try {' +
        '} catch (e) {' +
        '  blah++;' +
        '}';
      var programIdents = ['blah'];
      var catchIdents = ['e'];

      testScopeBoundary(source, programIdents, 2, function(node, path, state) {
        return path[0] && path[0].type === Syntax.Program;
      });

      testScopeBoundary(source, catchIdents, 1, function(node, path, state) {
        // All direct children of catch(e) block
        return path[0] && path[0].type === Syntax.BlockStatement &&
               path[1] && path[1].type === Syntax.CatchClause;
      });
    });

    it('includes vars defined in CatchClauses in the parent scope', function() {
      var source =
        'try {' +
        '} catch (e) {' +
        '  var blah;' +
        '}';
      var programIdents = ['blah'];
      var catchIdents = ['e'];

      testScopeBoundary(source, programIdents, 1, function(node, path, state) {
        return path[0] && path[0].type === Syntax.Program;
      });

      testScopeBoundary(source, catchIdents, 1, function(node, path, state) {
        // All direct children of catch(e) block
        return path[0] && path[0].type === Syntax.BlockStatement &&
               path[1] && path[1].type === Syntax.CatchClause;
      });
    });
  });

  describe('scope chain linking', function() {
    it('links parent scope boundaries', function() {
      var source =
        'var foo;' +
        'function blah() {' +
        '  var bar;' +
        '  function nested() {' +
        '    var baz;' +
        '  }' +
        '}';
      var programIdents = ['foo', 'blah'];
      var blahIdents = ['arguments', 'bar', 'nested'];

      testParentScope(source, programIdents, 2, function(node, path, state) {
        // All direct children of blah()
        return path[0] && path[0].type === Syntax.BlockStatement &&
               path[1] && path[1].type === Syntax.FunctionDeclaration &&
               path[1].id.name === 'blah';
      });

      testParentScope(source, blahIdents, 1, function(node, path, state) {
        // All direct children of nested()
        return path[0] && path[0].type === Syntax.BlockStatement &&
               path[1] && path[1].type === Syntax.FunctionDeclaration &&
               path[1].id.name === 'nested';
      });
    });

    it('nests MethodDefinition boundaries under parent scope', function() {
      var source =
        'var foo;' +
        'class ClassA {' +
        '  blah() {' +
        '    var bar;' +
        '  }' +
        '}';
      var programIdents = ['foo', 'ClassA'];

      testParentScope(source, programIdents, 1, function(node, path, state) {
        // All direct children of blah()
        return path[0] && path[0].type === Syntax.BlockStatement &&
               path[1] && path[1].type === Syntax.FunctionExpression &&
               path[2] && path[2].type === Syntax.MethodDefinition &&
               path[2].key.name === 'blah';
      });
    });
  });

  describe('"use strict" tracking', function() {
    function testStrictness(expectedStrict, source) {
      var visitedNodes = 0;
      function visitor(traverse, node, path, state) {
        visitedNodes++;
        expect(state.scopeIsStrict).toBe(expectedStrict);
      }
      visitor.test = function(node, path, state) {
        return node.type === Syntax.Literal
               && node.value === 'testStr';
      };
      transformFn([visitor], source);
      expect(visitedNodes).toBe(1);
    }

    it('detects program-level strictness', function() {
      testStrictness(false, '"testStr";');
      testStrictness(true, '"use strict"; "testStr";');
    });

    it('detects non-inherited strictness', function() {
      testStrictness(true, [
        'function foo() {',
        '  "use strict";',
        '  "testStr";',
        '}'
      ].join('\n'));
    });

    it('detects program-inherited strictness', function() {
      testStrictness(true, [
        '"use strict";',
        'function foo() {',
        '  "testStr";',
        '}'
      ].join('\n'));
    });

    it('detects function-inherited strictness', function() {
      testStrictness(true, [
        'function foo() {',
        '  "use strict";',
        '  function bar() {',
        '    "testStr";',
        '  }',
        '}'
      ].join('\n'));
    });

    it('does not detect sibling strictness', function() {
      testStrictness(false, [
        'function foo() {',
        '  "use strict";',
        '}',
        'function bar() {',
        '  "testStr";',
        '}'
      ].join('\n'));
    });
  });
});
