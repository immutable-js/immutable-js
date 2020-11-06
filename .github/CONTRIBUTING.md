# Have a question?

Please ask questions on [Stack Overflow](https://stackoverflow.com/questions/tagged/immutable.js) instead of opening a Github Issue. There are more people on Stack Overflow who
can answer questions, and good answers can be searchable and canonical.

# Issues

We use GitHub issues to track bugs. Please ensure your bug description is clear
and has sufficient instructions to be able to reproduce the issue.

The absolute best way to report a bug is to submit a pull request including a
new failing test which describes the bug. When the bug is fixed, your pull
request can then be merged!

The next best way to report a bug is to provide a reduced test case on jsFiddle
or jsBin or produce exact code inline in the issue which will reproduce the bug.

Facebook has a [bounty program](https://www.facebook.com/whitehat/) for the safe
disclosure of security bugs. In those cases, please go through the process
outlined on that page and do not file a public issue.

# Code of Conduct

The code of conduct is described in [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md)

# Pull Requests

All active development of Immutable JS happens on GitHub. We actively welcome
your [pull requests](https://help.github.com/articles/creating-a-pull-request).

1.  Fork the repo and create your branch from `master`.
2.  Install all dependencies. (`npm install`)
3.  If you've added code, add tests.
4.  If you've changed APIs, update the documentation.
5.  Build generated JS, run tests and ensure your code passes lint. (`npm run test`)
6.  If you haven't already, complete the Contributor License Agreement ("CLA").

## Documentation

Documentation for Immutable.js (hosted at http://facebook.github.io/immutable-js)
is developed in `pages/`. Run `npm start` to get a local copy in your browser
while making edits.

## Contributor License Agreement ("CLA")

In order to accept your pull request, we need you to submit a CLA. You only need
to do this once to work on any of Facebook's open source projects.

Complete your CLA here: <https://code.facebook.com/cla>

## Coding Style

- 2 spaces for indentation (no tabs)
- 80 character line length strongly preferred.
- Prefer `'` over `"`
- ES6 Harmony when possible.
- Use semicolons;
- Trailing commas,
- Avd abbr wrds.

# Functionality Testing

Run the following command to build the library and test functionality:

```bash
npm run test
```

## Performance Regression Testing

Performance tests run against master and your feature branch.
Make sure to commit your changes in your local feature branch before proceeding.

These commands assume you have a remote named `upstream` amd that you do not already have a local `master` branch:

```bash
git fetch upstream
git checkout -b master upstream/master
```

These commands build `dist` and commit `dist/immutable.js` to `master` so that the regression tests can run.

```bash
npm run test
git add dist/immutable.js -f
git commit -m 'perf test prerequisite.'
```

Switch back to your feature branch, and run the following command to run regression tests:

```bash
npm run test
npm run perf
```

Sample output:

```bash
> immutable@4.0.0-rc.9 perf ~/github.com/facebook/immutable-js
> node ./resources/bench.js

List > builds from array of 2
  Old:   678,974   683,071   687,218 ops/sec
  New:   669,012   673,553   678,157 ops/sec
  compare: 1 -1
  diff: -1.4%
  rme: 0.64%
```

## License

By contributing to Immutable.js, you agree that your contributions will be
licensed under its MIT license.
