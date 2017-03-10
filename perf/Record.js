describe('Record', () => {

  describe('builds from an object', () => {

    [2,5,10,100,1000].forEach(size => {

      var defaults = {};
      var values = {};
      for (var ii = 0; ii < size; ii++) {
        defaults['x' + ii] = null;
        values['x' + ii] = ii;
      }

      var Rec = Immutable.Record(defaults);

      it('of ' + size, () => {
        Rec(values);
      });

    });

  });

  describe('update random using set()', () => {

    [2,5,10,100,1000].forEach(size => {

      var defaults = {};
      var values = {};
      for (var ii = 0; ii < size; ii++) {
        defaults['x' + ii] = null;
        values['x' + ii] = ii;
      }

      var Rec = Immutable.Record(defaults);
      var rec = Rec(values);

      var key = 'x' + Math.floor(size / 2);

      it('of ' + size, () => {
        rec.set(key, 999);
      });

    });

  });

  describe('access random using get()', () => {

    [2,5,10,100,1000].forEach(size => {

      var defaults = {};
      var values = {};
      for (var ii = 0; ii < size; ii++) {
        defaults['x' + ii] = null;
        values['x' + ii] = ii;
      }

      var Rec = Immutable.Record(defaults);
      var rec = Rec(values);

      var key = 'x' + Math.floor(size / 2);

      it('of ' + size, () => {
        rec.get(key);
      });

    });

  });

  describe('access random using property', () => {

    [2,5,10,100,1000].forEach(size => {

      var defaults = {};
      var values = {};
      for (var ii = 0; ii < size; ii++) {
        defaults['x' + ii] = null;
        values['x' + ii] = ii;
      }

      var Rec = Immutable.Record(defaults);
      var rec = Rec(values);

      var key = 'x' + Math.floor(size / 2);

      it('of ' + size, () => {
        rec[key];
      });

    });

  });

});
