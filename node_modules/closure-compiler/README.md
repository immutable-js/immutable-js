node-closure
============

A wrapper to the Google Closure compiler tool. It runs the jar file in a child
process and returns the results in a callback.


## Usage

    var cc = require('closure-compiler')
    var fs = require('fs')

    var options =
      { some    : 'flag'
      , values  : ['1', '2']
      }

    function aftercompile (err, stdout, stderr) {
      if (err) throw err
      var mycompiledcode = stdout
    }

    cc.compile(fs.readFileSync('lib/index.js'), options, aftercompile)

    // The same as:
    // $ java -jar path/to/closure.jar --some "flag" --values "1" --values "2"
