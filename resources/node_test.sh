#!/bin/bash

# Many lols. See gruntfile for full explanation.
node -e "require('ts-compiler')"

# Run all tests using jest
if [[ $TRAVIS ]]
then jest -i # Travis tests are run inline
else jest
fi
