import * as myPlugin from '@ota-meshi/eslint-plugin';
import * as tseslint from 'typescript-eslint';
import * as svelte from 'eslint-plugin-svelte';
import globals from 'globals';

/**
 * @type {import('eslint').Linter.FlatConfig[]}
 */
const config = [
	{
		ignores: [
			'.nyc_output/',
			'coverage/',
			'lib/',
			'node_modules/',
			'!.vscode/',
			'!.github/',
			'!.devcontainer/',
			'prettier-playground/',
			'tests/fixtures/rules/indent/invalid/ts/',
			'tests/fixtures/rules/indent/invalid/ts-v5/',
			'tests/fixtures/rules/indent/invalid/snippets01-input.svelte',
			'tests/fixtures/rules/indent/valid/',
			'tests/fixtures/rules/no-unused-class-name/valid/invalid-style01-input.svelte',
			'tests/fixtures/rules/no-unused-class-name/valid/unknown-lang01-input.svelte',
			'tests/fixtures/rules/valid-compile/invalid/ts/',
			'tests/fixtures/rules/valid-compile/valid/babel/',
			'tests/fixtures/rules/valid-compile/valid/ts/',
			'tests/fixtures/rules/prefer-style-directive/',
			'tests/fixtures/rules/@typescript-eslint/',
			'tests/fixtures/rules/valid-compile/valid/svelte3-options-custom-element-input.svelte',
			'tests/fixtures/rules/mustache-spacing/valid/always/snippet-render01-input.svelte',
			'tests/fixtures/rules/mustache-spacing/invalid/snippet-render01-input.svelte',
			'tests/fixtures/rules/valid-prop-names-in-kit-pages/valid/+test-for-form-input.svelte',
			'.svelte-kit/',
			'svelte.config-dist.js',
			'build/',
			'docs-svelte-kit/shim/eslint.mjs',
			'docs-svelte-kit/shim/assert.mjs',
			'!.*.js',
			'docs-svelte-kit/src/routes/*.md',
			'docs-svelte-kit/src/routes/**/*.md',
			'docs-svelte-kit/src/app.html',
			'src/rule-types.ts',
			// JSONSchema bug?
			'.devcontainer/devcontainer.json',
			// Parser bug?
			'tests/fixtures/rules/indent/invalid/const-tag01-input.svelte',
			'tests/fixtures/rules/indent/invalid/const-tag01-output.svelte'
		]
	},
	...myPlugin.config({
		eslintPlugin: true,
		node: true,
		ts: true,
		json: true,
		packageJson: true,
		yaml: true,
		md: true,
		prettier: true,
		svelte: { withTs: false }
	}),
	{
		rules: {
			'jsdoc/require-jsdoc': 'off',
			'@typescript-eslint/no-shadow': 'off',
			'no-shadow': 'off',
			'@typescript-eslint/naming-convention': 'off',
			'new-cap': 'off',
			complexity: 'off',
			// Repo rule
			'no-restricted-imports': [
				'error',
				{
					patterns: [
						{
							group: ['/regexpp', '/regexpp/*'],
							message: 'Please use `@eslint-community/regexpp` instead.'
						},
						{
							group: ['/eslint-utils', '/eslint-utils/*'],
							message: 'Please use `@eslint-community/eslint-utils` instead.'
						}
					]
				}
			]
		}
	},
	{
		files: ['src/**'],
		rules: {
			'@typescript-eslint/no-restricted-imports': [
				'error',
				{
					patterns: [
						{
							group: ['@typescript-eslint/*'],
							message:
								'@typescript-eslint is not included in dependencies. Only type-import is allowed.',
							allowTypeImports: true
						}
					]
				}
			],
			'no-restricted-properties': [
				'error',
				{ object: 'context', property: 'getSourceCode', message: 'Use src/utils/compat.ts' },
				{ object: 'context', property: 'getFilename', message: 'Use src/utils/compat.ts' },
				{
					object: 'context',
					property: 'getPhysicalFilename',
					message: 'Use src/utils/compat.ts'
				},
				{ object: 'context', property: 'getCwd', message: 'Use src/utils/compat.ts' },
				{ object: 'context', property: 'getScope', message: 'Use src/utils/compat.ts' },
				{ object: 'context', property: 'parserServices', message: 'Use src/utils/compat.ts' }
			]
		}
	},
	{
		files: ['docs-svelte-kit/**'],
		languageOptions: {
			sourceType: 'module',
			globals: {
				...globals.browser,
				require: 'readonly'
			}
		},
		rules: {
			'n/file-extension-in-import': 'off',
			'n/no-unsupported-features/es-syntax': 'off',
			'n/no-unsupported-features/es-builtins': 'off',
			'n/no-unsupported-features/node-builtins': 'off',
			'n/no-missing-import': 'off'
		}
	},
	{
		files: ['docs-svelte-kit/**/*.svelte'],
		languageOptions: {
			parserOptions: { project: null }
		}
	},
	...tseslint.config({
		files: ['tests/fixtures/rules/**'],
		extends: [tseslint.configs.disableTypeChecked],
		rules: {
			'one-var': 'off',
			'no-unused-vars': 'off',
			'no-undef': 'off',
			'no-empty-function': 'off',
			'no-console': 'off',
			'dot-notation': 'off',
			'no-constant-binary-expression': 'off',
			'func-style': 'off',
			'no-var': 'off',
			'no-unused-expressions': 'off',
			'no-new': 'off',
			'getter-return': 'off',
			'no-sparse-arrays': 'off',

			...Object.fromEntries(
				Object.keys(svelte.rules).map((key) => {
					return [`svelte/${key}`, 'off'];
				})
			)
		},
		languageOptions: {
			sourceType: 'module',
			parserOptions: {
				project: null
			}
		}
	}),
	{
		files: [
			'tests/fixtures/rules/**/*output.*',
			'tests/fixtures/rules/no-unused-svelte-ignore/valid/style-lang07-input.svelte'
		],
		rules: {
			'prettier/prettier': 'off'
		}
	},
	{
		files: ['tests/fixtures/rules/**/*errors.yaml'],
		rules: {
			'yml/no-tab-indent': 'off'
		}
	},

	{
		files: ['tests/**'],
		rules: {
			'@typescript-eslint/no-misused-promises': 'off',
			'@typescript-eslint/no-require-imports': 'off'
		}
	}
];
export default config;
