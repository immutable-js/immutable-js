//  Optparse.js 1.0.2 - Option Parser for Javascript 
// 
//  Copyright (c) 2009 Johan Dahlberg
// 
//  See README.md for license.
//                                                        
var optparse = {};
try{ optparse = exports } catch(e) {}; // Try to export the lib for node.js
(function(self) {
var VERSION = '1.0.2';
var LONG_SWITCH_RE = /^--\w/;
var SHORT_SWITCH_RE = /^-\w/;
var NUMBER_RE = /^(0x[A-Fa-f0-9]+)|([0-9]+\.[0-9]+)|(\d+)$/;
var DATE_RE = /^\d{4}-(0[0-9]|1[0,1,2])-([0,1,2][0-9]|3[0,1])$/;
var EMAIL_RE = /^([0-9a-zA-Z]+([_.-]?[0-9a-zA-Z]+)*@[0-9a-zA-Z]+[0-9,a-z,A-Z,.,-]*(.){1}[a-zA-Z]{2,4})+$/;
var EXT_RULE_RE = /(\-\-[\w_-]+)\s+([\w\[\]_-]+)|(\-\-[\w_-]+)/;
var ARG_OPTIONAL_RE = /\[(.+)\]/;

// The default switch argument filter to use, when argument name doesnt match
// any other names. 
var DEFAULT_FILTER = '_DEFAULT';
var PREDEFINED_FILTERS = {};

// The default switch argument filter. Parses the argument as text.
function filter_text(value) {
    return value;
}

// Switch argument filter that expects an integer, HEX or a decimal value. An 
// exception is throwed if the criteria is not matched. 
// Valid input formats are: 0xFFFFFFF, 12345 and 1234.1234
function filter_number(value) {
    var m = value.match(NUMBER_RE);
    if(m == null) throw OptError('Expected a number representative');
    if(m[1]) {
        // The number is in HEX format. Convert into a number, then return it
        return parseInt(m[1], 16);
    } else {
        // The number is in regular- or decimal form. Just run in through 
        // the float caster.
        return parseFloat(m[2] || m[3]);
    }
};

// Switch argument filter that expects a Date expression. The date string MUST be
// formated as: "yyyy-mm-dd" An exception is throwed if the criteria is not 
// matched. An DATE object is returned on success. 
function filter_date(value) {
    var m = value.match(DATE_RE);
    if(m == null) throw OptError('Expected a date representation in the "yyyy-mm-dd" format.');
    return new Date(parseInt(m[0]), parseInt(m[1]), parseInt(m[2]));
};

// Switch argument filter that expects an email address. An exception is throwed
// if the criteria doesn`t match. 
function filter_email(value) {
    var m = value.match(EMAIL_RE);
    if(m == null) throw OptError('Excpeted an email address.');
    return m[1];
}

// Register all predefined filters. This dict is used by each OptionParser 
// instance, when parsing arguments. Custom filters can be added to the parser 
// instance by calling the "add_filter" -method. 
PREDEFINED_FILTERS[DEFAULT_FILTER] = filter_text;
PREDEFINED_FILTERS['TEXT'] = filter_text;
PREDEFINED_FILTERS['NUMBER'] = filter_number;
PREDEFINED_FILTERS['DATE'] = filter_date;
PREDEFINED_FILTERS['EMAIL'] = filter_email;

//  Buildes rules from a switches collection. The switches collection is defined
//  when constructing a new OptionParser object. 
function build_rules(filters, arr) {
    var rules = [];
    for(var i=0; i<arr.length; i++) {
        var r = arr[i], rule
        if(!contains_expr(r)) throw OptError('Rule MUST contain an option.');
        switch(r.length) {
            case 1:
                rule = build_rule(filters, r[0]);
                break;
            case 2:
                var expr = r[0].match(LONG_SWITCH_RE) ? 0 : 1;
                var alias = expr == 0 ? -1 : 0;
                var desc = alias == -1 ? 1 : -1;
                rule = build_rule(filters, r[alias], r[expr], r[desc]);
                break;
            case 3:
                rule = build_rule(filters, r[0], r[1], r[2]);
                break;
            default:
            case 0:
                continue;
        }
        rules.push(rule)
    }
    return rules;
}

//  Builds a rule with specified expression, short style switch and help. This 
//  function expects a dict with filters to work correctly. 
//
//  Return format:
//      name               The name of the switch.
//      short              The short style switch
//      long               The long style switch
//      decl               The declaration expression (the input expression)
//      desc               The optional help section for the switch
//      optional_arg       Indicates that switch argument is optional
//      filter             The filter to use when parsing the arg. An 
//                         <<undefined>> value means that the switch does 
//                         not take anargument.
function build_rule(filters, short, expr, desc) {
    var optional, filter;
    var m = expr.match(EXT_RULE_RE);
    if(m == null) throw OptError('The switch is not well-formed.');
    var long = m[1] || m[3];
    if(m[2] != undefined) {
        // A switch argument is expected. Check if the argument is optional,
        // then find a filter that suites.
        var optional_match = m[2].match(ARG_OPTIONAL_RE);
        var filter_name = optional_match === null ? m[2] : optional_match[1];
        optional = optional_match !== null;
        filter = filters[filter_name];
        if(filter === undefined) filter = filters[DEFAULT_FILTER];
    }
    return {
        name: long.substr(2),       
        short: short,               
        long: long,
        decl: expr,
        desc: desc,                 
        optional_arg: optional,
        filter: filter              
    }
}

// Loop's trough all elements of an array and check if there is valid
// options expression within. An valid option is a token that starts 
// double dashes. E.G. --my_option
function contains_expr(arr) {
    if(!arr || !arr.length) return false;
    var l = arr.length;
    while(l-- > 0) if(arr[l].match(LONG_SWITCH_RE)) return true;
    return false;
}

// Extends destination object with members of source object
function extend(dest, src) {
    var result = dest;
    for(var n in src) {
        result[n] = src[n];
    }
    return result;
}

// Appends spaces to match specified number of chars
function spaces(arg1, arg2) {
    var l, builder = [];
    if(arg1.constructor === Number) {
        l = arg1;  
    } else {
        if(arg1.length == arg2) return arg1;
        l = arg2 - arg1.length;
        builder.push(arg1);
    }
    while(l-- > 0) builder.push(' ');
    return builder.join('');
}

//  Create a new Parser object that can be used to parse command line arguments.
//
//
function Parser(rules) {
    return new OptionParser(rules);
}

// Creates an error object with specified error message.
function OptError(msg) {
    return new function() {
        this.msg = msg;
        this.toString = function() {
            return this.msg;
        }
    }
}

function OptionParser(rules) {
    this.banner = 'Usage: [Options]';
    this.options_title = 'Available options:'
    this._rules = rules;
    this._halt = false;
    this.filters = extend({}, PREDEFINED_FILTERS);
    this.on_args = {};
    this.on_switches = {};
    this.on_halt = function() {};
    this.default_handler = function() {};
}

OptionParser.prototype = {
    
    // Adds args and switchs handler.
    on: function(value, fn) {
        if(value.constructor === Function ) {
            this.default_handler = value;
        } else if(value.constructor === Number) {
            this.on_args[value] = fn;
        } else {
            this.on_switches[value] = fn;
        }
    },
    
    // Adds a custom filter to the parser. It's possible to override the
    // default filter by passing the value "_DEFAULT" to the ´´name´´
    // argument. The name of the filter is automatically transformed into 
    // upper case. 
    filter: function(name, fn) {
        this.filters[name.toUpperCase()] = fn;
    },
    
    // Parses specified args. Returns remaining arguments. 
    parse: function(args) {
        var result = [], callback;
        var rules = build_rules(this.filters, this._rules);
        var tokens = args.concat([]);
        while((token = tokens.shift()) && this._halt == false) {
            if(token.match(LONG_SWITCH_RE) || token.match(SHORT_SWITCH_RE)) {
                var arg = undefined;
                // The token is a long or a short switch. Get the corresponding 
                // rule, filter and handle it. Pass the switch to the default 
                // handler if no rule matched.
                for(var i = 0; i < rules.length; i++) {
                    var rule = rules[i];
                    if(rule.long == token || rule.short == token) {
                        if(rule.filter !== undefined) {
                            arg = tokens.shift();
                            if(!arg.match(LONG_SWITCH_RE) && !arg.match(SHORT_SWITCH_RE)) {
                                try {
                                    arg = rule.filter(arg);
                                } catch(e) {
                                    throw OptError(token + ': ' + e.toString());
                                }
                            } else if(rule.optional_arg) {
                                tokens.unshift(arg);
                            } else {
                                throw OptError('Expected switch argument.');
                            }
                        } 
                        callback = this.on_switches[rule.name];
                        if (!callback) callback = this.on_switches['*'];
                        if(callback) callback.apply(this, [rule.name, arg]);
                        break;
                    } 
                }
                if(i == rules.length) this.default_handler.apply(this, [token]);
            } else {
                // Did not match long or short switch. Parse the token as a 
                // normal argument.
                callback = this.on_args[result.length];
                result.push(token);
                if(callback) callback.apply(this, [token]);
            }
        }
        return this._halt ? this.on_halt.apply(this, []) : result;
    },
    
    // Returns an Array with all defined option rules 
    options: function() {
        return build_rules(this.filters, this._rules);
    },

    // Add an on_halt callback if argument ´´fn´´ is specified. on_switch handlers can 
    // call instance.halt to abort the argument parsing. This can be useful when
    // displaying help or version information.
    halt: function(fn) {
        this._halt = fn === undefined
        if(fn) this.on_halt = fn;
    },
    
    // Returns a string representation of this OptionParser instance.
    toString: function() {
        var builder = [this.banner, '', this.options_title], 
            shorts = false, longest = 0, rule;
        var rules = build_rules(this.filters, this._rules);
        for(var i = 0; i < rules.length; i++) {
            rule = rules[i];
            // Quick-analyze the options. 
            if(rule.short) shorts = true;
            if(rule.decl.length > longest) longest = rule.decl.length;
        }
        for(var i = 0; i < rules.length; i++) {
            var text; 
            rule = rules[i];
            if(shorts) {
                if(rule.short) text = spaces(2) + rule.short + ', ';
                else text = spaces(6);
            }
            text += spaces(rule.decl, longest) + spaces(3);
            text += rule.desc;
            builder.push(text);
        }
        return builder.join('\n');
    }
}

self.VERSION = VERSION;
self.OptionParser = OptionParser;

})(optparse);
