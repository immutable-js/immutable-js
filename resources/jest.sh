#!/bin/bash

# Copyright (c) 2014-present, Facebook, Inc.
#
# This source code is licensed under the MIT license found in the
# LICENSE file in the root directory of this source tree.

if [[ $TRAVIS ]]; then jest --no-cache -i; else jest --no-cache; fi;
