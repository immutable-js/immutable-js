CWD=`pwd`

FILES=`find tests -name test*.js -print0`

test:
	NODE_PATH=`pwd`/lib whiskey --tests "${CWD}/${FILES}"

coverage:
	NODE_PATH=`pwd`/lib whiskey --tests "${CWD}/${FILES}" --coverage --coverage-reporter html --coverage-dir coverage_html

.PHONY: test coverage
