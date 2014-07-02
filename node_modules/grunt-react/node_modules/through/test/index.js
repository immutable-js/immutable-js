
var test = require('tape')
var spec = require('stream-spec')
var through = require('../')

/*
  I'm using these two functions, and not streams and pipe
  so there is less to break. if this test fails it must be
  the implementation of _through_
*/

function write(array, stream) {
  array = array.slice()
  function next() {
    while(array.length)
      if(stream.write(array.shift()) === false)
        return stream.once('drain', next)
    
    stream.end()
  }

  next()
}

function read(stream, callback) {
  var actual = []
  stream.on('data', function (data) {
    actual.push(data)
  })
  stream.once('end', function () {
    callback(null, actual)
  })
  stream.once('error', function (err) {
    callback(err)
  })
}

test('simple defaults', function(assert) {

  var l = 1000
    , expected = []

  while(l--) expected.push(l * Math.random())

  var t = through()
    spec(t)
      .through()
      .pausable()
      .validateOnExit()

  read(t, function (err, actual) {
    assert.ifError(err)
    assert.deepEqual(actual, expected)
    assert.end()
  })

  write(expected, t)
});

test('simple functions', function(assert) {

  var l = 1000
    , expected = [] 

  while(l--) expected.push(l * Math.random())

  var t = through(function (data) {
      this.emit('data', data*2)
    }) 
    spec(t)
      .through()
      .pausable()
      .validateOnExit()

  read(t, function (err, actual) {
    assert.ifError(err)
    assert.deepEqual(actual, expected.map(function (data) {
      return data*2
    }))
    assert.end()
  })

  write(expected, t)
})

test('pauses', function(assert) {

  var l = 1000
    , expected = [] 

  while(l--) expected.push(l) //Math.random())

  var t = through()    
    spec(t)
      .through()
      .pausable()
      .validateOnExit()

  t.on('data', function () {
    if(Math.random() > 0.1) return
    t.pause()
    process.nextTick(function () {
      t.resume()
    })
  })

  read(t, function (err, actual) {
    assert.ifError(err)
    assert.deepEqual(actual, expected)
    assert.end()
  })

  write(expected, t)
})
