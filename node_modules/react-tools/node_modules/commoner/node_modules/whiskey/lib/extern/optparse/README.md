optparse-js
===========

Optparse-js is a command line option parser for Javascript. It's slightly based on Ruby's implementation optparse but with some differences (different languages has different needs) such as custom parsers. 

All examples in this readme is using [Node.js](http://nodejs.org/). How ever, the library works with all kinds of Javascript implementations.


QUICK START
-----------

The library defines one class, the OptionParser class. The class constructor takes one single argument, a list with a set of rules. Here is a quick example:

	// Import the sys library
	var util = require('util');

	// Import the optparse library.
	var optparse = require('optparse');
	
	// Define an option called ´´help´´. We give it a quick alias named ´´-h´´ 	
	// and a quick help text.
	var switches = [
		['-h', '--help', 'Shows help sections']
	];
	
	// Create a new OptionParser.
	var parser = new optparse.OptionParser(switches);
	
	// Hook the help option. The callback will be executed when the OptionParser 
	// hits the switch ´´-h´´ or ´´--help´´. Each representatio
	parser.on('help', function() {
		util.puts('Help');
	});
	


DEFINING RULES
--------------
The OptionParser constructor takes an Array with rules. Each rule is represented by an array (tuple) of two or three values. A typical rule definition may look like this:

	['-h', '--help', 'Print this help']
	
	
The first value is optional, and represents an alias for the long-named switch (the second value, in this case ´´--help´´). 

The second argument is the actual rule. The rule must start with a double dash followed by a switch name (in this case ´help´). The OptionParser also supports special option arguments. Define an option argument in the rule by adding a named argument after the leading double dash and switch name (E.G '--port-number PORT_NUMBER'). The argument is then parsed to the option handler. To define an optional option argument, just add a braces around argument in the rule (E.G '--port-number [PORT_NUMBER]). The OptionParser also supports filter. More on that in in the section called ´Option Filters´.

The third argument is an optional rule description. 


OPTION FILTERS
--------------
Filters is a neat feature that let you filter option arguments. The OptionParser itself as already a set of built-in common filter's. These are:

- NUMBER, supports both decimal and hexadecimal numbers.
- DATE, filters arguments that matches YYYY-MM-DD. 
- EMAIL, filters arguments that matches my@email.com.
 
It's simple to use any of the filter above in your rule-set. Here is a quick example how to filter number: 

	var rules = [
		['--first-option NUMBER', 'Takes a number as argument'],
		['--second-option [NUMBER]', 'Takes an optional number as argument']
	]

You can add your own set of filter by calling the *parser_instance.filter* method:

	parser.filter('single_char', function(value) {
		if(value.length != 1) throw "Filter mismatch.";
		return value;
	});


OPTION PARSER
-------------
The OptionParser class has the following properties and methods:

### string banner
An optional usage banner. This text is included when calling ´´toString´´. Default value is: "Usage: [Options]".


### string options_title
An optional title for the options list. This text is included when calling ´´toString´´. Default value is: "Available options:".


### function on(switch_or_arg_index, callback)
Add's a callback for a switch or an argument (defined by index). Switch hooks MUST be typed witout the leading ´´--´´. This example show how to hook a switch:

	parser.on('help', function(optional_argument) {
		// Show help section
	});
	
And this example show how to hook an argument (an option without the leading - or --): 

	parser.on(0, function(opt) {
		puts('The first non-switch option is:' +  opt);
	});
	
It's also possible to define a default handler. The default handler is called when no rule's are meet. Here is an example how to add a ´default handler´:

	parser.on(function(opt) {
		puts('No handler was defined for option:' +  opt);
	});
	
Use the wildcard handler to build a custom ´´on´´ handler.

	parser.on('*', function(opt, value) {
		puts('option=' + opt + ', value=' + value);
	});
	
### function filter(name, callback)
Adds a new filter extension to the OptionParser instance. The first argument is the name of the filter (trigger). The second argument is the actual filter  See the ´OPTION FILTERS´ section for more info. 

It's possible to override the default filters by passing the value "_DEFAULT" to the ´´name´´ argument. The name of the filter is automatically transformed into 
upper case.


### function halt([callback]) 
Interrupt's further parsing. This function should be called from an ´on´ -callbacks, to cancel the parsing. This can be useful when the program should ignore all other arguments (when displaying help or version information).

The function also takes an optional callback argument. If the callback argument is specified, a ´halt´ callback will be added (instead of executing the ´halt´ command).

Here is an example how to add an ´on_halt´ callback:

	parser.halt(function() {
		puts('An option callback interupted the parser');
	});

	
### function parse(arguments)
Start's parsing of arguments. This should be the last thing you do.


### function options()
Returns an Array with all defined option rules 


### function toString()
Returns a string representation of this OptionParser instance (a formatted help section).


MORE EXAMPLES
-------------
See examples/nodejs-test.js and examples/browser-test-html for more info how to
use the script. 


SUGGESTIONS
-----------
All comments in how to improve this library is very welcome. Feel free post  suggestions to the [Issue tracker](http://github.com/jfd/optparse-js/issues), or even better, fork the repository to implement your own features.


LICENSE
-------
Released under a MIT-style license.


COPYRIGHT
---------
Copyright (c) 2009 Johan Dahlberg

