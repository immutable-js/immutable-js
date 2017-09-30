#!/bin/bash -e

# Copyright (c) 2014-present, Facebook, Inc.
#
# This source code is licensed under the MIT license found in the
# LICENSE file in the root directory of this source tree.

if ! git diff --quiet; then echo "

$(tput setf 4)The Travis build resulted in additional changed files.
Typically this is due to not running $(tput smul)npm test$(tput rmul) locally before
submitting a pull request.

The following changes were found:$(tput sgr0)
";

  git diff --exit-code;
fi;
