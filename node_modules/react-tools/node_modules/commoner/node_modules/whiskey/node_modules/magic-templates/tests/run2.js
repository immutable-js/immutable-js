/*
 Test for http://github.com/skid/strobe-templates/issues#issue/1
 */

var util = require('util');
var path = require('path');
var assert = require('assert');

var T = require('../index')

T.setTemplatesDir( __dirname );

var template = new T.Template(path.join('test.html'));

function do_render() {
  template.load(function (err, template) {
    if (err) {
      util.log(err);
      return;
    }

    template.render({}, function (err, rendered_template) {
      if (err) {
        util.log(err);
        return;
      }

      after_render(rendered_template);
      return;
    })
  })
}

var i = 0;
var rendered_template_length, new_length;
function after_render(rendered_template) {
  if (i < 5) {
    new_length = rendered_template.length;

    if (i == 0) {
      rendered_template_length = new_length;
    }

    assert.equal(new_length, rendered_template_length,
    'Rendered template length after call #' + i +
    ' is not the same as the after the first call');

    util.log(rendered_template);
    do_render();
    i++;
  }
}

do_render();
