describe('Map', function () {

  var obj2 = {};
  for (var ii = 0; ii < 2; ii++) {
    obj2['x' + ii] = ii;
  }

  it('builds from an object of 2', function() {
    Immutable.Map(obj2);
  });

  var obj8 = {};
  for (var ii = 0; ii < 8; ii++) {
    obj8['x' + ii] = ii;
  }

  it('builds from an object of 8', function() {
    Immutable.Map(obj8);
  });

  var obj32 = {};
  for (var ii = 0; ii < 32; ii++) {
    obj32['x' + ii] = ii;
  }

  it('builds from an object of 32', function() {
    Immutable.Map(obj32);
  });

  var obj1024 = {};
  for (var ii = 0; ii < 1024; ii++) {
    obj1024['x' + ii] = ii;
  }

  it('builds from an object of 1024', function() {
    Immutable.Map(obj1024);
  });

});
