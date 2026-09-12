# Thin wrappers so `make demo` and `make test` match the README.
# Host, port, and routes come from .env — do not hard-code them here.

.PHONY: demo test

# Starts Vite and opens the clinician + patient windows from scripts/demo.mjs.
demo:
	npm run demo

# Runs the Vitest suite (parser, lingo, Andrew history, Open Dental mapper).
test:
	npm test
