#!/bin/bash
set -o errexit

npm install
cd type-definitions/tests
../../node_modules/flow-bin/cli.js

