#!/bin/bash

# Many lols. See gruntfile for full explanation.
node -e "require('ts-compiler')"

# Run all tests using jest
jest
