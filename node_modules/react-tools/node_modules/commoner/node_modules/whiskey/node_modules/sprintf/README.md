# sprintf() for node

## Disclaimer

This was originally just an adoption of a browser library to node.js.  
Since that library is now itself a node.js module, you should check that out: [alexei/sprintf.js](https://github.com/alexei/sprintf.js)  

There is also a [built-in util.format](http://nodejs.org/api/util.html#util_util_format_format).


## Install

    npm install sprintf


## How to

Works exactly like http://www.diveintojavascript.com/projects/javascript-sprintf, except that it exports those two functions:

    sprintf = require('sprintf').sprintf;
    vsprintf = require('sprintf').vsprintf;

Have fun!
