#!/usr/bin/env bash
CWD=`dirname $0`
CWD=`cd "$APP_DIR";pwd`

START=$(date +%s)
"${CWD}/bin/whiskey" -m 2 --independent-tests "${CWD}/example/test-long-running-1.js ${CWD}/example/test-long-running-2.js"
if [ $? -ne 0 ]; then
    echo "long-running tests should pass"
    exit 1
fi
END=$(date +%s)
DIFF=$(( $END - $START ))
if [ $DIFF -ge 7 ]; then
    echo "Total test execution time should be less than 6 seconds (assuming code hasn't been changed.)"
    exit 1
fi

"${CWD}/bin/whiskey" --independent-tests "${CWD}/example/test-long-running-1.js ${CWD}/example/test-long-running-2.js ${CWD}/example/test-failure.js"
if [ $? -ne 2 ]; then
    echo "2 tests should fail when running tests independently."
    exit 1
fi

"${CWD}/bin/whiskey" --tests "${CWD}/example/test-success.js"

if [ $? -ne 0 ]; then
    echo "tests should pass"
    exit 1
fi

"${CWD}/bin/whiskey" --tests "${CWD}/example/test-failure.js"

if [ $? -ne 2 ]; then
    echo "2 tests should fail"
    exit 1
fi

"${CWD}/bin/whiskey" --failfast --timeout 500 \
  --tests --concurrency 100 "${CWD}/example/test-failure.js ${CWD}/example/test-timeout.js"

if [ $? -ne 1 ]; then
    echo "1 test should fail"
    exit 1
fi

"${CWD}/bin/whiskey" --failfast --timeout 500 \
  --tests "${CWD}/example/test-timeout.js ${CWD}/example/test-failure.js ${CWD}/example/test-timeout.js"

if [ $? -ne 1 ]; then
    echo "1 test should fail"
    exit 1
fi

"${CWD}/bin/whiskey" --timeout 1000 --tests "${CWD}/example/test-timeout.js"

if [ ! $? -eq 1 ]; then
    echo "test should time out"
    exit 1
fi

"${CWD}/bin/whiskey" --timeout 1000 --tests "${CWD}/example/test-timeout-blocking.js"

if [ ! $? -eq 1 ]; then
    echo "test should time out"
    exit 1
fi

"${CWD}/bin/whiskey" --tests "${CWD}/example/test-setup-and-teardown.js"

if [ $? -ne 0 ]; then
    echo "test should pass"
    exit 1
fi

# Test file does not exist
"${CWD}/bin/whiskey" --tests "${CWD}/example/test-inexistent.js"

if [ $? -ne 1 ]; then
    echo "1 test should fail"
    exit 1
fi

"${CWD}/bin/whiskey" --tests "${CWD}/example/test-setup-fail.js"

if [ $? -ne 3 ]; then
    echo "3 tests should fail"
    exit 1
fi

# Test relative path
"${CWD}/bin/whiskey" --tests "example/test-success.js"

if [ $? -ne 0 ]; then
    echo "tests should pass."
    exit 1
fi

# Test multiple files
"${CWD}/bin/whiskey" --tests "${CWD}/example/test-success.js ${CWD}/example/test-failure.js"

if [ ! $? -gt 0 ]; then
    echo "2 tests should fail"
    exit 1
fi

# Test test init file
FOLDER_EXISTS=0
rm -rf ${CWD}/example/test-123456

"${CWD}/bin/whiskey" --test-init-file "${CWD}/example/init.js" --tests "${CWD}/example/test-success.js"

if [ -d ${CWD}/example/test-123456 ]; then
  FOLDER_EXISTS=1
fi

rm -rf ${CWD}/example/test-123456

if [ $? -ne 0 ] || [ ${FOLDER_EXISTS} -ne 1 ]; then
  echo ${FOLDER_EXISTS}
    echo "test should pass m"
    exit 1
fi

# test uncaught exceptions
"${CWD}/bin/whiskey" --tests "${CWD}/example/test-uncaught.js"

if [ $? -ne 5 ]; then
    echo "5 tests should fail"
    exit 1
fi

# Test chdir
"${CWD}/bin/whiskey" --tests "${CWD}/example/test-chdir.js"

if [ $? -ne 1 ]; then
    echo "1 test should fail"
    exit 1
fi

"${CWD}/bin/whiskey" --tests "${CWD}/example/test-chdir.js" --chdir "${CWD}/example/"

if [ $? -ne 0 ]; then
    echo "tests should pass y"
    exit 1
fi

# Test per test init function
"${CWD}/bin/whiskey" --test-init-file "${CWD}/example/init-test.js" --tests "${CWD}/example/test-init-function.js"

if [ $? -ne 0 ]; then
    echo "tests should pass x"
    exit 1
fi

