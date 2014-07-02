// Import the optparse script
require.paths.unshift(__dirname); //make local paths accessible

var optparse = require('lib/optparse');

var sys= require('sys');

// Define some options
var SWITCHES = [
    ['-i', '--include-file FILE', "Includes a file"],
    ['-p', '--print [MESSAGE]', "Prints an optional message on screen"],
    ['-d', '--debug', "Enables debug mode"],
    ['-H', '--help', "Shows this help section"],
    ['--date DATE', "A date. A date is expected E.G. 2009-01-14"],
    ['--number NUMBER', "A Number. Supported formats are 123, 123.123, 0xA123"],
    ['--other NAME', "No handler defined for this option. Will be handled by the wildcard handler."],
];

// Create a new OptionParser with defined switches
var parser = new optparse.OptionParser(SWITCHES), print_summary = true, 
    first_arg;
parser.banner = 'Usage: nodejs-test.js [options]';

// Internal variable to store options.
var options = {
    debug: true,
    files: [],
    number: undefined,
    date: undefined
};

// Handle the first argument (switches excluded)
parser.on(0, function(value) {
    first_arg = value;
});

// Handle the --include-file switch
parser.on('include-file', function(value) {
    options.files.push(value);
});

// Handle the --print switch
parser.on('print', function(value) {
    sys.puts('PRINT: ' + (value || 'No message entered'));
});

// Handle the --date switch
parser.on('date', function(value) {
    options.date = value;
});

// Handle the --number switch
parser.on('number', function(value) {
    options.number = value;
});

// Handle the --debug switch
parser.on('debug', function() {
    options.debug = true;
});

// Handle the --help switch
parser.on('help', function() {
    sys.puts(parser.toString());
    print_summary = false;
});

// Set a default handler
parser.on('*', function(opt, value) {
    sys.puts('wild handler for ' + opt + ', value=' + value);
});

// Parse command line arguments
parser.parse(process.ARGV);

if(print_summary) {
    sys.puts("First non-switch argument is: " + first_arg);
    
    // Output all files that was included.
    sys.puts("No of files to include: " + options.files.length);
    for(var i = 0; i < options.files.length; i++) {
        sys.puts("File [" + (i + 1) + "]:" + options.files[i]);
    }

    // Is debug-mode enabled?
    sys.puts("Debug mode is set to: " + options.debug);

    sys.puts("Number value is: " + options.number);
    sys.puts("Date value is: " + options.date);
}