#!/bin/bash

# Run all tests using jest
if [[ $TRAVIS ]]
then jest -i # Travis tests are run inline
else jest
fi
