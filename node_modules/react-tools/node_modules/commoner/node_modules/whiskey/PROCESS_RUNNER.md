# Process Runner

Whiskey process runner can be used for starting and managing service
dependencies for your tests.

Example dependencies include, but are not limited to:

* databases,
* web servers,
* other external services

Note: All the processes defined in the configuration file are managed by Whiskey
process runner which means they shouldn't deamonize and must run in the
foreground.

## Configuration File

`dependencies.json` file is used to specify all the dependencies for your tests.

Example configuration file:

```javascript
{
  "cassandra": {
    "cmd": ["/usr/local/bin/cassandra/", "-f"],
    "cwd": ["__dirname", ".."],
    "log_file": "cassandra.log",
    "wait_for": "socket",
    "wait_for_options": {
      "host": "127.0.0.1",
      "port": "1234"
    },
    "timeout": 6000
  },

  "api_server": {
    "cmd": ["bin/api-server"],
    "depends": ["cassandra"]
  },

  "celery": {
    "cmd": ["celeryd", "-w", "5"],
    "wait_for": "stdout",
    "wait_for_options": {
      "string": "Celery has been started..."
    }
  }
}
```

### Option descriptions

* `cmd` - command to run.
* `cwd` - process working directory (defaults to the current working
   directory).
* `log_file` - path to the file where the process stdout and stderr is saved.
  (defaults to `cwd/<process_name>.log`)
* `wait_for` - Condition which must be met before the process is considered as
  started (defaults to `none`).
* `timeout` - how long to wait for process to start (in ms) before erroring
   out (defaults to 10 seconds).
* `depends` - Array of names of process dependencies. Name must match some other
  process defined in the configuration file.

Valid `wait_for` values:

* `none` - don't wait
* `stdout` - wait for a string on process standard output or standard error
* `socket` - wait until a connection on the provided ip and port is successfully
  established

Valid options for `wait_for_options`:

* `stdout` - `string`
* `socket` - `host`, `port`

## Specifying Dependencies In the Test Files

``` javascript
exports.dependencies = ['name1', 'name2'];
```

## Process Manager Command Line Tool

Command line tool can be used for:

* Verifying that the configuration file is correct
* Starting specified dependencies without running the tests. All the started
  processed are stopped on `SIGINT`.

### Usage

### Verify configuration file

`whiskey-process-runner --configuration [file.json] --verify`

### Start all the processes defined in the configuration file

`whiskey-process-runner --configuration [file.json] --run`

### Start some processes defined in the configuration file

`whiskey-process-runner --configuration [file.json] --run --names process1,process2`

### TODO

* Command line option for interactively generating configuration file
