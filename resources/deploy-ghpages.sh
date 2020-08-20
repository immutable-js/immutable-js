#!/bin/sh -e

# Copyright (c) 2014-present, Facebook, Inc.
#
# This source code is licensed under the MIT license found in the
# LICENSE file in the root directory of this source tree.

# This script maintains the ghpages branch which hosts the immutable.js website

# Create empty gh-pages directory
rm -rf gh-pages
git clone -b gh-pages "https://${GH_TOKEN}@github.com/immutable-js-oss/immutable-js.git" gh-pages

# Remove existing files first
rm -rf gh-pages/**/*
rm -rf gh-pages/*

# Copy over necessary files
cp -r pages/out/* gh-pages/

HEADREV=`git rev-parse HEAD`
echo $HEADREV

cd gh-pages
git config user.name "Travis CI"
git config user.email "travis@travis-ci.com"
git add -A .
if git diff --staged --quiet; then
  echo "Nothing to publish"
else
  git commit -a -m "Deploy $HEADREV to GitHub Pages"
  git push > /dev/null 2>&1
  echo "Pushed"
fi
