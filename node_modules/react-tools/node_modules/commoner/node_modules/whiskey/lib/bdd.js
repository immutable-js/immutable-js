/*
 * Licensed to Cloudkick, Inc ('Cloudkick') under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * Cloudkick licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var sprintf = require('sprintf').sprintf;

function Expect(actual) {
  this._actual = actual;
}

/** 
 * @param {Object} imports The foreign exports object to add bdd tests to
 * @returns {Object} bdd A collection of test functions
 */
exports.init = function(imports) {
  var bdd = {
    '_suiteSetup': function() {}
  };

  /** @param {Function} setup function to call before each suite */
  bdd.beforeEach = function(setup) {
    bdd._suiteSetup = setup;
  };

  /** @description creates a test suite
   * @param {string} title
   * @param {Function} suite
   */
  bdd.describe = function(title, suite) {

    /** @description it() is the equivalent of a exports['test blah'] in the whiskey idiom.
     * This function, when called, adds a whiskey test to the imports object.
     * @param {string} name
     * @param {Function} spec(expect, callback)
     */
    function it(name, spec) {
      var whiskeyName = sprintf("test %s %s", title, name);

      function expect(actual) {
        return new Expect(actual);
      }

      /** @description Re-binds the Expect test methods using the newly-injected assert.
       * @param {object} test the test object injected by whiskey
       * @param {object} assert the assert object injected by whiskey
       */
      imports[whiskeyName] = function(test, assert) {

        // make the whiskey test and assert objects available to bdd tests
        bdd.test = test;
        bdd.assert = assert;

        /** @description maps an assert method to a bdd matcher
         * @param {string} assertion the name of a whiskey assert method
         * @param {string} bddName the name of the equivalent expect method
         */
        function translateMatcher(assertion, bddName) {
          Expect.prototype[bddName] = function() {
            assert[assertion].bind(this, this._actual).apply(this, arguments);
          }
        }

        // This must be done each time a test is created,
        // as test and assert are injected in each test function.
        translateMatcher('equal', 'toEqual');
        translateMatcher('isNull', 'toBeNull');
        translateMatcher('isDefined', 'toBeDefined');
        translateMatcher('isUndefined', 'toBeUndefined');
        translateMatcher('match', 'toMatch');

        spec(expect, test.finish);
        if (spec.length === 1) {
          // if spec isn't expecting test.finish as an async callback, call it directly
          test.finish();
        }
      }
    }

    bdd._suiteSetup();
    suite(it);
  };

  return bdd;
}
