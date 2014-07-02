Magic templates
===============

Templating framework for NodeJS inspired by Django templates.

Note: This is a [strobe-templates](https://github.com/skid/strobe-templates)
fork with some additional features and bug fixes.

For now, Strobe Templates have the following template tags:

    {% for x in y %}{% endfor %}
    {% if x %}{% else if y %}{% else %}{% endif %}
    {% extends template_name %}
    {% include template_name %}
    {% block block_name %}

You can define your own template tags in the "tags.js" module. Template inheritance is done in the same way as Django, only in an asynchronous way. Strobe templates support caching of parsed templates. 
One important difference from Django templates is that the render() method returns an array of strings. It's your job to call .join("") on the rendered output.

Requirements
============

* node.js >= 0.1.95 (works with lesser versions if you remove the buffer.toString in the load method of the template prototype)

Simple usage example
=========================

    var sys = require('sys')
      , templates = require('template');

    templates.setTemplatesDir('/path/to/templates/dir');
    templates.setDebug(false);

    var context = { foo: 1, bar: 2 };
    var template = new templates.Template('path/to/template.html');
    template.load( function( err, template ) {
      if( err ) // load/parse errors (invalid filename, bad template syntax)
        sys.puts( err );
      else
        template.render( context, function( err, output ) {
          if( err ) // render errors (invalid filename in context variables, bad context variables)
            sys.puts( err );
          else 
            sys.puts( output.join("") );
        });
    });

Adding some default values to all context instances (Something like a context_processor in Django)

    var Context = require('template').Context;
    // This will be available in all context insances
    Context.addToDefault({ MEDIA_URL: "http://media.url/" });
    // Clear the defaults
    Context.clearDefault();

Run a benchmark and a test output
=================================

    $ node tests/run.js

Used Code
=========

* Visionmedia's [ext](http://github.com/visionmedia/ext.js library) (extensions to Object and sprintf)

Todos
=====

* Add filters for variable tags

License
=======

(The MIT License)

Copyright (c) 2010 Dusko Jordanovski

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
