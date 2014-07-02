var _debugger = require('./extern/_debugger');

var Client = _debugger.Client;
var Interface = _debugger.Interface;

Client.prototype.setBreakpoint = function(target, line, callback) {
  var req = {
    command: 'setbreakpoint',
    arguments: { type: 'script',
                 target: target,
                 line: line
    }
  };

  this.req(req, function(res) {
    if (callback) {
      callback(res);
    }
  });
};

// Connect to the existing debug server instead of spawning one
Interface.prototype.connect = function(port, delay, cb) {
  var self = this;
  port = port || _debugger.port;
  delay = delay || 100;

  setTimeout(function() {
    var client = self.client = new Client();
    client.connect(port);

    client.once('ready', function() {
      if (cb) {
        cb(null, client);
      }
    });

    client.on('close', function() {
      self.client = null;
      self.killChild();
      self.term.close();
    });

    client.on('unhandledResponse', function(res) {
      console.log('\r\nunhandled res:');
      console.log(res);
    });

    client.on('error', function(err) {
      console.log('error: ' + err);
    });

    client.on('break', function(res) {
      self.handleBreak(res.body);
    });
  }, delay);
};

Interface.prototype._getScript = function(scriptName) {
  var scripts, script;
  scripts = this.client.scripts;

  for (var key in scripts) {
    if (scripts.hasOwnProperty(key)) {
      script = scripts[key];

      if (script && script.name.indexOf(scriptName) !== -1) {
        return script;
      }
    }
  }

  return false;
};

exports.Client = Client;
exports.Interface = Interface;