# Test init function timeout (callback in init function is not called)
"${CWD}/bin/whiskey" --timeout 2000 --test-init-file "${CWD}/example/init-timeout.js" --tests "${CWD}/example/test-failure.js"

if [ $? -ne 1 ]; then
    echo "1 test should fail (callback in init function is not called)"
    exit 1
fi

# Test setUp function timeout (setUp function .finish() is not called)
"${CWD}/bin/whiskey" --timeout 1000 --tests "${CWD}/example/test-setup-timeout.js" --chdir "${CWD}/example/"

if [ $? -ne 1 ]; then
  echo "1 test should fail (setUp timeout)"
    exit 1
fi

# Test tearDown function timeout (tearDown function .finish() is not called)
"${CWD}/bin/whiskey" --timeout 2000 --tests "${CWD}/example/test-teardown-timeout.js" --chdir "${CWD}/example/"

if [ $? -ne 2 ]; then
    echo "1 test should fail (tearDown timeout)"
    exit 1
fi

"${CWD}/bin/whiskey" --timeout 2000 --tests "${CWD}/example/test-custom-assert-functions.js"

if [ $? -ne 2 ]; then
    echo "2 tests should fail"
    exit 1
fi

"${CWD}/bin/whiskey" --timeout 2000 \
 --tests "${CWD}/example/test-custom-assert-functions.js" \
 --custom-assert-module "${CWD}/example/custom-assert-functions.js"

if [ $? -ne 1 ]; then
    echo "1 test should fail"
    exit 1
fi

"${CWD}/example/test-stdout-and-stderr-is-captured-on-timeout.js"

if [ $? -ne 0 ]; then
    echo "test file stdout and stderr was not properly captured during test timeout"
    exit 1
fi

# Verify that when a test file timeout the tests which haven't time out are
# reported properly
"${CWD}/example/test-succeeded-tests-are-reported-on-timeout.js"

if [ $? -ne 0 ]; then
    echo "succeeded tests were not reported properly upon a test file timeout"
    exit 1
fi

# Verify that coverage works properly
if [ "$(which jscoverage)" ]; then
  "${CWD}/example/test-jscoverage.js"

  if [ $? -ne 0 ]; then
      echo "coverage does not work properly"
      exit 1
  fi
else
  echo 'jscoverage not installed, skipping coverage tests'
fi

# Make sure that the child which blocks after call .finish() is killed and
# timeout properly reported
"${CWD}/bin/whiskey" --timeout 1000 \
 --tests "${CWD}/example/test-timeout-after-finish.js"

if [ $? -ne 1 ]; then
    echo "1 test should timeout"
    exit 1
fi

# Scope leaks test (sequential and parallel mode)
"${CWD}/example/test-leaks.js"

if [ $? -ne 0 ]; then
    echo "scope leaks were not reported properly"
    exit 1
fi

# No test function is exported, it should quit immediately
"${CWD}/bin/whiskey" --timeout 1000 \
 --tests "${CWD}/example/test-no-test-functions.js"

if [ $? -ne 0 ]; then
    echo "test didn't exit with zero exit code"
    exit 1
fi

"${CWD}/bin/whiskey" --timeout 1000 \
 --tests "${CWD}/example/test-skipped.js"

if [ $? -ne 0 ]; then
    echo "test didn't exit with zero exit code"
    exit 1
fi

"${CWD}/bin/whiskey" --timeout 1000 \
 --tests "${CWD}/example/test-custom-assert-methods.js"

if [ $? -ne 0 ]; then
    echo "test didn't exit with zero exit code"
    exit 1
fi

# Test pattern name matching
"${CWD}/bin/whiskey" --timeout 1000 \
 --tests "example.test-failure.test_one_is_not*"

if [ $? -ne 1 ]; then
    echo "test didn't exit with 1 exit code"
    exit 1
fi

"${CWD}/bin/whiskey" --timeout 1000 \
 --tests "${CWD}/example/test-getFilePathAndPattern.js"

if [ $? -ne 0 ]; then
    echo "test didn't exit with zero exit code"
    exit 1
fi

"${CWD}/bin/whiskey" --timeout 1000 \
 --tests "${CWD}/example/test-spyon.js"

if [ $? -ne 0 ]; then
    echo "Test didn't exit with zero exit code."
    exit 1
fi

"${CWD}/bin/whiskey" --timeout 1000 \
--tests "${CWD}/example/test-bdd.js"

if [ $? -ne 0 ]; then
    echo "BDD test didn't exit with zero exit code."
    exit 1
fi

"${CWD}/bin/whiskey" --timeout 1000 \
--tests "${CWD}/example/test-bdd-failures.js"

if [ $? -ne 4 ]; then
    echo "BDD failure test didn't fail as expected."
    exit 1
fi


echo ""
echo "* * * Whiskey test suite PASSED. * * *"
exit 0
