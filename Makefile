REPORTER ?= spec

test:
	mocha \
    --reporter $(REPORTER) \
    test/*.js \
    
bump: ;node ./bumpVersion.js

serve: ;node ./serve.js

version: test bump

pub: ;npm publish

publish: test bump pub

dist: test bump pub

.PHONY: test bump pub