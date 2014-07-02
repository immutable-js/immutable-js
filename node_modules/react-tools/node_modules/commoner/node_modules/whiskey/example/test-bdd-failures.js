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

var bdd = require('../lib/bdd').init(exports);
var describe = bdd.describe;

describe('the bdd expect()', function(it) {

  it('correctly fails toBeNull()', function(expect) {
    expect("not null").toBeNull();
  });

  it('correctly fails toBeDefined()', function(expect) {
    expect(undefined).toBeDefined();
  });

  it('correctly fails toBeUndefined()', function(expect) {
    expect(true).toBeUndefined();
  });

  it('correctly fails toMatch()', function(expect) {
    expect('fish').toMatch(/not a fish/);
  });
  
});
