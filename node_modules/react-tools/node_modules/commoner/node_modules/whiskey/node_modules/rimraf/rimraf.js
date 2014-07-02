module.exports = rimraf
rimraf.sync = rimrafSync

var fs = require("fs")
  , path = require("path")

// for EBUSY handling
var waitBusy = {}
  , maxBusyTries = 3

// for EMFILE handling
var resetTimer = null
  , timeout = 0

function rimraf (p, cb_) {
  rimraf_(p, function cb (er) {
    if (er) {
      if (er.message.match(/^EBUSY/)) {
        // windows is annoying.
        if (!waitBusy.hasOwnProperty(p)) waitBusy[p] = maxBusyTries
        if (waitBusy[p]) {
          waitBusy[p] --
          // give it 100ms more each time
          var time = (maxBusyTries - waitBusy[p]) * 100
          return setTimeout(function () { rimraf_(p, cb) }, time)
        }
      }
      if (er.message.match(/^EMFILE/)) {
        setTimeout(function () {
          rimraf_(p, cb)
        }, timeout ++)
        return
      }
    }
    timout = 0
    cb_(er)
  })
}

function asyncForEach (list, fn, cb) {
  if (!list.length) cb()
  var c = list.length
    , errState = null
  list.forEach(function (item, i, list) {
    fn(item, function (er) {
      if (errState) return
      if (er) return cb(errState = er)
      if (-- c === 0) return cb()
    })
  })
}

function rimraf_ (p, cb) {
  fs.lstat(p, function (er, s) {
    if (er) return cb()
    if (!s.isDirectory()) return fs.unlink(p, cb)
    fs.readdir(p, function (er, files) {
      if (er) return cb(er)
      asyncForEach(files.map(function (f) {
        return path.join(p, f)
      }), rimraf, function (er) {
        if (er) return cb(er)
        fs.rmdir(p, cb)
      })
    })
  })
}

// this looks simpler, but it will fail with big directory trees,
// or on slow stupid awful windows filesystems,
// and it's much slower, since the functional async version will
// actually delete up to 4 things at once, or whatever eio is
// configured to handle.
function rimrafSync (p) {
  var s = fs.lstatSync(p)
  if (!s.isDirectory()) return fs.unlinkSync(p)
  fs.readdirSync(p).forEach(function (f) {
    rimrafSync(path.join(p, f))
  })
  fs.rmdirSync(p)
}
