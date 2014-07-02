Changes
=======

* 18.02.2013 - v0.6.13:

* Change `with` on the `SpyOn` object to `withArgs` because `with` is a reserved keyword.

  [Bjorn Tipling]

* 18.02.2013 - v0.6.12:

* Add support for spying on the arguments with which a function has been 
  called.

  [Michael Bird]

* 11.10.2012 - v0.6.11:

* Add `independent-tests` option to the runner which allows user to run multiple
  test files in parallel.

  [Samuel A. Falvo II]

* Add an optional, minimal BDD idiom implementation.
   [Robert Chiniquy]

* Send the SIGKILL signal instead of SIGTERM when killing child processes managed by the process runner.
   [Robert Chiniquy]

* 11.05.2012 - v0.6.10:

* Add 'spy' functionality to the 'test' object.
  [Bjorn Tipling]

* 06.05.2012 - v0.6.9:

* Allow user to specify "kill_script" attribute in the process runner
  dependency file.
  If this attribute is present, the kill_script is executed instead
  of sending SIGTERM to the process when stopping it.

* 18.04.2012 - v0.6.8:

* Allow user to pass a comma delimited string with config paths to the
  whiskey-process-runner binary. For example: whiskey-process-runner --config
  tests/dependencies1.json,tests/dependencies2.json.
  In case multiple paths are provided, Whiskey performs simple merge on all the
  values.

* 09.02.2012 - v0.6.7:

* Add `--coverage-no-regen` option. If this option is used coverage won't be
  regenerated if a `lib-cov` directory already exists in a current working
  directory.

* 26.01.2012 - v0.6.6:

 * Add `--coverage-no-instrument` option
 * Also support files with .java suffix when aggregating coverage. Contributed
   by Gary Dusbabek.

* 08.01.2012 - v0.6.5:
 * Modify JSON coverage reporter so it can also be used for aggregated coverage
   output.

* 07.01.2012 - v0.6.4:
  * Add and export installCoverageHandler function.

  * Add 'available_for_coverage' option to the process runner. If a process
    specifies this option it is sent SIGUSR2 signal when stopping it instead
    of sending SIGTERM.

  * Allow user to specify full path when using a JSON coverage reporter.

* 16.12.2011 - v0.6.3:
  * Fix a race condition when using code coverage and instrumenting the code.

* 01.12.2011 - v0.6.2
  * If an error occurs when the process runner is starting a processes,
    propagate it to the ProcessRunner.start callback. Patch by Ken Wronkiewicz.

* 29.11.2011 - v0.6.1
 * Make sure to kill the processes which have already been started by the
   process runner if starting one of the processes fails. Reported by
   Ryan Phillips.

 * If process runner is used with Whiskey, make sure to stop all the running
   processes if Whiskey errors out. Reported by Ryan Phillips.

 * Log an error if test.finish() has been called more then once.

* 27.11.2011 - v0.6.0:
  * Add process runner and support for managing and orchestrating test
    dependencies. More info about the process runner can be found at
    [PROCESS_RUNNER.md](/cloudkick/whiskey/blob/master/PROCESS_RUNNER.md).

* 06.11.2011 - v0.5.1:
  * Fix a bug which caused an infinite loop in the CLI reporter if a test
    name was too long.
  * If `--report-timing` option is used also print aggregated run time for each
    test file.

* 05.11.2011 - v0.5.0:
  * Add `--report-timing` option which reports each test run time.
  * If an error object has no `message` attribute, but it has `toString` method,
    call this method and assign a returned value to the `message` attribute
  * Add `--gen-makefile` and `--makefile-path` option which allows users to generate
    a Makefile with different Whiskey targets
  * Remove all the code which modifies `require.paths` so now Whiskey also works
    with node v0.5.x / v0.6.x.

    Note: Now when using code coverage you must manually set `NODE_PATH` environment
    variable and make sure it contains the `lib-cov` directory.

* 29.08.2011 - v0.4.2:
  * assert.ifError now also captures a stack trace
  * Don't set a first breakpoint at the beginning of the test file when using
    --debug option
  * User can now pass a reason / message to the test.skip() function
  * Add a new 'json' coverage reporter which writes a raw JSON coverage dump to
    a file
  * Add a new `--coverage-files` option which allows user to generate aggregated
    coverage report across multiple files.

