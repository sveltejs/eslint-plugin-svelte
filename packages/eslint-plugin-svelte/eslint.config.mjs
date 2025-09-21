import * as myPlugin from '@ota-meshi/eslint-plugin';
import * as tseslint from 'typescript-eslint';
import { createJiti } from 'jiti';
const jiti = createJiti(import.meta.url);
const internal = {
	rules: {
		'prefer-find-variable-safe': await jiti.import('./internal-rules/prefer-find-variable-safe.ts')
	}
};

/**
 * @type {import('eslint').Linter.Config[]}
 */
const config = [
	{
		ignores: [
			'.nyc_output/',
			'coverage/',
			'lib/',
			'node_modules/',
			'build/',
			'!.*.js',
			'src/rule-types.ts',
			'tests'
		]
	},
	...myPlugin.config({
		eslintPlugin: true,
		node: true,
		ts: true,
		json: true,
		packageJson: true,
		yaml: true,
		prettier: true
	}),
	{
		rules: {
			'jsdoc/require-jsdoc': 'off',
			'@typescript-eslint/no-shadow': 'off',
			'no-shadow': 'off',
			'@typescript-eslint/naming-convention': 'off',
			'new-cap': 'off',
			complexity: 'off',
			// This is not necessary as we manage it in a different way,
			// and it also prevents false positives for our internal rule implementation.
			'eslint-plugin/require-meta-docs-url': 'off',
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
		plugins: {
			internal
		},
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
				{ object: 'context', property: 'getSourceCode', message: 'Use `context.sourceCode`' },
				{ object: 'context', property: 'getFilename', message: 'Use `context.filename`' },
				{
					object: 'context',
					property: 'getPhysicalFilename',
					message: 'Use `context.physicalFilename`'
				},
				{ object: 'context', property: 'getCwd', message: 'Use `context.cwd`' },
				{ object: 'context', property: 'getScope', message: 'Use src/utils/compat.ts' },
				{ object: 'context', property: 'parserServices', message: 'Use src/utils/compat.ts' }
			],
			'internal/prefer-find-variable-safe': 'error'
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
			'no-sparse-arrays': 'off'
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
	},
	{
		files: ['eslint.config.mjs'],
		rules: {
			// Some ESLint plugins specify in repository root's package.json, so this rule should be disabled.
			'n/no-extraneous-import': 'off'
		}
	}
];
export default config;
