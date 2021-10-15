#!/bin/bash -e

if ! git diff --quiet; then echo "

$(tput setf 4)The CI build resulted in additional changed files.
Typically this is due to not running $(tput smul)npm test$(tput rmul) locally before
submitting a pull request.

The following changes were found:$(tput sgr0)
";

  git diff --exit-code;
fi;
