# Contributing

Thank you for contributing!

## Installation

```sh
git clone https://github.com/sveltejs/eslint-plugin-svelte.git
cd eslint-plugin-svelte
pnpm install
```

## Running Tests

```sh
cd packages/eslint-plugin-svelte
pnpm run test
```

This is an [ESLint](http://eslint.org) plugin. See ESLint's [Working with Plugins](http://eslint.org/docs/developer-guide/working-with-plugins) for API details.

The plugin lints itself. Running `pnpm run lint` checks the style and will fail the build if there are lint errors. Use `pnpm run lint-fix` to automatically fix some issues.

## Other Development Tools

- `pnpm run test` – runs tests.
- `pnpm run new -- [new-rule-name]` – generates files for a new rule.
- `pnpm run update` – updates the README and recommended configuration.

## Rule Testing

Rule tests typically use fixtures. For example, for the `indent` rule, the test file is `tests/src/rules/indent.ts` and the fixtures are in `tests/fixtures/rules/indent`, which contains `invalid` and `valid` directories.

- The `invalid` directory contains test cases where the rule should report errors.
- The `valid` directory contains test cases where no errors are reported.

Fixture input files should be named `*-input.svelte` and are automatically collected.\
If configuration is needed, include a JSON file:

- For a specific test file (e.g., `my-test-input.svelte`), add `my-test-config.json`.
- For all fixtures in a directory, add `_config.json`.

Verifying output for invalid tests requires `*-errors.json` and `*-output.svelte` (for auto-fix). These files are auto-generated if missing—delete them to recreate.

**Tips**:

To test only one rule (e.g., `indent`), run:

```sh
pnpm run test -- -g indent
```

Refer to [this Stack Overflow post](https://stackoverflow.com/questions/10832031/how-to-run-a-single-test-with-mocha) for details.

To test a single file (e.g., `my-test-input.svelte`), add a `my-test-config.json` with `{"only": true}`.
(Remember to remove `{"only": true}` before submitting a pull request.)

## Preview Docs

```sh
cd docs-svelte-kit
pnpm run build && pnpm run preview
```

## Publishing

We use [changesets](https://github.com/changesets/changesets) for version management, changelog generation, and automated releases.

For more details, see [changesets-bot](https://github.com/apps/changeset-bot) and its [action](https://github.com/changesets/action).
