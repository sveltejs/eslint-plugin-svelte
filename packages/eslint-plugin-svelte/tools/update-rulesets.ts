import path from 'path';
import { rules } from './lib/load-rules.js';
import { writeAndFormat } from './lib/write.js';
import type { ConfigName } from '../src/types.js';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

// ------------------
// Flat Config
// ------------------

const baseContent = `\
/*
 * IMPORTANT!
 * This file has been automatically generated,
 * in order to update its content execute "pnpm run update"
 */
import type { ESLint, Linter } from 'eslint';
import * as parser from 'svelte-eslint-parser';
let pluginObject: ESLint.Plugin | null = null;
export function setPluginObject(plugin: ESLint.Plugin): void {
	pluginObject = plugin;
}
const config: Linter.Config[] = [
  {
    name: 'svelte:base:setup-plugin',
    plugins: {
      get svelte(): ESLint.Plugin {
        return pluginObject!;
      }
    },
  },
  {
    name: 'svelte:base:setup-for-svelte',
    files: ["*.svelte", "**/*.svelte"],
    languageOptions: {
      parser: parser,
    },
    rules: {
      // ESLint core rules known to cause problems with \`.svelte\`.
      "no-inner-declarations": "off", // The AST generated by svelte-eslint-parser will false positives in it rule because the root node of the script is not the \`Program\`.
      // "no-irregular-whitespace": "off",
      // Self assign is one of way to update reactive value in Svelte.
      "no-self-assign": "off",

      // eslint-plugin-svelte rules
      ${rules
				.filter((rule) => rule.meta.docs.configNames.includes('base') && !rule.meta.deprecated)
				.map((rule) => {
					const conf = rule.meta.docs.default || 'error';
					return `"${rule.meta.docs.ruleId}": "${conf}"`;
				})
				.join(',\n        ')},
    },
		processor: 'svelte/svelte'
  },
]
export default config
`;

const baseFilePath = path.resolve(__dirname, '../src/configs/flat/base.ts');

// Update file.
void writeAndFormat(baseFilePath, baseContent);

const configNames: ConfigName[] = [
	'recommended',
	'recommended-svelte3-4',
	'recommended-svelte5-without-legacy'
];

for (const configName of configNames) {
	const filteredRules = rules.filter(
		(rule) => rule.meta.docs.configNames.includes(configName) && !rule.meta.deprecated
	);
	if (filteredRules.length === 0) {
		continue;
	}

	const content = `/*
 * IMPORTANT!
 * This file has been automatically generated,
 * in order to update its content execute "pnpm run update"
 */
import type { Linter } from 'eslint';
import base from "./base.js"
const config: Linter.Config[] = [
  ...base,
  {
    name: 'svelte:${configName}:rules',
    rules: {
      // eslint-plugin-svelte rules
      ${filteredRules
				.map((rule) => {
					const conf = rule.meta.docs.default || 'error';
					return `"${rule.meta.docs.ruleId}": "${conf}"`;
				})
				.join(',\n    ')},
    },
  }
]
export default config
`;

	const recommendedFilePath = path.resolve(__dirname, `../src/configs/flat/${configName}.ts`);

	// Update file.
	void writeAndFormat(recommendedFilePath, content);
}

const prettierContent = `/*
 * IMPORTANT!
 * This file has been automatically generated,
 * in order to update its content execute "pnpm run update"
 */
import type { Linter } from 'eslint';
import base from "./base.js"
const config: Linter.Config[] = [
  ...base,
  {
    name: 'svelte:prettier:turn-off-rules',
    rules: {
      // eslint-plugin-svelte rules
      ${rules
				.filter((rule) => rule.meta.docs.conflictWithPrettier)
				.map((rule) => `"${rule.meta.docs.ruleId}": "off"`)
				.join(',\n    ')},
    },
  }
]
export default config
`;

const prettierFilePath = path.resolve(__dirname, '../src/configs/flat/prettier.ts');

// Update file.
void writeAndFormat(prettierFilePath, prettierContent);
