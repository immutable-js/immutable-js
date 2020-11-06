/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

describe('Map', function () {
  describe('builds from an object', function () {
    var obj2 = {};
    for (var ii = 0; ii < 2; ii++) {
      obj2['x' + ii] = ii;
    }

    it('of 2', function () {
      Immutable.Map(obj2);
    });

    var obj8 = {};
    for (var ii = 0; ii < 8; ii++) {
      obj8['x' + ii] = ii;
    }

    it('of 8', function () {
      Immutable.Map(obj8);
    });

    var obj32 = {};
    for (var ii = 0; ii < 32; ii++) {
      obj32['x' + ii] = ii;
    }

    it('of 32', function () {
      Immutable.Map(obj32);
    });

    var obj1024 = {};
    for (var ii = 0; ii < 1024; ii++) {
      obj1024['x' + ii] = ii;
    }

    it('of 1024', function () {
      Immutable.Map(obj1024);
    });
  });

  describe('builds from an array', function () {
    var array2 = [];
    for (var ii = 0; ii < 2; ii++) {
      array2[ii] = ['x' + ii, ii];
    }

    it('of 2', function () {
      Immutable.Map(array2);
    });

    var array8 = [];
    for (var ii = 0; ii < 8; ii++) {
      array8[ii] = ['x' + ii, ii];
    }

    it('of 8', function () {
      Immutable.Map(array8);
    });

    var array32 = [];
    for (var ii = 0; ii < 32; ii++) {
      array32[ii] = ['x' + ii, ii];
    }

    it('of 32', function () {
      Immutable.Map(array32);
    });

    var array1024 = [];
    for (var ii = 0; ii < 1024; ii++) {
      array1024[ii] = ['x' + ii, ii];
    }

    it('of 1024', function () {
      Immutable.Map(array1024);
    });
  });

  describe('builds from a List', function () {
    var list2 = Immutable.List().asMutable();
    for (var ii = 0; ii < 2; ii++) {
      list2 = list2.push(Immutable.List(['x' + ii, ii]));
    }
    list2 = list2.asImmutable();

    it('of 2', function () {
      Immutable.Map(list2);
    });

    var list8 = Immutable.List().asMutable();
    for (var ii = 0; ii < 8; ii++) {
      list8 = list8.push(Immutable.List(['x' + ii, ii]));
    }
    list8 = list8.asImmutable();

    it('of 8', function () {
      Immutable.Map(list8);
    });

    var list32 = Immutable.List().asMutable();
    for (var ii = 0; ii < 32; ii++) {
      list32 = list32.push(Immutable.List(['x' + ii, ii]));
    }
    list32 = list32.asImmutable();

    it('of 32', function () {
      Immutable.Map(list32);
    });

    var list1024 = Immutable.List().asMutable();
    for (var ii = 0; ii < 1024; ii++) {
      list1024 = list1024.push(Immutable.List(['x' + ii, ii]));
    }
    list1024 = list1024.asImmutable();

    it('of 1024', function () {
      Immutable.Map(list1024);
    });
  });

  describe('merge a map', () => {
    [2, 8, 32, 1024].forEach((size) => {
      const obj1 = {};
      const obj2 = {};
      for (let ii = 0; ii < size; ii++) {
        obj1['k' + ii] = '1_' + ii;
        obj2['k' + ii] = '2_' + ii;
      }

      const map1 = Immutable.Map(obj1);
      const map2 = Immutable.Map(obj2);

      it('of ' + size, () => {
        map1.merge(map2);
      });
    });
  });
});
