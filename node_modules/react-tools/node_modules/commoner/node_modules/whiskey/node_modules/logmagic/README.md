Welcome to Log Magic.
====================

This project isn't usable yet. No promises.  The Bellow is an idea.

The goal is to have a fast and easy to use logging subsystem that can be dynamically
reconfigured to provide insight into production systems.


Getting Started
====================

If you had a file named like, "lib/foo/bar.js", at the top of it, you would put the following:

    var log = require('logmagic').local('mylib.foo.bar');

Then inside bar.js, you would just use the logger like any normal logger:

    log.info("Hello!")
    log.error("Accepts format strings too ${SOME_VAR}", {SOME_VAR: "myvalue"})

In any other part of your application, you can reconfigure the logging subsystem at runtime,
making it easy to change log levels for specific modules dynamically.

    var logmagic = require('logmagic');
    logmagic.registerSink("mysink", function(level, message) { console.log(message); });
    
    /* Send Info an higher in the root logger to stdout */
    logmagic.route("__root__", logmagic.INFO, "stdout")
    
    /* Reconfigure all children of mylib to log all debug messages to your custom sink */
    logmagic.route("mylib.*", logmagic.DEBUG, "mysink")


Builtin sinks include:

* Standard Error

Future features:
* Standard Out
* Facebook Scribe: https://github.com/facebook/scribe
* File
* Unix Socket
* Syslog
