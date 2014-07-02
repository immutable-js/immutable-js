(function(LST) {
    LST.rethrow = false;

    var currentTraceError = null;

    var filename = new Error().stack.split("\n")[1].match(/^    at ((?:\w+:\/\/)?[^:]+)/)[1];
    function filterInternalFrames(frames) {
        return frames.split("\n").filter(function(frame) { return frame.indexOf(filename) < 0; }).join("\n");
    }

    Error.prepareStackTrace = function(error, structuredStackTrace) {
        if (!error.__cachedTrace) {
            error.__cachedTrace = filterInternalFrames(FormatStackTrace(error, structuredStackTrace));
            if (!has.call(error, "__previous")) {
                var previous = currentTraceError;
                while (previous) {
                    var previousTrace = previous.stack;
                    error.__cachedTrace += "\n----------------------------------------\n" +
                        "    at " + previous.__location + "\n" +
                        previousTrace.substring(previousTrace.indexOf("\n") + 1);
                    previous = previous.__previous;
                }
            }
        }
        return error.__cachedTrace;
    }

    var slice = Array.prototype.slice;
    var has = Object.prototype.hasOwnProperty;

    // Takes an object, a property name for the callback function to wrap, and an argument position
    // and overwrites the function with a wrapper that captures the stack at the time of callback registration
    function wrapRegistrationFunction(object, property, callbackArg) {
        if (typeof object[property] !== "function") {
            console.error("(long-stack-traces) Object", object, "does not contain function", property);
            return;
        }
        if (!has.call(object, property)) {
            console.warn("(long-stack-traces) Object", object, "does not directly contain function", property);
        }

        // TODO: better source position detection
        var sourcePosition = (object.constructor.name || Object.prototype.toString.call(object)) + "." + property;

        // capture the original registration function
        var fn = object[property];
        // overwrite it with a wrapped registration function that modifies the supplied callback argument
        object[property] = function() {
            // replace the callback argument with a wrapped version that captured the current stack trace
            arguments[callbackArg] = makeWrappedCallback(arguments[callbackArg], sourcePosition);
            // call the original registration function with the modified arguments
            return fn.apply(this, arguments);
        }

        // check that the registration function was indeed overwritten
        if (object[property] === fn)
            console.warn("(long-stack-traces) Couldn't replace ", property, "on", object);
    }

    // Takes a callback function and name, and captures a stack trace, returning a new callback that restores the stack frame
    // This function adds a single function call overhead during callback registration vs. inlining it in wrapRegistationFunction
    function makeWrappedCallback(callback, frameLocation) {
        // add a fake stack frame. we can't get a real one since we aren't inside the original function
        var traceError = new Error();
        traceError.__location = frameLocation;
        traceError.__previous = currentTraceError;
        return function() {
            // if (currentTraceError) {
            //     FIXME: This shouldn't normally happen, but it often does. Do we actually need a stack instead?
            //     console.warn("(long-stack-traces) Internal Error: currentTrace already set.");
            // }
            // restore the trace
            currentTraceError = traceError;
            try {
                return callback.apply(this, arguments);
            } catch (e) {
                var stack = e.stack;
                e.stack = stack;
                throw e;
            } finally {
                // clear the trace so we can check that none is set above.
                // TODO: could we remove this for slightly better performace?
                currentTraceError = null;
            }
        }
    }

    var global = (function() { return this; })();
    wrapRegistrationFunction(global, "setTimeout", 0);
    wrapRegistrationFunction(global, "setInterval", 0);

    var EventEmitter = require('events').EventEmitter;
    //wrapRegistrationFunction(EventEmitter.prototype, "addListener", 1);
    //wrapRegistrationFunction(EventEmitter.prototype, "on", 1);

    wrapRegistrationFunction(process, "nextTick", 0);

    // Copyright 2006-2008 the V8 project authors. All rights reserved.
    // Redistribution and use in source and binary forms, with or without
    // modification, are permitted provided that the following conditions are
    // met:
    //
    //     * Redistributions of source code must retain the above copyright
    //       notice, this list of conditions and the following disclaimer.
    //     * Redistributions in binary form must reproduce the above
    //       copyright notice, this list of conditions and the following
    //       disclaimer in the documentation and/or other materials provided
    //       with the distribution.
    //     * Neither the name of Google Inc. nor the names of its
    //       contributors may be used to endorse or promote products derived
    //       from this software without specific prior written permission.
    //
    // THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
    // "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
    // LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
    // A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
    // OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
    // SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
    // LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
    // DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
    // THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
    // (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
    // OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

    function FormatStackTrace(error, frames) {
      var lines = [];
      try {
        lines.push(error.toString());
      } catch (e) {
        try {
          lines.push("<error: " + e + ">");
        } catch (ee) {
          lines.push("<error>");
        }
      }
      for (var i = 0; i < frames.length; i++) {
        var frame = frames[i];
        var line;
        try {
          line = FormatSourcePosition(frame);
        } catch (e) {
          try {
            line = "<error: " + e + ">";
          } catch (ee) {
            // Any code that reaches this point is seriously nasty!
            line = "<error>";
          }
        }
        lines.push("    at " + line);
      }
      return lines.join("\n");
    }

    function FormatSourcePosition(frame) {
      var fileLocation = "";
      if (frame.isNative()) {
        fileLocation = "native";
      } else if (frame.isEval()) {
        fileLocation = "eval at " + frame.getEvalOrigin();
      } else {
        var fileName = frame.getFileName();
        if (fileName) {
          fileLocation += fileName;
          var lineNumber = frame.getLineNumber();
          if (lineNumber != null) {
            fileLocation += ":" + lineNumber;
            var columnNumber = frame.getColumnNumber();
            if (columnNumber) {
              fileLocation += ":" + columnNumber;
            }
          }
        }
      }
      if (!fileLocation) {
        fileLocation = "unknown source";
      }
      var line = "";
      var functionName = frame.getFunction().name;
      var addPrefix = true;
      var isConstructor = frame.isConstructor();
      var isMethodCall = !(frame.isToplevel() || isConstructor);
      if (isMethodCall) {
        var methodName = frame.getMethodName();
        line += frame.getTypeName() + ".";
        if (functionName) {
          line += functionName;
          if (methodName && (methodName != functionName)) {
            line += " [as " + methodName + "]";
          }
        } else {
          line += methodName || "<anonymous>";
        }
      } else if (isConstructor) {
        line += "new " + (functionName || "<anonymous>");
      } else if (functionName) {
        line += functionName;
      } else {
        line += fileLocation;
        addPrefix = false;
      }
      if (addPrefix) {
        line += " (" + fileLocation + ")";
      }
      return line;
    }
})(typeof exports !== "undefined" ? exports : {});
