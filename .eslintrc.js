'use strict';

// const version = require("./package.json").version

module.exports = {
	parserOptions: {
		sourceType: 'script',
		ecmaVersion: 'latest',
		project: require.resolve('./tsconfig.json')
	},
	extends: [
		'plugin:@ota-meshi/recommended',
		'plugin:@ota-meshi/+node',
		'plugin:@ota-meshi/+typescript',
		'plugin:@ota-meshi/+eslint-plugin',
		'plugin:@ota-meshi/+package-json',
		'plugin:@ota-meshi/+json',
		'plugin:@ota-meshi/+yaml',
		'plugin:@ota-meshi/+md',
		'plugin:@ota-meshi/+prettier'
	],
	rules: {
		'require-jsdoc': 'off',
		'no-warning-comments': 'warn',
		'no-lonely-if': 'off',
		'new-cap': 'off',
		'no-shadow': 'off',
		'no-void': ['error', { allowAsStatement: true }],
		'prettier/prettier': [
			'error',
			{},
			{
				usePrettierrc: true
			}
		],
		'n/file-extension-in-import': 'off', // It's a plugin bug(?).
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
	},
	overrides: [
		{
			files: ['*.md'],
			extends: 'plugin:mdx/recommended',
			settings: {
				'mdx/code-blocks': true
			}
		},
		{
			files: ['*.mjs'],
			parserOptions: {
				sourceType: 'module'
			}
		},
		{
			files: ['*.svelte'],
			extends: ['plugin:svelte/base'],
			parser: 'svelte-eslint-parser',
			parserOptions: {
				parser: {
					ts: '@typescript-eslint/parser',
					js: 'espree'
				}
			}
		},
		{
			files: ['*.ts', '*.mts'],
			parser: '@typescript-eslint/parser',
			parserOptions: {
				sourceType: 'module',
				project: require.resolve('./tsconfig.json')
			},
			rules: {
				'@typescript-eslint/naming-convention': [
					'error',
					{
						selector: 'default',
						format: ['camelCase'],
						leadingUnderscore: 'allow',
						trailingUnderscore: 'allow'
					},
					{
						selector: 'variable',
						format: ['camelCase', 'UPPER_CASE'],
						leadingUnderscore: 'allow',
						trailingUnderscore: 'allow'
					},
					{
						selector: 'typeLike',
						format: ['PascalCase']
					},
					{
						selector: 'property',
						format: null
					},
					{
						selector: 'method',
						format: null
					},
					{
						selector: 'import',
						format: null
					}
				],
				'@typescript-eslint/no-non-null-assertion': 'off'
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
			files: ['src/rules/**'],
			rules: {}
		},
		{
			files: ['tests/**'],
			rules: {
				'@typescript-eslint/no-misused-promises': 'off'
			}
		},
		{
			files: ['scripts/**/*.ts', 'tests/**/*.ts'],
			parser: '@typescript-eslint/parser',
			parserOptions: {
				sourceType: 'module',
				project: require.resolve('./tsconfig.json')
			},
			rules: {
				'no-console': 'off'
			}
		}
	]
};
