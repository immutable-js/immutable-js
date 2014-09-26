# Contributing to Immutable JS

We want to make contributing to this project as easy and transparent as
possible. Hopefully this document makes the process for contributing clear and
answers any questions you may have. If not, feel free to open an
[Issue](https://github.com/facebook/immutable-js/issues).

## Pull Requests

All active development of Immutable JS happens on GitHub. We actively welcome
your [pull requests](https://help.github.com/articles/creating-a-pull-request).

 1. Fork the repo and create your branch from `master`.
 2. Install all dependencies. (`npm install`)
 3. Install the grunt CLI tools. (`npm install -g grunt-cli`)
 4. If you've added code, add tests.
 5. If you've changed APIs, update the documentation.
 6. Build generated JS, run tests and ensure your code passes lint. (`grunt`)
 7. Be sure to commit the generated JS in `/dist`.
 8. If you haven't already, complete the Contributor License Agreement ("CLA").

## Contributor License Agreement ("CLA")

In order to accept your pull request, we need you to submit a CLA. You only need
to do this once to work on any of Facebook's open source projects.

Complete your CLA here: <https://code.facebook.com/cla>

## `master` is unsafe

We will do our best to keep `master` in good shape, with tests passing at all
times. But in order to move fast, we might make API changes that your
application might not be compatible with. We will do our best to communicate
these changes and always [version](http://semver.org/) appropriately so you can
lock into a specific version if need be. If any of this is worrysome to you,
just use [npm](https://www.npmjs.org/package/immutable).

## Issues

We use GitHub issues to track public bugs and requests. Please ensure your bug
description is clear and has sufficient instructions to be able to reproduce the
issue. The best way is to provide a reduced test case on jsFiddle or jsBin.

Facebook has a [bounty program](https://www.facebook.com/whitehat/) for the safe
disclosure of security bugs. In those cases, please go through the process
outlined on that page and do not file a public issue.

## Coding Style

* 2 spaces for indentation (no tabs)
* 80 character line length strongly preferred.
* Prefer `'` over `"`
* ES6 Harmony when possible.
* Use semicolons;
* Trailing commas,
* Avd abbr wrds.

## License

By contributing to Immutable JS, you agree that your contributions will be
licensed under its BSD license.