* 11.07.2011 - v0.4.1:
  * Fix a bug with reporting coverage when multiple test files had the same
    name
  * Allow user to specify which tests in a test file are run using a glob
    pattern

* 15.06.2011 - v0.4.0:
  * Add experimental support for attaching Node debugger to the test process
    (`--debug` option)
  * Fix a bug in `assert.response`
  * Fix a bug with exiting prematurely in the option parser on Mac OS X
  * Default Whiskey communication socket path now contains a random component
  * `--print-stdout` and `--print-stderr` options have been replaced with the
    `--quiet` option
  * The tests now run in sequential mode by default (old behavior can be
    replicated by using the `--concurrency 100` option)
  * Fix a bug in scope leak reporting
  * Fix a bug in `assert.eql`

* 31.05.2011 - v0.3.4:
  * When reporting the test results print a whole path to the test file
    instead of just a file name
  * Add `--no-styles` option and only use styles and colors if the underlying
    terminal supports it
  * Don't patch `EventEmitter.on` and `EventEmitter.addListener` in the
    long-stack-traces library, because this masks original functions and breaks
    some functionality
  * Add support for skipping a test using `test.skip()` function
  * Allow user to directly pass in a list of test to run to the whiskey binary
    without using the --tests option

* 17.05.2011 - v0.3.3:
  * Make test object a function and allow users to directly call this function
    to signal end of the test
    [Wade Simmons]
  * Add support for scope leaks reporting (`--scope-leaks` option)

* 04.05.2011 - v0.3.2:
  * Allow user to pass in `--encoding` and `--exclude` option to jscoverage
  * When a test file times out, print the results for all the tests in this file
    which didn't time out
  * Refactor some of the internals so the results are now reported back to the
    main process after each test completes instead of reporting them back when all
    the tests in a single file complete
  * Clear the timeout and report the tests result in the child exit handler and
    not after all the tests have called `.finish()`, because it's possible that
    user calls .finish() and blocks afterwards

* 02.05.2011 - v0.3.1:
 * Capture the child process stdout and stderr in the main process instead of
   monkey patching the `process.stdout` and `process.stderr` in the child
   process

* 01.05.2011 - v0.3.0:
 * Refactor most of the internals to make the code more readable and more easy
   to extend
 * Communication between the main and child processes now takes place over a
   unix socket
 * Add support for "Reporter" classes
 * Remove the `--init-file` option
 * User can now specify a maximum number of async tests which will run at the
   same time (`--concurrency [NUMBER]` option)
 * Add a new "TAP" test reporter class (`--test-reporter tap`)
 * Add test coverage support with support for text and HTML output (`--coverage` option)
 * User can now specify a module with custom assertion functions which are
   attached to the `assert` object and passed to the each test function
   (`--custom-assert-module MODULE_PATH`)

Note: The test format has changed and it is not backward compatible with
Whiskey 0.2.0.

Now each test gets passed in a special `test` object and a custom `assert`
module which must be used to perform assertions.

``` javascript
exports['test_some_func'] = function(test, assert) {
...
```

* 15.04.2011 - v0.2.3:
  * Better reporting on a test file timeout
  * Properly report if a test file does not exist or some other
    uncaught exception was thrown
  * Fix a bug with output buffer not being fully flushed on exit
    on OS X
  * add --print-stdout and --print-stderr option

* 30.03.2011 - v0.2.2:
  * Add timeout support to the init, setUp and tearDown function -
   if the callback passed to one of those functions is not called in
   `timeout` milliseconds, an exception is thrown and test execution
   is aborted
  * Test timeout is now properly reported as a failure

* 27.03.2011 - v0.2.1:
  * Handle uncaughtExceptions better
  * Use lighter colors so test status output is more distinguishable
  * Fix bug with "cannot find module" exception not being properly reported
  * Add support for per-test file init function / file
  * Print stdout and stderr on failure

* 26.03.2011 - v0.2.0
  * Add support for the failfast mode (runner exists after a first failure)
  * User can specify custom test timeout by passing in the --timeout argument
  * Add support for a setUp and tearDown function
  * Add colors to the output
  * Now each test file must export all the test functions so the runner can
    iterate over them
  * Add support for a global initialization file / function (`init` function in
    this file is run before all the tests in a main process and can perform
    some kind of global initialization)
  * Add support for `--chdir` argument

* 25.03.2011 - v0.1.0
  * Initial release (refactor module out from Cast and move it into a separate
    project)
