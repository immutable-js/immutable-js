/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

describe('Set', function () {
  describe('maps with changes', function () {
    var array2 = [];
    for (var i = 0; i < 2; i++) {
      array2[i] = i;
    }
    var set2 = Immutable.Set(array2);

    it('of 2', function () {
      set2.map(value => value + 1);
    });

    var array8 = [];
    for (var i = 0; i < 8; i++) {
      array8[i] = i;
    }
    var set8 = Immutable.Set(array8);

    it('of 8', function () {
      set8.map(value => value + 1);
    });

    var array32 = [];
    for (var i = 0; i < 32; i++) {
      array32[i] = i;
    }
    var set32 = Immutable.Set(array32);

    it('of 32', function () {
      set32.map(value => value + 1);
    });

    var array1024 = [];
    for (var i = 0; i < 1024; i++) {
      array1024[i] = i;
    }
    var set1024 = Immutable.Set(array1024);

    it('of 1024', function () {
      set1024.map(value => value + 1);
    });
  });

  describe('maps without changes', function () {
    var array2 = [];
    for (var i = 0; i < 2; i++) {
      array2[i] = i;
    }
    var set2 = Immutable.Set(array2);

    it('of 2', function () {
      set2.map(value => value);
    });

    var array8 = [];
    for (var i = 0; i < 8; i++) {
      array8[i] = i;
    }
    var set8 = Immutable.Set(array8);

    it('of 8', function () {
      set8.map(value => value);
    });

    var array32 = [];
    for (var i = 0; i < 32; i++) {
      array32[i] = i;
    }
    var set32 = Immutable.Set(array32);

    it('of 32', function () {
      set32.map(value => value);
    });

    var array1024 = [];
    for (var i = 0; i < 1024; i++) {
      array1024[i] = i;
    }
    var set1024 = Immutable.Set(array1024);

    it('of 1024', function () {
      set1024.map(value => value);
    });
  });
});
