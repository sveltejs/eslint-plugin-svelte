# Contributing

Thanks for contributing!

## Installation

```sh
git clone https://github.com/sveltejs/eslint-plugin-svelte.git
cd eslint-plugin-svelte
pnpm install
```

## Running the tests

```sh
pnpm run test
```

To run the tests with debugging log, you can use `pnpm run test:debug`.

This is an [ESLint](http://eslint.org) plugin. Documentation for the APIs that it uses can be found on ESLint's [Working with Plugins](http://eslint.org/docs/developer-guide/working-with-plugins) page.

This plugin is used to lint itself. The style is checked when `pnpm run lint` is run, and the build will fail if there are any linting errors. You can use `pnpm run lint-fix` to fix some linting errors.

## Other Development Tools

- `pnpm run test` runs tests.
- `pnpm run cover` runs tests and measures coverage.
- `pnpm run new -- [new-rule-name]` generate the files needed to implement the new rule.
- `pnpm run update` runs in order to update readme and recommended configuration.
- `pnpm run docs:watch` launch the document site in development mode.

## Test the Rule

Rule testing almost always uses fixtures.  
For example, for an `indent` rule, the `.ts` file that runs the test is `tests/src/rules/indent.ts` and the fixture is in `tests/fixtures/rules/indent`.  
The fixture directory has an `invalid` directory and a `valid` directory.

- The `invalid` directory contains test cases where the rule reports problems.
- The `valid` directory contains test cases where the rule does not report a problem.

The fixture input file should be named `*-input.svelte`. It is automatically collected and tested.  
If your test requires configuration, you need to add a json file with the configuration.

- If you want to apply a configuration to `my-test-input.svelte`, add `my-test-config.json`.
- If you want to apply the same configuration to all the fixtures in that directory, add `_config.json`.

To verify the output of invalid test cases requires `*-errors.json`, and `*-output.svelte` (for auto-fix). However, you don't have to add them yourself. If they do not exist, they will be automatically generated when you run the test. In other words, delete them manually when you want to recreate them.

**Tips**:

If you want to test only one rule, run the following command (for `indent` rule):

```sh
pnpm run test -- -g indent
```

Take <https://stackoverflow.com/questions/10832031/how-to-run-a-single-test-with-mocha> as reference for details.

If you want to test only `my-test-input.svelte`, add `my-test-config.json` and save `{"only": true}`.  
(Note that `{"only": true}` must be removed before making a pull request.)

## Commit messages

Please view [commitlint](https://commitlint.js.org) and [@commitlint/config-conventional](https://github.com/conventional-changelog/commitlint/tree/master/%40commitlint/config-conventional) for more details.

## Publishing

We're using [changesets](https://github.com/changesets/changesets) for version management, CHANGELOG and releasing automatically.

Please view [changesets-bot](https://github.com/apps/changeset-bot) and its [action](https://github.com/changesets/action) for more details.
