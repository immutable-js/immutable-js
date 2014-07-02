Introduction
---

The [CommonJS module syntax](http://wiki.commonjs.org/wiki/Modules/1.1) is one of the most widely accepted conventions in the JavaScript ecosystem. Everyone seems to agree that `require` and `exports` are a reasonable way of expressing module dependencies and interfaces, and the tools for managing modular code are getting better all the time.

Much less of a consensus has developed around the best way to deliver CommonJS modules to a web browser, where the synchronous semantics of `require` pose a non-trivial implementation challenge. This module loader contributes to that confusion, yet also demonstrates that an amply-featured module loader need not stretch into the hundreds or thousands of lines.

Installation
---
From NPM:

    npm install install

From GitHub:

    cd path/to/node_modules
    git clone git://github.com/benjamn/install.git
    cd install
    npm install .

Usage
---

When evaluated, the contents of install.js create a global function called `install`. This function is the only external interface to the module loader, and it can be called in two ways.

The first way is to pass a module identifier string followed by a module factory function:

    install("some/module/id", function(require, exports, module) {
        // CommonJS module code goes here.

        // For example:
        exports.setImmediate = function(callback) {
            return setTimeout(callback, 0);
        };
    });

This makes the module available for requirement, but does not evaluate the contents of the module until the first time another module calls `require("some/module/id")`.

The second way to invoke `install` is to omit the module identifier and pass an anonymous module factory function:

    install(function(require) {
        // Code that uses require goes here.

        // For example:
        require("some/module/id").setImmediate(function() {
            console.log("setImmediate fired");
        });
    });

Anonymous modules are executed in order of installation, as soon as their requirements have been installed. Note that such modules do not have exports objects, because anonymous modules cannot be required.

Sugar
---
If a named module has no requirements and does not need its own scope, the following shorthand can be used to install the module:

    install("simple/module", { exports: {
        one: 1,
        two: 2,
        buckle: "my shoe"
    }});
