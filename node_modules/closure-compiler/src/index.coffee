# The MIT License
# 
# Copyright (c) 2011 Tim Smart
# 
# Permission is hereby granted, free of charge, to any person obtaining a
# copy of this software and associated documentation files
# (the "Software"), to deal in the Software without restriction,
# including without limitation the rights to use, copy, modify, merge,
# publish, distribute, sublicense, and/or sell copies of the Software, and
# to permit persons to whom the Software is furnished to do so, subject to
# the following conditions:
# 
# The above copyright notice and this permission notice shall be included
# in all copies or substantial portions of the Software.
# 
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
# OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
# MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
# IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
# CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
# TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
# SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

spawn = require('child_process').spawn
path  = require 'path'

JAVA_PATH = exports.JAVA_PATH = 'java'
JAR_PATH  = exports.JAR_PATH  = path.join __dirname, 'vendor/compiler.jar'
OPTIONS   = exports.OPTIONS   = {}

exports.compile = (input, options, callback) ->
  if 'function' is typeof options
    callback = options
    options  = OPTIONS
  else
    result = {}
    Object.keys(OPTIONS).forEach (key) ->
      result[key] = OPTIONS[key]
    Object.keys(options).forEach (key) ->
      result[key] = options[key]
    options = result

  args = []

  if !options.jar
    options.jar = JAR_PATH

  args.push('-jar')
  args.push(options.jar)
  delete options.jar

  Object.keys(options).forEach (key) ->
    value = options[key]

    if Array.isArray(value)
      for val in value
        args.push "--#{key}"
        args.push val
      return

    args.push "--#{key}"
    args.push value

  compiler = spawn JAVA_PATH, args
  stdout   = ''
  stderr   = ''

  compiler.stdout.setEncoding 'utf8'
  compiler.stderr.setEncoding 'utf8'

  compiler.stdout.on 'data', (data) ->
    stdout += data

  compiler.stderr.on 'data', (data) ->
    stderr += data

  compiler.on 'exit', (code) ->
    if code isnt 0
      error      = new Error stderr
      error.code = code
    else error   = null
    callback error, stdout, stderr

  compiler.stdin.end input
