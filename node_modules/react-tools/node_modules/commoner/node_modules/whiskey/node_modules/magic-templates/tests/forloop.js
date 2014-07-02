var T    = require('../index')
  , util  = require('util')
  , path = require('path');

T.setTemplatesDir(__dirname);
T.setDebug(true);

var template = new T.Template(path.join('test_forloop.html'));
var context = {
  array: [ 'item1', 'item2', 'item3' ],
  obj: {'prop1': 'val1', 'prop2': 'val2', 'prop3': 'val3' },
  str: 'foobar'
}

util.puts('Forloop test: \n');

template.load(function(err, template) {
  template.render(context, function (err, rendered_template) {
    util.puts(rendered_template.join(''));
  });
});
