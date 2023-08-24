module.exports = {
	parserOptions: {
		sourceType: 'module',
		project: null
	},
	overrides: [
		{
			files: ['*output.svelte'],
			rules: {
				'prettier/prettier': 'off'
			}
		},
		{
			files: ['*errors.yaml'],
			rules: {
				'yml/no-tab-indent': 'off'
			}
		}
	],
	rules: {
		'no-undef': 'off',
		'require-jsdoc': 'off',
		'no-inner-declarations': 'off',
		'no-unused-vars': 'off',
		'no-empty-function': 'off',
		'one-var': 'off',
		'func-style': 'off',
		'no-console': 'off',
		'no-use-before-define': 'off',
		'n/no-unsupported-features/es-syntax': 'off',

		'@typescript-eslint/await-thenable': 'off',
		'@typescript-eslint/no-floating-promises': 'off',
		'@typescript-eslint/no-for-in-array': 'off',
		'@typescript-eslint/no-implied-eval': 'off',
		'@typescript-eslint/no-misused-promises': 'off',
		'@typescript-eslint/no-unnecessary-type-assertion': 'off',
		'@typescript-eslint/no-unsafe-argument': 'off',
		'@typescript-eslint/no-unsafe-assignment': 'off',
		'@typescript-eslint/no-unsafe-call': 'off',
		'@typescript-eslint/no-unsafe-member-access': 'off',
		'@typescript-eslint/no-unsafe-return': 'off',
		'@typescript-eslint/require-await': 'off',
		'@typescript-eslint/restrict-plus-operands': 'off',
		'@typescript-eslint/restrict-template-expressions': 'off',
		'@typescript-eslint/unbound-method': 'off',
		'@typescript-eslint/no-unnecessary-qualifier': 'off',
		'@typescript-eslint/no-unnecessary-type-arguments': 'off',
		'@typescript-eslint/prefer-includes': 'off',
		'@typescript-eslint/prefer-readonly': 'off',
		'@typescript-eslint/prefer-regexp-exec': 'off',
		'@typescript-eslint/prefer-string-starts-ends-with': 'off',
		'@typescript-eslint/require-array-sort-compare': 'off'
	}
};
