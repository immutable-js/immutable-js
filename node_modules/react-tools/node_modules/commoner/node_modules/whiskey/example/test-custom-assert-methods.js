var http = require('http');

var async = require('async');

exports['test_assert.response'] = function(test, assert) {
  var server = http.createServer(function (req, res) {
    if (req.method === 'GET') {
      res.writeHead(200, {'Content-Type': 'text/plain'});
    }
    else {
      res.writeHead(404, {'Content-Type': 'text/plain'});
    }

    res.end('hello world');
  });

  async.series([
    function testGet(callback) {
      var req = {
        'url': '/test',
        'method': 'get'
      };

      assert.response(server, req, function(res) {
        assert.equal(res.statusCode, 200);
        assert.equal(res.body, 'hello world');
        callback();
      });
    },

    function testPost(callback) {
      var req = {
        'url': '/test',
        'method': 'post'
      };

      assert.response(server, req, function(res) {
        assert.equal(res.statusCode, 404);
        assert.equal(res.body, 'hello world');
        callback();
      });
    }
  ],

  function(err) {
    assert.ifError(err);
    test.finish();
  });
};

exports['test_other_custom_asserts_functions'] = function(test, assert) {
  assert.isNull(null);
  assert.isNotNull(1);
  assert.isNotNull(false);
  assert.isNotNull(0);
  assert.isNotNull(-1);
  assert.isDefined(1);
  assert.type('a', 'string');
  assert.type(function() {}, 'function');
  assert.includes([1,2,3], 2);
  assert.length([1,2,3], 3);

  test.finish();
};
