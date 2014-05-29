#!/bin/bash

# curl should fail the pipe
set -o pipefail

LIST_URL="https://code.google.com/p/closure-compiler/wiki/BinaryDownloads"
version_pattern='closure-compiler/compiler-([0-9]*)\.tar\.gz'

if [[ "$(curl "${LIST_URL}")" =~ ${version_pattern} ]]; then
  LATEST_VERSION=${BASH_REMATCH[1]}
fi

if [ "$?" != 0 ] || [ "" == "${LATEST_VERSION}" ]; then
    echo "Failed to fetch or parse the version list from ${LIST_URL}"
    exit 1
fi
echo "Found v${LATEST_VERSION}..."

TMP_FILE="compiler.tar.gz"
if [ -e "${TMP_FILE}" ]; then
  echo "Cannot output to temporary file ${TMP_FILE}, something's in the way..."
  exit 1
fi

OUTPUT_DIR="lib/vendor/"
if [ ! -d "${OUTPUT_DIR}" ]; then
  echo "Output directory ${OUTPUT_DIR} does not exist..."
  exit 1
fi

EXPECTED_URL="http://dl.google.com/closure-compiler/compiler-${LATEST_VERSION}.tar.gz"
if ! curl "${EXPECTED_URL}" > "${TMP_FILE}"; then
  echo "Failed to retrieve jar from ${EXPECTED_URL}..."
  rm "${TMP_FILE}"
  exit 1
fi

mkdir -p tmp

if ! tar -C tmp -xvzf "${TMP_FILE}"; then
  echo "Failed to extract the compiler.jar file from ${TMP_FILE}..."
  exit 1
fi

rm "${TMP_FILE}"
mv "tmp/compiler.jar" "${OUTPUT_DIR}"
rm -rf tmp/

MESSAGE="Updated compiler.jar to v${LATEST_VERSION}"
git add "${OUTPUT_DIR}/compiler.jar"
git commit -m "${MESSAGE}"
git tag -a "closure-v${LATEST_VERSION}" -m "Updated closure to v${LATEST_VERSION}"

# This chews up the package.json formatting
# npm version patch --message "Version %s -- v${LATEST_VERSION}"
